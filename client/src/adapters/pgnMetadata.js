import { Chess } from "chess.js";

/**
 * Reads what a PGN says about itself (players, ratings, result, clock, opening, length and
 * final position) so the submit and game-detail screens can show it. Client-only: nothing
 * here is sent to or stored by the server, and every field is null when the file lacks it.
 */

function cleanHeader(value) {
  const text = String(value ?? "").trim();
  if (!text || /^[?.\s-]*$/.test(text)) return null;
  return text;
}

function toRating(value) {
  const rating = Number.parseInt(cleanHeader(value) ?? "", 10);
  return Number.isFinite(rating) && rating > 0 ? rating : null;
}

/** `2026.08.10` → Date parts, or null for unknown/partial dates. */
function toPlayedDate(value) {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(cleanHeader(value) ?? "");
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Chess.com gives the opening only as a URL slug; Lichess sends an `Opening` header. */
function toOpeningName(headers) {
  const named = cleanHeader(headers.Opening);
  if (named) return named;

  const url = cleanHeader(headers.ECOUrl);
  if (!url) return null;
  const slug = url.split("/").filter(Boolean).pop() ?? "";
  const words = [];
  for (const word of slug.split("-")) {
    if (/^\d/.test(word)) break;
    words.push(word);
  }
  return words.length > 0 ? words.join(" ") : null;
}

/**
 * Maps a PGN `TimeControl` header to the submit form's categories.
 * Estimated duration = base + 40 × increment (the usual convention).
 */
export function timeControlCategory(timeControlHeader) {
  const text = cleanHeader(timeControlHeader);
  if (!text) return null;
  if (text.includes("/")) return "daily";

  const match = /^(\d+)(?:\+(\d+))?$/.exec(text);
  if (!match) return null;
  const estimate = Number(match[1]) + 40 * Number(match[2] ?? 0);
  if (estimate < 180) return "bullet";
  if (estimate < 600) return "blitz";
  if (estimate <= 1800) return "rapid";
  return "classical";
}

/** `900+10` → `15+10`; `180` → `3+0`. Falls back to the raw header. */
export function formatClock(timeControlHeader) {
  const text = cleanHeader(timeControlHeader);
  if (!text) return null;
  const match = /^(\d+)(?:\+(\d+))?$/.exec(text);
  if (!match) return text;
  const base = Number(match[1]);
  const minutes = base % 60 === 0 ? String(base / 60) : (base / 60).toFixed(1).replace(/\.0$/, "");
  return `${minutes}+${match[2] ?? 0}`;
}

function guessColor(headers, chessUsername) {
  const username = String(chessUsername ?? "").trim().toLowerCase();
  if (!username) return null;
  if (String(headers.White ?? "").trim().toLowerCase() === username) return "white";
  if (String(headers.Black ?? "").trim().toLowerCase() === username) return "black";
  return null;
}

function guessOutcome(result, color) {
  if (!color || !result) return null;
  if (result === "1/2-1/2") return "draw";
  if (result === "1-0") return color === "white" ? "win" : "lose";
  if (result === "0-1") return color === "black" ? "win" : "lose";
  return null;
}

/**
 * @param {string} pgn
 * @param {{ chessUsername?: string | null }} [options]
 * @returns {null | {
 *   white: string | null, black: string | null, whiteElo: number | null, blackElo: number | null,
 *   averageRating: number | null, result: string | null, eco: string | null, opening: string | null,
 *   playedOn: Date | null, clock: string | null, category: string | null, plyCount: number,
 *   moveCount: number, finalFen: string, lastMove: string | null,
 *   guessedColor: "white" | "black" | null, guessedOutcome: "win" | "lose" | "draw" | null,
 * }} null when the PGN cannot be read or has no moves.
 */
export function readPgnMetadata(pgn, { chessUsername } = {}) {
  const text = String(pgn ?? "").trim();
  if (!text) return null;

  const chess = new Chess();
  try {
    chess.loadPgn(text);
  } catch {
    return null;
  }

  const history = chess.history();
  if (history.length === 0) return null;

  const headers = chess.getHeaders();
  const whiteElo = toRating(headers.WhiteElo);
  const blackElo = toRating(headers.BlackElo);
  const result = cleanHeader(headers.Result) === "*" ? null : cleanHeader(headers.Result);
  const guessedColor = guessColor(headers, chessUsername);
  const plyCount = history.length;
  const lastSan = history[plyCount - 1];
  const lastMoveNumber = Math.ceil(plyCount / 2);

  return {
    white: cleanHeader(headers.White),
    black: cleanHeader(headers.Black),
    whiteElo,
    blackElo,
    averageRating: whiteElo && blackElo ? Math.round((whiteElo + blackElo) / 2) : null,
    result,
    eco: cleanHeader(headers.ECO),
    opening: toOpeningName(headers),
    playedOn: toPlayedDate(headers.Date ?? headers.UTCDate),
    clock: formatClock(headers.TimeControl),
    category: timeControlCategory(headers.TimeControl),
    plyCount,
    moveCount: lastMoveNumber,
    finalFen: chess.fen(),
    lastMove: plyCount % 2 === 1 ? `${lastMoveNumber}. ${lastSan}` : `${lastMoveNumber}... ${lastSan}`,
    guessedColor,
    guessedOutcome: guessOutcome(result, guessedColor),
  };
}

export function formatPlayedOn(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
