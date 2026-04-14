const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.status === 204 ? null : res.json();
}

// ── Games ──

export function fetchGames({ cursor, status } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(`/games${qs ? `?${qs}` : ""}`);
}

export function fetchGame(id) {
  return request(`/games/${id}`);
}

export function createGame(data) {
  return request("/games", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function claimReview(gameId) {
  return request(`/games/${gameId}/claim`, { method: "POST" });
}

export function completeReview(gameId, analysisTree) {
  return request(`/games/${gameId}/complete`, {
    method: "POST",
    body: JSON.stringify({ analysis: analysisTree }),
  });
}

// ── Analysis / Comments ──

export function saveComment(gameId, nodeId, comment) {
  return request(`/games/${gameId}/comments`, {
    method: "POST",
    body: JSON.stringify({ nodeId, comment }),
  });
}

// ── Auth (Supabase-handled, but profile fetch goes through our API) ──

export function fetchProfile() {
  return request("/profile");
}

export function updateProfile(data) {
  return request("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
