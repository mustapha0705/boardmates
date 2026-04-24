import { Link } from "react-router-dom";
import { STATUS_CONFIG } from "../constants/gameStatus";
import { formatDate } from "../utils/time";

export default function GameCard({ game, currentUserId, authLoading, onStartReview, claiming }) {
  const { id, authorId, title, submittedAt, timeControl, status, reviewer, author } = game;
  const badge = STATUS_CONFIG[status];

  const hasUserId = currentUserId != null && currentUserId !== "";
  const isAuthor =
    hasUserId &&
    (authorId === currentUserId ||
      (author && (author.id === currentUserId || author === currentUserId)));
  const authorName = isAuthor ? "you" : author?.displayName ?? author ?? "Unknown";
  const reviewerName = reviewer?.displayName ?? reviewer ?? null;
  const isReviewer =
    hasUserId && reviewer && (reviewer.id === currentUserId || reviewer === currentUserId);

  let cta;
  if (status === "pending" && authLoading) {
    cta = (
      <button type="button" className="review-btn" disabled>
        Loading…
      </button>
    );
  } else if (status === "pending" && !hasUserId) {
    cta = (
      <button type="button" className="review-btn" disabled title="Could not determine your account. Try refreshing.">
        Review Game →
      </button>
    );
  } else if (status === "pending" && !isAuthor) {
    cta = (
      <button
        type="button"
        className="review-btn"
        onClick={() => onStartReview(id)}
        disabled={claiming}
      >
        {claiming ? "Claiming…" : "Review Game →"}
      </button>
    );
  } else if (status === "pending" && isAuthor) {
    cta = (
      <Link to={`/game-detail/${id}`} className="review-btn btn-view">
        View Game →
      </Link>
    );
  } else if (status === "in_review" && isReviewer) {
    cta = (
      <Link to={`/review-game/${id}`} className="review-btn">
        Continue Review →
      </Link>
    );
  } else if (status === "in_review") {
    cta = (
      <Link to={`/game-detail/${id}`} className="review-btn btn-locked">
        View (Locked)
      </Link>
    );
  } else {
    cta = (
      <Link to={`/game-detail/${id}`} className="review-btn btn-view">
        View Review →
      </Link>
    );
  }

  return (
    <div className="game-card">
      <div className="card-left">
        <div className="card-icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 3v18" />
          </svg>
        </div>

        <div>
          <div className="card-date">
            Submitted {formatDate(submittedAt)}
            <span className={`status-badge ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <div className="card-title">
            <Link to={`/game-detail/${id}`}>{title}</Link>
          </div>
          <div className="card-meta">
            <span className="meta-pill">⏱ {timeControl}</span>
            <span className="dot" />
            <span className="meta-pill">by {authorName}</span>
            {game.averageRating && (
              <>
                <span className="dot" />
                <span className="meta-pill"> {game.averageRating}</span>
              </>
            )}
            {reviewerName && (
              <>
                <span className="dot" />
                <span className="meta-pill">🔍 {reviewerName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {cta}
    </div>
  );
}
