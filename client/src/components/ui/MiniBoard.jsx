/**
 * Static, decorative board used by the public landing page.
 * Renders a position from a FEN; it has no interaction and no engine features.
 * The interactive board (chess.js + chessboard.js) is untouched by this slice.
 */

const GLYPHS = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const FILES = "abcdefgh";

function parseFen(fen) {
  const board = String(fen ?? "").trim().split(/\s+/)[0];
  if (!board) return null;

  const ranks = board.split("/");
  if (ranks.length !== 8) return null;

  const squares = [];
  for (let rankIndex = 0; rankIndex < 8; rankIndex += 1) {
    let fileIndex = 0;
    for (const char of ranks[rankIndex]) {
      if (/[1-8]/.test(char)) {
        const empty = Number(char);
        for (let i = 0; i < empty; i += 1) {
          if (fileIndex > 7) return null;
          squares.push({ name: `${FILES[fileIndex]}${8 - rankIndex}`, piece: null, light: (fileIndex + rankIndex) % 2 === 0 });
          fileIndex += 1;
        }
      } else if (/[kqrbnp]/i.test(char)) {
        if (fileIndex > 7) return null;
        squares.push({ name: `${FILES[fileIndex]}${8 - rankIndex}`, piece: char, light: (fileIndex + rankIndex) % 2 === 0 });
        fileIndex += 1;
      } else {
        return null;
      }
    }
    if (fileIndex !== 8) return null;
  }

  return squares.length === 64 ? squares : null;
}

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function MiniBoard({ fen = START_FEN, highlight = [], flipped = false, label = "Chess position" }) {
  const squares = parseFen(fen) ?? parseFen(START_FEN);
  if (!squares) return null;

  const ordered = flipped ? [...squares].reverse() : squares;
  const highlighted = new Set(highlight);

  return (
    <div className="bm-board" role="img" aria-label={label}>
      {ordered.map((square) => {
        const isWhite = square.piece && square.piece === square.piece.toUpperCase();
        return (
          <div
            key={square.name}
            className={`bm-board__square ${square.light ? "bm-board__square--light" : "bm-board__square--dark"}`}
          >
            {highlighted.has(square.name) ? <span className="bm-board__highlight" aria-hidden="true" /> : null}
            {square.piece ? (
              <span
                className={`bm-board__piece ${isWhite ? "bm-board__piece--white" : "bm-board__piece--black"}`}
                aria-hidden="true"
              >
                {GLYPHS[square.piece.toLowerCase()]}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
