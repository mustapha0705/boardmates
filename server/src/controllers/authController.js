import { prisma } from "../../config/db.js";

export async function signup(req, res) {
  try {
    const supabaseUser = req.authUser;

    const existing = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (existing) {
      return res.status(409).json({ message: "Profile already exists" });
    }

    const { displayName, chessUsername, rating } = req.body;

    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({
        message: "Validation failed",
        errors: [{ field: "displayName", message: "Display name is required (min 2 characters)" }],
      });
    }

    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        displayName: displayName.trim(),
        chessUsername: chessUsername?.trim() || null,
        rating: rating ? parseInt(rating, 10) : null,
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

    const { displayName, chessUsername, rating } = req.body;
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
      updates.chessUsername = chessUsername?.trim() || null;
    }

    if (rating !== undefined) {
      updates.rating = rating ? parseInt(rating, 10) : null;
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
    rating: user.rating,
    createdAt: user.createdAt,
  };
}
