import { useRef, useEffect, useCallback } from "react";
import { Chess } from "chess.js";

const PIECE_THEME =
  "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png";

const SkipBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="19 20 9 12 19 4" />
    <line x1="5" y1="4" x2="5" y2="20" />
  </svg>
);
const StepBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const StepForward = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const SkipForward = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="5 20 15 12 5 4" />
    <line x1="19" y1="4" x2="19" y2="20" />
  </svg>
);

export default function ChessBoard({
  fen,
  onMove,
  onFirst,
  onPrev,
  onNext,
  onLast,
  moveLabel,
  readOnly = false,
}) {
  const boardElRef = useRef(null);
  const boardRef = useRef(null);
  const propsRef = useRef(null);
  const pendingFenRef = useRef(null);
  const selectedSquareRef = useRef(null);

  propsRef.current = { fen, onMove, readOnly };

  const clearHighlights = useCallback(() => {
    const el = boardElRef.current;
    if (!el) return;
    el.querySelectorAll(".square-highlight").forEach((sq) =>
      sq.classList.remove("square-highlight"),
    );
  }, []);

  const highlightSquare = useCallback((square) => {
    const el = boardElRef.current;
    if (!el) return;
    const sq = el.querySelector(`[data-square="${square}"]`);
    if (sq) sq.classList.add("square-highlight");
  }, []);

  useEffect(() => {
    const el = boardElRef.current;

    function handleEmptySquarePointerDown(e) {
      if (propsRef.current.readOnly || !selectedSquareRef.current) return;

      const squareEl = e.target.closest("[data-square]");
      if (!squareEl) return;

      const square = squareEl.getAttribute("data-square");
      const game = new Chess(propsRef.current.fen);
      if (game.get(square)) return;

      const from = selectedSquareRef.current;
      selectedSquareRef.current = null;
      clearHighlights();
      propsRef.current.onMove(from, square);
    }

    el.addEventListener("pointerdown", handleEmptySquarePointerDown);
    return () =>
      el.removeEventListener("pointerdown", handleEmptySquarePointerDown);
  }, [clearHighlights]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const jQuery = (await import("jquery")).default;
      window.jQuery = window.$ = jQuery;

      await import("@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.css");
      await import("@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.js");

      if (cancelled) return;

      const board = window.Chessboard(boardElRef.current, {
        draggable: !propsRef.current.readOnly,
        position: propsRef.current.fen,
        pieceTheme: PIECE_THEME,

        onDragStart: (source, piece) => {
          if (propsRef.current.readOnly) return false;
          const game = new Chess(propsRef.current.fen);
          if (game.isGameOver()) return false;

          const isOwnPiece =
            (game.turn() === "w" && piece.startsWith("w")) ||
            (game.turn() === "b" && piece.startsWith("b"));

          if (selectedSquareRef.current) {
            const from = selectedSquareRef.current;

            if (from === source) {
              selectedSquareRef.current = null;
              clearHighlights();
              return false;
            }

            const result = propsRef.current.onMove(from, source);
            if (result) {
              selectedSquareRef.current = null;
              clearHighlights();
              return false;
            }

            selectedSquareRef.current = null;
            clearHighlights();
            if (isOwnPiece) {
              selectedSquareRef.current = source;
              highlightSquare(source);
            }
            return isOwnPiece ? undefined : false;
          }

          if (!isOwnPiece) return false;

          selectedSquareRef.current = source;
          clearHighlights();
          highlightSquare(source);
        },

        onDrop: (source, target) => {
          if (source === target) return "snapback";
          selectedSquareRef.current = null;
          clearHighlights();
          const result = propsRef.current.onMove(source, target);
          if (!result) return "snapback";
          pendingFenRef.current = result.fen;
        },

        onSnapEnd: () => {
          if (pendingFenRef.current) {
            board.position(pendingFenRef.current);
            pendingFenRef.current = null;
          }
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
  }, [clearHighlights, highlightSquare]);

  useEffect(() => {
    selectedSquareRef.current = null;
    clearHighlights();
    if (boardRef.current) {
      boardRef.current.position(fen, false);
    }
  }, [fen, clearHighlights]);

  return (
    <div className="board-card">
      <div className="board-wrapper">
        <div ref={boardElRef} style={{ width: "100%" }} />
      </div>

      <div className="board-controls">
        <button className="ctrl-btn" title="First move" onClick={onFirst}>
          <SkipBack />
        </button>
        <button className="ctrl-btn" title="Previous move" onClick={onPrev}>
          <StepBack />
        </button>

        <div className="move-indicator">
          <span className="move-dot" />
          {moveLabel}
        </div>

        <button className="ctrl-btn" title="Next move" onClick={onNext}>
          <StepForward />
        </button>
        <button className="ctrl-btn" title="Last move" onClick={onLast}>
          <SkipForward />
        </button>
      </div>
    </div>
  );
}
