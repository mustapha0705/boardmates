import { prisma } from "../../config/db.js";

const PLATFORMS = new Set(["chess_com", "lichess"]);
const USER_AGENT = "boardmates-app/1.0";
const RATING_REFRESH_MS = 1000 * 60 * 60 * 6; // 6 hours
const lastRatingRefreshAt = new Map();

function normalizeSignupBody(body) {
  const rawPlatform = body.chessPlatform ?? body.chess_platform;
  const chessUsername =
    body.chessUsername != null
      ? String(body.chessUsername).trim()
      : body.chess_username != null
        ? String(body.chess_username).trim()
        : "";

  const platform =
    rawPlatform != null && String(rawPlatform).trim() !== "" ? String(rawPlatform).trim() : null;

  return { chessUsername, platform };
}

function normalizeChessUsername(value) {
  return String(value || "").trim().toLowerCase();
}

async function verifyChessUsername(platform, username) {
  if (platform === "chess_com") {
    const playerRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (playerRes.status === 404) return { valid: false };
    if (!playerRes.ok) throw new Error(`Chess.com lookup failed (${playerRes.status})`);

    const statsRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!statsRes.ok) throw new Error(`Chess.com stats lookup failed (${statsRes.status})`);
    const stats = await statsRes.json();
    const rapidRating = Number.isFinite(stats?.chess_rapid?.last?.rating)
      ? Number(stats.chess_rapid.last.rating)
      : null;

    return { valid: true, rapidRating };
  }

  if (platform === "lichess") {
    const res = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (res.status === 404) return { valid: false };
    if (!res.ok) throw new Error(`Lichess lookup failed (${res.status})`);
    const body = await res.json();
    const rapidRating = Number.isFinite(body?.perfs?.rapid?.rating)
      ? Number(body.perfs.rapid.rating)
      : null;

    return { valid: true, rapidRating };
  }

  return { valid: false };
}

async function isChessUsernameRegistered(chessUsername, excludedUserId = null) {
  const existing = await prisma.user.findFirst({
    where: excludedUserId
      ? { chessUsername, NOT: { id: excludedUserId } }
      : { chessUsername },
    select: { id: true },
  });
  return Boolean(existing);
}

function validationError(message, field = "chessUsername") {
  return {
    message: "Validation failed",
    errors: [{ field, message }],
  };
}

export async function validateChessUsername(req, res) {
  try {
    const { chessUsername, platform } = normalizeSignupBody(req.body);
    const normalized = normalizeChessUsername(chessUsername);

    if (!platform || !PLATFORMS.has(platform)) {
      return res.status(400).json(validationError("Choose Chess.com or Lichess", "chessPlatform"));
    }
    if (!normalized || normalized.length < 2) {
      return res.status(400).json(validationError("Username is required (min 2 characters)"));
    }

    const verification = await verifyChessUsername(platform, normalized);
    if (!verification.valid) {
      return res.status(400).json(
        validationError(`We couldn't find that username on ${platform === "chess_com" ? "Chess.com" : "Lichess"}. Please check and try again.`),
      );
    }

    const exists = await isChessUsernameRegistered(normalized);
    if (exists) {
      return res
        .status(409)
        .json(validationError("This chess account is already linked to a Boardmates account."));
    }

    return res.status(200).json({
      chessUsername: normalized,
      rapidRating: verification.rapidRating,
    });
  } catch (err) {
    console.error("validateChessUsername error:", err);
    return res.status(502).json({
      message: "Could not verify chess username right now. Please try again.",
    });
  }
}

