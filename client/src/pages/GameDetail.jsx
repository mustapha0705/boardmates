import { useState } from "react";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";
import "../styles/game-review.css";

export default function GameDetail() {
  const [activeMove, setActiveMove] = useState("Move 45");

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">Carlsen vs. Nepomniachtchi</h2>
          <span className="review-subtitle">World Championship 2021 · Game 6</span>
        </div>
      </div>

      <div className="review-grid">
        <div className="left-column">
          <ChessBoard activeMove={activeMove} />
          <MoveList activeMove={activeMove} onSelectMove={setActiveMove} />
          {/* <CommentForm activeMove={activeMove} /> */}
        </div>
        <div className="right-column">
          <CommentList activeMove={activeMove} onSelectMove={setActiveMove} />
        </div>
      </div>
    </main>
  );
}