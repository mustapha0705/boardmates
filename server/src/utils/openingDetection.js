const OPENING_PREFIXES = [
  { name: "Sicilian Defense", moves: ["e4", "c5"] },
  { name: "Sicilian Defense: Najdorf Variation", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"] },
  { name: "Sicilian Defense: Dragon Variation", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"] },
  { name: "Sicilian Defense: Alapin Variation", moves: ["e4", "c5", "c3"] },
  { name: "Open Game", moves: ["e4", "e5"] },
  { name: "Ruy Lopez", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"] },
  { name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"] },
  { name: "Scotch Game", moves: ["e4", "e5", "Nf3", "Nc6", "d4"] },
  { name: "Petrov's Defense", moves: ["e4", "e5", "Nf3", "Nf6"] },
  { name: "Ponziani Opening", moves: ["e4", "e5", "Nf3", "Nc6", "c3"] },
  { name: "King's Gambit", moves: ["e4", "e5", "f4"] },
  { name: "Vienna Game", moves: ["e4", "e5", "Nc3"] },
  { name: "French Defense", moves: ["e4", "e6"] },
  { name: "French Defense: Advance Variation", moves: ["e4", "e6", "d4", "d5", "e5"] },
  { name: "French Defense: Exchange Variation", moves: ["e4", "e6", "d4", "d5", "exd5"] },
  { name: "Caro-Kann Defense", moves: ["e4", "c6"] },
  { name: "Caro-Kann Defense: Advance Variation", moves: ["e4", "c6", "d4", "d5", "e5"] },
  { name: "Pirc Defense", moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"] },
  { name: "Modern Defense", moves: ["e4", "g6"] },
  { name: "Alekhine Defense", moves: ["e4", "Nf6"] },
  { name: "Scandinavian Defense", moves: ["e4", "d5"] },
  { name: "Nimzowitsch Defense", moves: ["e4", "Nc6"] },
  { name: "Queen's Gambit", moves: ["d4", "d5", "c4"] },
  { name: "Queen's Gambit Declined", moves: ["d4", "d5", "c4", "e6"] },
  { name: "Queen's Gambit Accepted", moves: ["d4", "d5", "c4", "dxc4"] },
  { name: "Slav Defense", moves: ["d4", "d5", "c4", "c6"] },
  { name: "Semi-Slav Defense", moves: ["d4", "d5", "c4", "e6", "Nc3", "c6"] },
  { name: "King's Indian Defense", moves: ["d4", "Nf6", "c4", "g6"] },
  { name: "Grunfeld Defense", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"] },
  { name: "Nimzo-Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"] },
  { name: "Queen's Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"] },
  { name: "Bogo-Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nf3", "Bb4+"] },
  { name: "Benoni Defense", moves: ["d4", "Nf6", "c4", "c5"] },
  { name: "Benko Gambit", moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"] },
  { name: "Dutch Defense", moves: ["d4", "f5"] },
  { name: "London System", moves: ["d4", "d5", "Nf3", "Nf6", "Bf4"] },
  { name: "Torre Attack", moves: ["d4", "Nf6", "Nf3", "e6", "Bg5"] },
  { name: "Catalan Opening", moves: ["d4", "Nf6", "c4", "e6", "g3"] },
  { name: "English Opening", moves: ["c4"] },
  { name: "Reti Opening", moves: ["Nf3"] },
  { name: "Bird Opening", moves: ["f4"] },
  { name: "Polish Opening", moves: ["b4"] },
  { name: "Larsen's Opening", moves: ["b3"] },
  { name: "Sokolsky Opening", moves: ["b4"] },
  { name: "Owen Defense", moves: ["e4", "b6"] },
  { name: "Philidor Defense", moves: ["e4", "e5", "Nf3", "d6"] },
  { name: "Three Knights Opening", moves: ["e4", "e5", "Nf3", "Nc6", "Nc3"] },
  { name: "Four Knights Game", moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"] },
];

function tokenizeMovesFromPgn(pgn) {
  if (!pgn || typeof pgn !== "string") return [];
  let body = pgn;

  body = body.replace(/\[[^\]]*]/g, " ");
  body = body.replace(/\{[^}]*}/g, " ");
  body = body.replace(/;[^\n\r]*/g, " ");
  body = body.replace(/\([^)]*\)/g, " ");
  body = body.replace(/\$\d+/g, " ");
  body = body.replace(/\d+\.(\.\.)?/g, " ");
  body = body.replace(/\s+/g, " ").trim();

  if (!body) return [];

  const raw = body.split(" ");
  const moves = [];
  for (const token of raw) {
    if (!token) continue;
    if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token)) break;
    if (/^(e\.p\.)$/i.test(token)) continue;
    if (/^(O-O|O-O-O|0-0|0-0-0|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?|[a-h]x?[a-h][1-8](=[QRBN])?[+#]?|[a-h][1-8][+#]?)$/.test(token)) {
      moves.push(token.replace(/^0-0-0$/, "O-O-O").replace(/^0-0$/, "O-O"));
    }
    if (moves.length >= 16) break;
  }
  return moves;
}

export function detectOpeningFromPgn(pgn) {
  const moves = tokenizeMovesFromPgn(pgn);
  if (!moves.length) return null;

  let best = null;
  for (const entry of OPENING_PREFIXES) {
    if (entry.moves.length > moves.length) continue;
    let ok = true;
    for (let i = 0; i < entry.moves.length; i += 1) {
      if (moves[i] !== entry.moves[i]) {
        ok = false;
        break;
      }
    }
    if (ok && (!best || entry.moves.length > best.moves.length)) {
      best = entry;
    }
  }

  return best?.name || null;
}

