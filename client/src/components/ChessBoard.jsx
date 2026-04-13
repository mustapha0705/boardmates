import { useRef, useEffect, useState } from "react";
import { Chess } from "chess.js";

const PIECE_THEME =
  "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png";

const SkipBack = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="19 20 9 12 19 4" />
    <line x1="5" y1="4" x2="5" y2="20" />
  </svg>
);
const StepBack = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const StepForward = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const SkipForward = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="5 20 15 12 5 4" />
    <line x1="19" y1="4" x2="19" y2="20" />
  </svg>
);

export default function ChessBoard() {
  const boardElRef = useRef(null);
  const boardRef = useRef(null);
  const gameRef = useRef(new Chess());
  const stateRef = useRef(null);

  const [fens, setFens] = useState(() => [gameRef.current.fen()]);
  const [moves, setMoves] = useState([]);
  const [viewIndex, setViewIndex] = useState(0);

  // Keep a mutable ref in sync so chessboard.js closures always see fresh state
  stateRef.current = { viewIndex, fensLength: fens.length };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // jQuery must be on window before chessboard.js evaluates
      const jQuery = (await import("jquery")).default;
      window.jQuery = window.$ = jQuery;

      await import(
        "@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.css"
      );
      await import(
        "@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.js"
      );

      if (cancelled) return;

      const game = gameRef.current;

      const board = window.Chessboard(boardElRef.current, {
        draggable: true,
        position: "start",
        pieceTheme: PIECE_THEME,

        onDragStart: (_source, piece) => {
          const { viewIndex: vi, fensLength } = stateRef.current;
          if (vi !== fensLength - 1) return false;
          if (game.isGameOver()) return false;
          if (
            (game.turn() === "w" && piece.startsWith("b")) ||
            (game.turn() === "b" && piece.startsWith("w"))
          )
            return false;
        },

        onDrop: (source, target) => {
          try {
            const move = game.move({
              from: source,
              to: target,
              promotion: "q",
            });
            if (!move) return "snapback";
          } catch {
            return "snapback";
          }

          setFens((prev) => [...prev, game.fen()]);
          setMoves([...game.history()]);
          setViewIndex(game.history().length);
        },

        onSnapEnd: () => {
          board.position(game.fen());
        },
      });

      boardRef.current = board;
    }

    init();

    return () => {
      cancelled = true;
      if (boardRef.current) {
        boardRef.current.destroy();
        boardRef.current = null;
      }
    };
  }, []);

  // Sync the visible board position when navigating through history
  useEffect(() => {
    if (boardRef.current && fens[viewIndex]) {
      boardRef.current.position(fens[viewIndex], false);
    }
  }, [viewIndex, fens]);

  function goToFirst() {
    setViewIndex(0);
  }
  function goToPrev() {
    setViewIndex((i) => Math.max(0, i - 1));
  }
  function goToNext() {
    setViewIndex((i) => Math.min(fens.length - 1, i + 1));
  }
  function goToLast() {
    setViewIndex(fens.length - 1);
  }

  function getMoveLabel() {
    if (viewIndex === 0) return "Start";
    const moveNum = Math.ceil(viewIndex / 2);
    const dot = viewIndex % 2 === 1 ? "." : "...";
    return `${moveNum}${dot} ${moves[viewIndex - 1]}`;
  }

  return (
    <div className="board-card">
      <div className="board-wrapper">
        <div ref={boardElRef} style={{ width: "100%" }} />
      </div>

      <div className="board-controls">
        <button className="ctrl-btn" title="First move" onClick={goToFirst}>
          <SkipBack />
        </button>
        <button className="ctrl-btn" title="Previous move" onClick={goToPrev}>
          <StepBack />
        </button>

        <div className="move-indicator">
          <span className="move-dot" />
          {getMoveLabel()}
        </div>

        <button className="ctrl-btn" title="Next move" onClick={goToNext}>
          <StepForward />
        </button>
        <button className="ctrl-btn" title="Last move" onClick={goToLast}>
          <SkipForward />
        </button>
      </div>
    </div>
  );
}
