import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGames, CURRENT_USER } from "../context/GameContext";
import useAnalysisTree, { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";
import "../styles/game-review.css";

function ReviewGameInner({ game, onCompleteReview }) {
  const tree = useAnalysisTree(null, game?.pgn);
  const [showConfirm, setShowConfirm] = useState(false);

  useKeyboardNav({
    onFirst: tree.goToFirst,
    onPrev: tree.goToPrev,
    onNext: tree.goToNext,
    onLast: tree.goToLast,
  });

  const title = game?.title || "Game Review";
  const subtitle = game
    ? `${game.timeControl} · Submitted by ${game.author}`
    : "";

  const isInReview = game?.status === "in_review";
  const isMyReview = game?.reviewer === CURRENT_USER;

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">{title}</h2>
          {subtitle && (
            <span className="review-subtitle">{subtitle}</span>
          )}
        </div>
        <div className="review-header-actions">
          {game?.averageRating && (
            <span className="rating-badge">⭐ {game.averageRating} avg</span>
          )}
          {isInReview && isMyReview && !showConfirm && (
            <button
              className="complete-review-btn"
              onClick={() => setShowConfirm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Complete Review
            </button>
          )}
          {isInReview && isMyReview && showConfirm && (
            <div className="complete-confirm">
              <span className="confirm-text">Mark as completed?</span>
              <button
                className="confirm-yes-btn"
                onClick={onCompleteReview}
              >
                Yes, finish
              </button>
              <button
                className="confirm-no-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {game?.reviewNotes && (
        <div className="review-notes-card">
          <div className="review-notes-header">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Submitter&rsquo;s Review Request
          </div>
          <p className="review-notes-text">{game.reviewNotes}</p>
        </div>
      )}

      <div className="review-grid">
        <div className="left-column">
          <ChessBoard
            fen={tree.currentNode.fen}
            onMove={tree.makeMove}
            onFirst={tree.goToFirst}
            onPrev={tree.goToPrev}
            onNext={tree.goToNext}
            onLast={tree.goToLast}
            moveLabel={getMoveLabel(tree.currentNode)}
          />
          <MoveList
            root={tree.root}
            currentNode={tree.currentNode}
            onSelectNode={tree.goToNode}
          />
          <CommentForm
            currentNode={tree.currentNode}
            onSaveComment={tree.setComment}
          />
        </div>
        <div className="right-column">
          <CommentList
            root={tree.root}
            currentNode={tree.currentNode}
            onSelectNode={tree.goToNode}
          />
        </div>
      </div>
    </main>
  );
}

export default function ReviewGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGame, updateGame } = useGames();
  const game = getGame(id);

  function handleCompleteReview() {
    if (!game) return;
    updateGame(game.id, { status: "completed" });
    navigate("/");
  }

  return (
    <ReviewGameInner
      key={id}
      game={game}
      onCompleteReview={handleCompleteReview}
    />
  );
}
