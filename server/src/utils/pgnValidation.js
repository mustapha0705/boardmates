import { Chess } from "chess.js";

/**
 * Ensures text parses as PGN and contains at least one move in the main line.
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validatePlayablePgn(pgn) {
  const text = String(pgn ?? "").trim();
  if (!text) {
    return { ok: false, message: "PGN is empty." };
  }

  const chess = new Chess();
  try {
    chess.loadPgn(text);
  } catch {
    return {
      ok: false,
      message: "That doesn’t look like valid PGN. Paste or upload a real chess game export.",
    };
  }

  const moves = chess.history();
  if (moves.length === 0) {
    return {
      ok: false,
      message: "PGN must include at least one move (tags only are not enough).",
    };
  }

  return { ok: true };
}
