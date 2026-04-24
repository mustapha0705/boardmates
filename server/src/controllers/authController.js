import { prisma } from "../../config/db.js";

const PLATFORMS = new Set(["chess_com", "lichess"]);

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

export async function signup(req, res) {
  try {
    const supabaseUser = req.authUser;

    const existing = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    const { chessUsername, platform } = normalizeSignupBody(req.body);

    if (!platform || !PLATFORMS.has(platform)) {
      return res.status(400).json({
        message: "Validation failed",
        errors: [{ field: "chessPlatform", message: "Choose Chess.com or Lichess" }],
      });
    }

    if (!chessUsername || chessUsername.length < 2) {
      return res.status(400).json({
        message: "Validation failed",
        errors: [{ field: "chessUsername", message: "Username is required (min 2 characters)" }],
      });
    }

    const displayName = chessUsername;

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          displayName,
          chessUsername,
          chessPlatform: platform,
        },
      });
      return res.status(200).json(formatUser(updated));
    }

    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        displayName,
        chessUsername,
        chessPlatform: platform,
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

    return res.status(200).json(formatUser(req.user));
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
      const u = chessUsername?.trim() || "";
      if (u.length < 2) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [{ field: "chessUsername", message: "Username must be at least 2 characters" }],
        });
      }
      updates.chessUsername = u;
      updates.displayName = u;
    }

    if (chessPlatform !== undefined) {
      const p = chessPlatform != null ? String(chessPlatform).trim() : "";
      if (!p || !PLATFORMS.has(p)) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [{ field: "chessPlatform", message: "Invalid platform" }],
        });
      }
      updates.chessPlatform = p;
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
    createdAt: user.createdAt,
  };
}
