import { Chessboard } from "react-chessboard";

export default function ChessBoard() {
  return (
    <div className="board-card">
      <div className="board-wrapper">
        <Chessboard boardWidth={"100%"} />
      </div>

      <div className="board-controls">
        <div className="controls-left">
          <button>{"<<"}</button>
          <button>{"<"}</button>
        </div>

        <div className="move-indicator">Move 45</div>

        <div className="controls-right">
          <button>{">"}</button>
          <button>{">>"}</button>
        </div>
      </div>
    </div>
  );
}