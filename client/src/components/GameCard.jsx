import { Link } from "react-router-dom";
import { STATUS_CONFIG } from "../constants/gameStatus";
import { formatDate } from "../utils/time";

function getInitial(name) {
  if (!name) return "?";
  return String(name).trim().charAt(0).toUpperCase() || "?";
}

export default function GameCard({
  game,
  currentUserId,
  authLoading,
  isAuthenticated,
  canReview,
  reviewEligibilityMessage,
  onStartReview,
  onOpenConfirm,
  onCancelConfirm,
  confirmOpen,
  claiming,
}) {
  const { id, authorId, title, submittedAt, timeControl, status, reviewer, author } = game;
  const badge = STATUS_CONFIG[status];

  const hasUserId = currentUserId != null && currentUserId !== "";
  const isAuthor =
    hasUserId &&
    (authorId === currentUserId ||
      (author && (author.id === currentUserId || author === currentUserId)));
  const authorName = isAuthor ? "you" : author?.displayName ?? author ?? "Unknown";
  const authorInitial = getInitial(author?.displayName ?? authorName);
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
    cta = null;
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
          <span className="card-icon-initial">{authorInitial}</span>
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

      {status === "pending" && !isAuthor && !isAuthenticated ? (
        <button type="button" className="review-btn btn-locked" disabled title="Sign in to review games">
          Review Game (Locked)
        </button>
      ) : status === "pending" && !isAuthor && isAuthenticated && !canReview ? (
        <button type="button" className="review-btn btn-locked" disabled title={reviewEligibilityMessage || undefined}>
          {reviewEligibilityMessage || "Not eligible to review"}
        </button>
      ) : status === "pending" && !isAuthor && isAuthenticated ? (
        confirmOpen ? (
          <div className="review-confirm-inline">
            <span className="review-confirm-text">Start review?</span>
            <button
              type="button"
              className="review-confirm-btn review-confirm-yes"
              onClick={() => onStartReview(id)}
              disabled={claiming}
              aria-label="Confirm review game"
              title="Confirm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              type="button"
              className="review-confirm-btn review-confirm-no"
              onClick={onCancelConfirm}
              disabled={claiming}
              aria-label="Cancel review game"
              title="Cancel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="review-btn"
            onClick={() => onOpenConfirm(id)}
            disabled={claiming}
          >
            {claiming ? "Claiming…" : "Review Game →"}
          </button>
        )
      ) : (
        cta
      )}
    </div>
  );
}
