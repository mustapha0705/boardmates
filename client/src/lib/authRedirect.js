/**
 * Must match an entry in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
 * Set VITE_AUTH_EMAIL_REDIRECT_ORIGIN if you open the app as http://127.0.0.1:5173 but only
 * http://localhost:5173 is allowlisted (or the reverse).
 */
export function getAuthEmailRedirectTo() {
  const fromEnv = import.meta.env.VITE_AUTH_EMAIL_REDIRECT_ORIGIN;
  const base =
    (fromEnv != null && String(fromEnv).trim() !== ""
      ? String(fromEnv).trim()
      : typeof window !== "undefined"
        ? window.location.origin
        : ""
    ).replace(/\/$/, "");
  return base ? `${base}/` : "/";
}
