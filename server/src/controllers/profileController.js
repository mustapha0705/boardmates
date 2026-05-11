import { prisma } from "../../config/db.js";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const AUTHOR_SELECT = { id: true, displayName: true };

function clampLimit(raw) {
  const n = parseInt(raw, 10) || DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

export async function getStats(req, res) {
  try {
    const userId = req.user.id;

    const [submitted, reviewed, inProgress] = await Promise.all([
      prisma.game.count({ where: { authorId: userId } }),
      prisma.game.count({ where: { reviewerId: userId, status: "completed" } }),
      prisma.game.count({ where: { reviewerId: userId, status: "in_review" } }),
    ]);

    return res.json({ submitted, reviewed, inProgress });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
}

export async function getUserGames(req, res) {
  try {
    const userId = req.user.id;
    const limit = clampLimit(req.query.limit);
    const { cursor } = req.query;

    const where = { authorId: userId };

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
        reviewer: { select: AUTHOR_SELECT },
      },
    });

    const hasMore = games.length > limit;
    const page = hasMore ? games.slice(0, limit) : games;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return res.json({
      games: page.map((g) => ({
        id: g.id,
        title: g.title,
        status: g.status,
        isPrivate: Boolean(g.isPrivate),
        timeControl: g.timeControl,
        averageRating: g.averageRating,
        submittedAt: g.createdAt,
        reviewer: g.reviewer || null,
      })),
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error("getUserGames error:", err);
    return res.status(500).json({ message: "Failed to fetch user games" });
  }
}

export async function getUserReviews(req, res) {
  try {
    const userId = req.user.id;
    const limit = clampLimit(req.query.limit);
    const { cursor, status } = req.query;

    const where = { reviewerId: userId };

    if (status) {
      const allowed = ["in_review", "completed"];
      const statuses = status.split(",").map((s) => s.trim()).filter((s) => allowed.includes(s));
      if (statuses.length) where.status = { in: statuses };
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
      },
    });

    const hasMore = games.length > limit;
    const page = hasMore ? games.slice(0, limit) : games;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return res.json({
      games: page.map((g) => ({
        id: g.id,
        title: g.title,
        status: g.status,
        timeControl: g.timeControl,
        submittedAt: g.createdAt,
        claimedAt: g.claimedAt,
        author: g.author,
      })),
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error("getUserReviews error:", err);
    return res.status(500).json({ message: "Failed to fetch user reviews" });
  }
}
