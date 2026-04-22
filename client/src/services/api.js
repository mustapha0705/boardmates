import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const authHeaders = await getAuthHeaders();
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...options.headers,
  };

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

export function fetchGames({ cursor, limit, status } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", limit);
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

export function updateGame(id, data) {
  return request(`/games/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteGame(id) {
  return request(`/games/${id}`, { method: "DELETE" });
}

// ── Review Workflow ──

export function claimReview(gameId) {
  return request(`/games/${gameId}/claim`, { method: "POST" });
}

export function completeReview(gameId, body = {}) {
  return request(`/games/${gameId}/complete`, {
    method: "POST",
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });
}

export function unclaimReview(gameId) {
  return request(`/games/${gameId}/unclaim`, { method: "POST" });
}

// ── Comments ──

export function fetchComments(gameId) {
  return request(`/games/${gameId}/comments`);
}

export function upsertComment(gameId, { ply, san, comment }) {
  return request(`/games/${gameId}/comments`, {
    method: "PUT",
    body: JSON.stringify({ ply, san, comment }),
  });
}

// ── Profile ──

export function fetchProfile() {
  return request("/profile");
}

export function updateProfile(data) {
  return request("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function fetchProfileStats() {
  return request("/profile/stats");
}

export function fetchProfileGames({ cursor, limit } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", limit);
  const qs = params.toString();
  return request(`/profile/games${qs ? `?${qs}` : ""}`);
}

export function fetchProfileReviews({ cursor, limit, status } = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", limit);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(`/profile/reviews${qs ? `?${qs}` : ""}`);
}
