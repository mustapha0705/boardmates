import { prisma } from "../../config/db.js";
import { detectOpeningFromPgn } from "../utils/openingDetection.js";

const AUTHOR_SELECT = { id: true, displayName: true };
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

/** Prisma `Json` hit recursion limits on deep chess trees; we store a Text column of JSON. */
function serializeAnalysisTreeForDb(value) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function parseAnalysisTreeFromDb(stored) {
  if (stored == null) return null;
  if (typeof stored === "object" && !Array.isArray(stored)) {
    return stored;
  }
  if (typeof stored !== "string") return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function clampLimit(raw) {
  const n = parseInt(raw, 10) || DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

function formatGame(game, { includePgn = false, includeComments = false, includeAnalysisTree = false } = {}) {
  const out = {
    id: game.id,
    title: game.title,
    status: game.status,
    timeControl: game.timeControl,
    averageRating: game.averageRating,
    reviewNotes: game.reviewNotes,
    submittedAt: game.createdAt,
    claimedAt: game.claimedAt,
    completedAt: game.completedAt,
    author: game.author,
    reviewer: game.reviewer || null,
  };

  if (includePgn) out.pgn = game.pgn;

  if (includeAnalysisTree && game.analysisTree != null) {
    out.analysisTree = parseAnalysisTreeFromDb(game.analysisTree);
  }

  if (includeComments && game.comments) {
    out.comments = game.comments.map((c) => ({
      id: c.id,
      ply: c.ply,
      san: c.san,
      comment: c.comment,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  return out;
}

// ─── CRUD ────────────────────────────────────────────────────────────

export async function listGames(req, res) {
  try {
    const limit = clampLimit(req.query.limit);
    const { cursor, status } = req.query;

    const where = {};

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      where.status = { in: statuses };
    }

    if (cursor) {
      const cursorGame = await prisma.game.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      });

      if (cursorGame) {
        where.OR = [
          { createdAt: { lt: cursorGame.createdAt } },
          { createdAt: cursorGame.createdAt, id: { lt: cursor } },
        ];
      }
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: {
        author: { select: AUTHOR_SELECT },
        reviewer: { select: AUTHOR_SELECT },
      },
    });

    const hasMore = games.length > limit;
    const page = hasMore ? games.slice(0, limit) : games;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return res.json({
      games: page.map((g) => formatGame(g)),
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error("listGames error:", err);
    return res.status(500).json({ message: "Failed to fetch games" });
  }
}

export async function getGame(req, res) {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: AUTHOR_SELECT },
        reviewer: { select: AUTHOR_SELECT },
        comments: { orderBy: { ply: "asc" } },
      },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    return res.json(
      formatGame(game, { includePgn: true, includeComments: true, includeAnalysisTree: true }),
    );
  } catch (err) {
    console.error("getGame error:", err);
    return res.status(500).json({ message: "Failed to fetch game" });
  }
}

export async function createGame(req, res) {
  try {
    const { title, pgn, timeControl, averageRating, reviewNotes } = req.body;
    const errors = [];

    if (!pgn?.trim()) errors.push({ field: "pgn", message: "PGN is required" });
    if (!timeControl?.trim()) errors.push({ field: "timeControl", message: "Time control is required" });

    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const cleanPgn = pgn.trim();
    const cleanTimeControl = timeControl.trim();
    const customTitle = typeof title === "string" ? title.trim() : "";
    const detectedOpening = detectOpeningFromPgn(cleanPgn);
    const resolvedTitle = customTitle || detectedOpening || `Game · ${cleanTimeControl}`;

    const game = await prisma.game.create({
      data: {
        title: resolvedTitle,
        pgn: cleanPgn,
        timeControl: cleanTimeControl,
        averageRating: averageRating ? parseInt(averageRating, 10) : null,
        reviewNotes: reviewNotes?.trim() || null,
        authorId: req.user.id,
      },
      include: {
        author: { select: AUTHOR_SELECT },
        reviewer: { select: AUTHOR_SELECT },
      },
    });

    return res.status(201).json(formatGame(game, { includePgn: true }));
  } catch (err) {
    console.error("createGame error:", err);
    return res.status(500).json({ message: "Failed to create game" });
  }
}

export async function updateGame(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.authorId !== req.user.id) return res.status(403).json({ message: "Only the author can edit this game" });
    if (game.status !== "pending") return res.status(409).json({ message: "Can only edit a game while it is pending" });

    const { title, reviewNotes, timeControl, averageRating } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: "Validation failed", errors: [{ field: "title", message: "Title cannot be empty" }] });
      updates.title = title.trim();
    }
    if (reviewNotes !== undefined) updates.reviewNotes = reviewNotes?.trim() || null;
    if (timeControl !== undefined) updates.timeControl = timeControl.trim();
    if (averageRating !== undefined) updates.averageRating = averageRating ? parseInt(averageRating, 10) : null;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updated = await prisma.game.update({
      where: { id: game.id },
      data: updates,
      include: {
        author: { select: AUTHOR_SELECT },
        reviewer: { select: AUTHOR_SELECT },
      },
    });

    return res.json(formatGame(updated, { includePgn: true }));
  } catch (err) {
    console.error("updateGame error:", err);
    return res.status(500).json({ message: "Failed to update game" });
  }
}

