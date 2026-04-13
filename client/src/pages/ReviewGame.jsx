import { useParams } from "react-router-dom";
import { useGames } from "../context/GameContext";
import useAnalysisTree, { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";
import "../styles/game-review.css";

function ReviewGameInner({ game }) {
  const tree = useAnalysisTree(null, game?.pgn);

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

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">{title}</h2>
          {subtitle && (
            <span className="review-subtitle">{subtitle}</span>
          )}
        </div>
        {game?.averageRating && (
          <span className="rating-badge">⭐ {game.averageRating} avg</span>
        )}
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
  const { getGame } = useGames();
  const game = getGame(id);

  return <ReviewGameInner key={id} game={game} />;
}
