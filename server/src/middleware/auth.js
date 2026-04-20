import supabaseAdmin from "../config/supabase.js";
import { prisma } from "../../config/db.js";

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

    const profile = await prisma.user.findUnique({
      where: { id: data.user.id },
    });

    req.authUser = data.user;
    req.user = profile;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Authentication failed" });
  }
}