export async function deleteGame(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.authorId !== req.user.id) return res.status(403).json({ message: "Only the author can delete this game" });
    if (game.status !== "pending") return res.status(409).json({ message: "Cannot delete a game that is in review or completed" });

    await prisma.game.delete({ where: { id: game.id } });

    return res.status(204).end();
  } catch (err) {
    console.error("deleteGame error:", err);
    return res.status(500).json({ message: "Failed to delete game" });
  }
}

// ─── Review Workflow ─────────────────────────────────────────────────

export async function claimGame(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.authorId === req.user.id) return res.status(403).json({ message: "You cannot review your own game" });
    if (game.status !== "pending") return res.status(409).json({ message: "Game is already being reviewed" });

    const updated = await prisma.game.update({
      where: { id: game.id },
      data: {
        status: "in_review",
        reviewerId: req.user.id,
        claimedAt: new Date(),
      },
      include: {
        author: { select: AUTHOR_SELECT },
        reviewer: { select: AUTHOR_SELECT },
      },
    });

    return res.json(formatGame(updated));
  } catch (err) {
    console.error("claimGame error:", err);
    return res.status(500).json({ message: "Failed to claim game" });
  }
}

export async function completeReview(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.status !== "in_review") return res.status(409).json({ message: "Game is not in review" });
    if (game.reviewerId !== req.user.id) return res.status(403).json({ message: "Only the assigned reviewer can complete this review" });

    const { analysisTree } = req.body || {};
    const data = {
      status: "completed",
      completedAt: new Date(),
    };
    if (analysisTree != null && typeof analysisTree === "object" && !Array.isArray(analysisTree)) {
      const stored = serializeAnalysisTreeForDb(analysisTree);
      if (stored) data.analysisTree = stored;
    }

    const updated = await prisma.game.update({
      where: { id: game.id },
      data,
      include: {
        author: { select: AUTHOR_SELECT },
        reviewer: { select: AUTHOR_SELECT },
        comments: { orderBy: { ply: "asc" } },
      },
    });

    return res.json(
      formatGame(updated, { includePgn: true, includeComments: true, includeAnalysisTree: true }),
    );
  } catch (err) {
    console.error("completeReview error:", err);
    return res.status(500).json({ message: "Failed to complete review" });
  }
}

export async function unclaimGame(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.status !== "in_review") return res.status(409).json({ message: "Game is not in review" });
    if (game.reviewerId !== req.user.id) return res.status(403).json({ message: "Only the assigned reviewer can unclaim this game" });

    const updated = await prisma.game.update({
      where: { id: game.id },
      data: {
        status: "pending",
        reviewerId: null,
        claimedAt: null,
      },
      include: {
        author: { select: AUTHOR_SELECT },
        reviewer: { select: AUTHOR_SELECT },
      },
    });

    return res.json(formatGame(updated));
  } catch (err) {
    console.error("unclaimGame error:", err);
    return res.status(500).json({ message: "Failed to unclaim game" });
  }
}

// ─── Review Comments / analysis draft (in_review) ────────────────────

const GAME_EAGER = {
  author: { select: AUTHOR_SELECT },
  reviewer: { select: AUTHOR_SELECT },
  comments: { orderBy: { ply: "asc" } },
};

