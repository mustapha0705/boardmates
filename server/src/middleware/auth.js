import supabaseAdmin from "../config/supabase.js";
import { prisma } from "../../config/db.js";

export function requireProfile(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ message: "Profile not found. Please complete signup first." });
  }
  next();
}

function displayNameFromAuthUser(authUser) {
  const meta = authUser.user_metadata || {};
  const raw =
    meta.display_name ||
    meta.displayName ||
    meta.full_name ||
    meta.name ||
    meta.preferred_username ||
    (authUser.email ? authUser.email.split("@")[0] : "") ||
    "Player";
  let name = String(raw).trim().slice(0, 80);
  if (name.length < 2) name = "Player";
  return name;
}

/**
 * Ensures a `users` row exists for this Supabase user (OAuth / email users may never call POST /auth/signup).
 * Uses upsert so concurrent first requests cannot leave the user without a row.
 */
async function ensureUserProfile(authUser) {
  const id = authUser.id;
  if (!id) {
    console.error("ensureUserProfile: missing Supabase user id");
    return null;
  }

  const displayName = displayNameFromAuthUser(authUser);
  const primaryEmail =
    authUser.email && authUser.email.trim().length > 0
      ? authUser.email.trim()
      : `${id}@users.local`;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) return existing;

  try {
    return await prisma.user.create({
      data: {
        id,
        email: primaryEmail,
        displayName,
        chessUsername: null,
        rating: null,
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      const byId = await prisma.user.findUnique({ where: { id } });
      if (byId) return byId;
      // Rare: email unique collision (e.g. race) — use a deterministic per-user email.
      try {
        return await prisma.user.create({
          data: {
            id,
            email: `${id}@users.local`,
            displayName,
            chessUsername: null,
            rating: null,
          },
        });
      } catch (err2) {
        if (err2.code === "P2002") {
          return prisma.user.findUnique({ where: { id } });
        }
        throw err2;
      }
    }
    throw err;
  }
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const authUser = data.user;
    let profile = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    // POST /api/auth/signup must create the row itself; do not auto-provision here or signup always sees "already exists".
    const pathKey = `${req.baseUrl || ""}${req.path || ""}`.replace(/\/+$/, "");
    const origKey = (req.originalUrl || "").split("?")[0].replace(/\/+$/, "");
    const isAuthSignup =
      req.method === "POST" &&
      (pathKey === "/api/auth/signup" || origKey === "/api/auth/signup");

    if (!isAuthSignup && !profile) {
      profile = await ensureUserProfile(authUser);
    }

    if (!isAuthSignup && !profile) {
      console.error("requireAuth: could not load or create user profile for id", authUser.id);
      return res.status(500).json({ message: "Could not load your account. Try again in a moment." });
    }

    req.authUser = authUser;
    req.user = profile;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Authentication failed" });
  }
}