export async function signup(req, res) {
  try {
    const supabaseUser = req.authUser;

    const existing = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    const { chessUsername, platform } = normalizeSignupBody(req.body);
    const normalizedChessUsername = normalizeChessUsername(chessUsername);

    if (!platform || !PLATFORMS.has(platform)) {
      return res.status(400).json(validationError("Choose Chess.com or Lichess", "chessPlatform"));
    }

    if (!normalizedChessUsername || normalizedChessUsername.length < 2) {
      return res.status(400).json(validationError("Username is required (min 2 characters)"));
    }

    const verification = await verifyChessUsername(platform, normalizedChessUsername);
    if (!verification.valid) {
      return res.status(400).json(
        validationError(`We couldn't find that username on ${platform === "chess_com" ? "Chess.com" : "Lichess"}. Please check and try again.`),
      );
    }

    const alreadyRegistered = await isChessUsernameRegistered(normalizedChessUsername, supabaseUser.id);
    if (alreadyRegistered) {
      return res
        .status(409)
        .json(validationError("This chess account is already linked to a Boardmates account."));
    }

    const displayName = normalizedChessUsername;

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          displayName,
          chessUsername: normalizedChessUsername,
          chessPlatform: platform,
          rapidRating: verification.rapidRating,
        },
      });
      return res.status(200).json(formatUser(updated));
    }

    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        displayName,
        chessUsername: normalizedChessUsername,
        chessPlatform: platform,
        rapidRating: verification.rapidRating,
      },
    });

    return res.status(201).json(formatUser(user));
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Failed to create profile" });
  }
}

export async function getProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "Profile not found. Please complete signup." });
    }

    let user = req.user;
    const hasChessIdentity = !!user.chessUsername && !!user.chessPlatform;

    if (hasChessIdentity) {
      const now = Date.now();
      const last = lastRatingRefreshAt.get(user.id) || 0;
      const shouldRefresh = now - last >= RATING_REFRESH_MS;

      if (shouldRefresh) {
        lastRatingRefreshAt.set(user.id, now);
        try {
          const verification = await verifyChessUsername(user.chessPlatform, user.chessUsername);
          if (verification.valid && verification.rapidRating !== user.rapidRating) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { rapidRating: verification.rapidRating },
            });
          }
        } catch (refreshErr) {
          // Keep profile endpoint resilient even if chess APIs are temporarily unavailable.
          console.warn("Rapid rating refresh skipped:", refreshErr?.message || refreshErr);
        }
      }
    }

    return res.status(200).json(formatUser(user));
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}

export async function updateProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { displayName, chessUsername, chessPlatform } = req.body;
    const updates = {};

    if (displayName !== undefined) {
      if (displayName.trim().length < 2) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [{ field: "displayName", message: "Display name must be at least 2 characters" }],
        });
      }
      updates.displayName = displayName.trim();
    }

    if (chessUsername !== undefined) {
      const u = normalizeChessUsername(chessUsername);
      if (u.length < 2) {
        return res.status(400).json(validationError("Username must be at least 2 characters"));
      }
      const platformForVerification = chessPlatform ?? req.user.chessPlatform;
      if (!platformForVerification || !PLATFORMS.has(platformForVerification)) {
        return res.status(400).json(validationError("Choose Chess.com or Lichess", "chessPlatform"));
      }

      const verification = await verifyChessUsername(platformForVerification, u);
      if (!verification.valid) {
        return res.status(400).json(
          validationError(`We couldn't find that username on ${platformForVerification === "chess_com" ? "Chess.com" : "Lichess"}. Please check and try again.`),
        );
      }

      const alreadyRegistered = await isChessUsernameRegistered(u, req.user.id);
      if (alreadyRegistered) {
        return res
          .status(409)
          .json(validationError("This chess account is already linked to a Boardmates account."));
      }

      updates.chessUsername = u;
      updates.displayName = u;
      updates.rapidRating = verification.rapidRating;
    }

    if (chessPlatform !== undefined) {
      const p = chessPlatform != null ? String(chessPlatform).trim() : "";
      if (!p || !PLATFORMS.has(p)) {
        return res.status(400).json(validationError("Invalid platform", "chessPlatform"));
      }
      updates.chessPlatform = p;

      if (updates.chessUsername || req.user.chessUsername) {
        const usernameToVerify = updates.chessUsername || req.user.chessUsername;
        const verification = await verifyChessUsername(p, usernameToVerify);
        if (!verification.valid) {
          return res.status(400).json(
            validationError(`We couldn't find that username on ${p === "chess_com" ? "Chess.com" : "Lichess"}. Please check and try again.`),
          );
        }
        updates.rapidRating = verification.rapidRating;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
    });

    return res.status(200).json(formatUser(user));
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    chessUsername: user.chessUsername,
    chessPlatform: user.chessPlatform,
    rapidRating: user.rapidRating,
    createdAt: user.createdAt,
  };
}
