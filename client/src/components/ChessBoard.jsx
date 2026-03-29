import { Chessboard } from "react-chessboard";

const SkipBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="19 20 9 12 19 4" /><line x1="5" y1="4" x2="5" y2="20" />
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
    <polyline points="5 20 15 12 5 4" /><line x1="19" y1="4" x2="19" y2="20" />
  </svg>
);

export default function ChessBoard({ activeMove }) {
  return (
    <div className="board-card">
      <div className="board-wrapper">
        <Chessboard boardWidth={"100%"} />
      </div>

      <div className="board-controls">
        <button className="ctrl-btn" title="First move"><SkipBack /></button>
        <button className="ctrl-btn" title="Previous move"><StepBack /></button>

        <div className="move-indicator">
          <span className="move-dot" />
          {activeMove || "Move 45"}
        </div>

        <button className="ctrl-btn" title="Next move"><StepForward /></button>
        <button className="ctrl-btn" title="Last move"><SkipForward /></button>
      </div>
    </div>
  );
}