function isValidAnalysisTreePayload(value) {
  return value != null && typeof value === "object" && !Array.isArray(value) && "fen" in value;
}

async function persistAnalysisTreeDraft(gameId, tree) {
  if (!isValidAnalysisTreePayload(tree)) return;
  const stored = serializeAnalysisTreeForDb(tree);
  if (!stored) return;
  await prisma.game.update({
    where: { id: gameId },
    data: { analysisTree: stored },
  });
}

export async function saveReviewAnalysisDraft(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.status !== "in_review") {
      return res.status(409).json({ message: "Analysis can only be updated while the game is in review" });
    }
    if (game.reviewerId !== req.user.id) {
      return res.status(403).json({ message: "Only the assigned reviewer can update the analysis" });
    }

    const raw = req.body?.analysisTree;
    const analysisTree =
      typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
    if (!isValidAnalysisTreePayload(analysisTree)) {
      return res.status(400).json({ message: "analysisTree (object with root fen) is required" });
    }

    await persistAnalysisTreeDraft(game.id, analysisTree);

    const fresh = await prisma.game.findUnique({
      where: { id: game.id },
      include: GAME_EAGER,
    });

    return res.json(
      formatGame(fresh, { includePgn: true, includeComments: true, includeAnalysisTree: true }),
    );
  } catch (err) {
    console.error("saveReviewAnalysisDraft error:", err);
    return res.status(500).json({ message: "Failed to save analysis" });
  }
}

async function fetchGameForClient(id) {
  return prisma.game.findUnique({
    where: { id },
    include: GAME_EAGER,
  });
}

// ─── Review Comments ─────────────────────────────────────────────────

export async function listComments(req, res) {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!game) return res.status(404).json({ message: "Game not found" });

    const comments = await prisma.reviewComment.findMany({
      where: { gameId: game.id },
      orderBy: { ply: "asc" },
    });

    return res.json({
      comments: comments.map((c) => ({
        id: c.id,
        ply: c.ply,
        san: c.san,
        comment: c.comment,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (err) {
    console.error("listComments error:", err);
    return res.status(500).json({ message: "Failed to fetch comments" });
  }
}

export async function upsertComment(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.status !== "in_review") return res.status(409).json({ message: "Comments can only be added while the game is in review" });
    if (game.reviewerId !== req.user.id) return res.status(403).json({ message: "Only the assigned reviewer can add comments" });

    const { ply, san, comment, analysisTree: bodyAnalysisTree } = req.body;

    if (ply === undefined || ply === null) {
      return res.status(400).json({ message: "Validation failed", errors: [{ field: "ply", message: "ply is required" }] });
    }

    // Empty comment = delete
    if (!comment || !comment.trim()) {
      const existing = await prisma.reviewComment.findUnique({
        where: { gameId_ply_san: { gameId: game.id, ply, san: san || null } },
      });

      if (existing) {
        await prisma.reviewComment.delete({ where: { id: existing.id } });
      }

      if (isValidAnalysisTreePayload(bodyAnalysisTree)) {
        await persistAnalysisTreeDraft(game.id, bodyAnalysisTree);
      }

      const full = await fetchGameForClient(req.params.id);
      return res.json({
        deleted: true,
        ply,
        san: san || null,
        game: formatGame(full, { includePgn: true, includeComments: true, includeAnalysisTree: true }),
      });
    }

    const result = await prisma.reviewComment.upsert({
      where: { gameId_ply_san: { gameId: game.id, ply, san: san || null } },
      create: {
        gameId: game.id,
        reviewerId: req.user.id,
        ply,
        san: san || null,
        comment: comment.trim(),
      },
      update: {
        comment: comment.trim(),
      },
    });

    if (isValidAnalysisTreePayload(bodyAnalysisTree)) {
      await persistAnalysisTreeDraft(game.id, bodyAnalysisTree);
    }

    const full = await fetchGameForClient(req.params.id);

    return res.json({
      id: result.id,
      ply: result.ply,
      san: result.san,
      comment: result.comment,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      game: formatGame(full, { includePgn: true, includeComments: true, includeAnalysisTree: true }),
    });
  } catch (err) {
    console.error("upsertComment error:", err);
    return res.status(500).json({ message: "Failed to save comment" });
  }
}
