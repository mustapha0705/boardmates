import { useRef, useEffect, useCallback, useState } from "react";
import { Chess } from "chess.js";
import { getMoveSoundsEnabled, setMoveSoundsEnabled } from "../utils/moveSound";

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
const FlipBoard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const SoundOn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
const SoundOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export default function ChessBoard({
  fen,
  currentNode = null,
  onMove,
  onFirst,
  onPrev,
  onNext,
  onLast,
  moveLabel,
  readOnly = false,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(getMoveSoundsEnabled);
  const boardElRef = useRef(null);
  const boardRef = useRef(null);
  const propsRef = useRef(null);
  const pendingFenRef = useRef(null);
  const selectedSquareRef = useRef(null);

  propsRef.current = { fen, currentNode, onMove, readOnly };

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

  const highlightCurrentMove = useCallback(
    (node) => {
      if (!node?.parent || !node?.san) return;
      try {
        const game = new Chess(node.parent.fen);
        const move = game.move(node.san);
        if (!move) return;
        highlightSquare(move.from);
        highlightSquare(move.to);
      } catch {
        // ignore malformed node state
      }
    },
    [highlightSquare],
  );

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
        orientation: isFlipped ? "black" : "white",
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
      clearHighlights();
      highlightCurrentMove(propsRef.current.currentNode);
    }

    init();

    return () => {
      cancelled = true;
      if (boardRef.current) {
        boardRef.current.destroy();
        boardRef.current = null;
      }
    };
  }, [clearHighlights, highlightCurrentMove, highlightSquare, isFlipped]);

  useEffect(() => {
    selectedSquareRef.current = null;
    clearHighlights();
    if (boardRef.current) {
      boardRef.current.position(fen, false);
      highlightCurrentMove(currentNode);
    }
  }, [fen, currentNode, clearHighlights, highlightCurrentMove]);

  useEffect(() => {
    if (!boardRef.current) return;
    boardRef.current.orientation(isFlipped ? "black" : "white");
  }, [isFlipped]);

  useEffect(() => {
    function handleStorage(e) {
      if (e.key !== "boardmates.moveSoundEnabled") return;
      setSoundsEnabled(getMoveSoundsEnabled());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="board-card">
      <div className="board-wrapper">
        <div ref={boardElRef} style={{ width: "100%" }} />
      </div>

      <div className="board-controls">
        <button type="button" className="ctrl-btn" title="First move" aria-label="First move" onClick={onFirst}>
          <SkipBack />
        </button>
        <button type="button" className="ctrl-btn" title="Previous move" aria-label="Previous move" onClick={onPrev}>
          <StepBack />
        </button>

        <div className="move-indicator">
          <span className="move-dot" aria-hidden="true" />
          {moveLabel}
        </div>

        <button type="button" className="ctrl-btn" title="Next move" aria-label="Next move" onClick={onNext}>
          <StepForward />
        </button>
        <button type="button" className="ctrl-btn" title="Last move" aria-label="Last move" onClick={onLast}>
          <SkipForward />
        </button>
        <button
          type="button"
          className="ctrl-btn"
          title="Flip board"
          aria-label="Flip board"
          onClick={() => setIsFlipped((v) => !v)}
        >
          <FlipBoard />
        </button>
        <button
          type="button"
          className={`ctrl-btn ${soundsEnabled ? "" : "ctrl-btn-muted"}`.trim()}
          title={soundsEnabled ? "Mute move sounds" : "Unmute move sounds"}
          aria-label={soundsEnabled ? "Mute move sounds" : "Unmute move sounds"}
          onClick={() => {
            const next = !soundsEnabled;
            setSoundsEnabled(next);
            setMoveSoundsEnabled(next);
          }}
        >
          {soundsEnabled ? <SoundOn /> : <SoundOff />}
        </button>
      </div>
    </div>
  );
}
