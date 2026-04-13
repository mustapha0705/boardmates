import { Link } from "react-router-dom";

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "badge-pending" },
  in_review: { label: "In Review", className: "badge-in-review" },
  completed: { label: "Completed", className: "badge-completed" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GameCard({ game, currentUser, onStartReview }) {
  const { id, title, submittedAt, timeControl, status, reviewer, author } =
    game;
  const badge = STATUS_CONFIG[status];
  const isReviewer = reviewer === currentUser;

  let cta;
  if (status === "pending") {
    cta = (
      <button className="review-btn" onClick={() => onStartReview(id)}>
        Start Review →
      </button>
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
        <div className="card-icon">
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
            <span className="meta-pill">by {author}</span>
            {reviewer && (
              <>
                <span className="dot" />
                <span className="meta-pill">🔍 {reviewer}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {cta}
    </div>
  );
}
