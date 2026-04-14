import { Link } from "react-router-dom";
import { useGames, CURRENT_USER } from "../context/GameContext";
import "../styles/profile.css";

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(iso);
}

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "profile-badge-pending" },
  in_review: { label: "In Review", className: "profile-badge-in-review" },
  completed: { label: "Completed", className: "profile-badge-completed" },
};

export default function Profile() {
  const { games } = useGames();

  const submitted = games.filter((g) => g.author === CURRENT_USER);
  const reviewed = games.filter(
    (g) => g.reviewer === CURRENT_USER && g.status === "completed",
  );
  const inProgress = games.filter(
    (g) => g.reviewer === CURRENT_USER && g.status === "in_review",
  );

  return (
    <div className="feed">
      <div className="profile-page">
        <main className="profile-container">
          <section className="profile-header">
            <div className="avatar-circle">
              <span>{getInitial(CURRENT_USER)}</span>
            </div>

            <div className="profile-info">
              <div className="top-row">
                <div>
                  <h1>{CURRENT_USER}</h1>
                  <p className="subtitle">Chess Enthusiast & Reviewer</p>
                  <p className="member">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Member since 2023
                  </p>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{submitted.length}</span>
                  <span className="stat-label">Submitted</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">{reviewed.length}</span>
                  <span className="stat-label">Reviewed</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">{inProgress.length}</span>
                  <span className="stat-label">In Progress</span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid">
            {/* Games Submitted */}
            <div>
              <div className="section-header">
                <h2>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Games Submitted
                </h2>
                <span className="badge">{submitted.length}</span>
              </div>

              {submitted.length === 0 ? (
                <div className="empty-state">
                  <p>No games submitted yet.</p>
                  <Link to="/submit" className="empty-cta">
                    Submit your first game →
                  </Link>
                </div>
              ) : (
                submitted.slice(0, 5).map((game) => {
                  const badge = STATUS_CONFIG[game.status];
                  return (
                    <Link
                      to={`/game-detail/${game.id}`}
                      className="profile-game-card"
                      key={game.id}
                    >
                      <div className="profile-game-info">
                        <h3>{game.title}</h3>
                        <div className="profile-game-meta">
                          <span className="profile-meta-pill">
                            ⏱ {game.timeControl}
                          </span>
                          <span
                            className={`profile-status-badge ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <span className="profile-game-date">
                        {timeAgo(game.submittedAt)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Games Reviewed */}
            <div>
              <div className="section-header">
                <h2>
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
                  Games Reviewed
                </h2>
                <span className="badge">{reviewed.length}</span>
              </div>

              {reviewed.length === 0 ? (
                <div className="empty-state">
                  <p>No completed reviews yet.</p>
                  <Link to="/" className="empty-cta">
                    Browse the feed →
                  </Link>
                </div>
              ) : (
                reviewed.slice(0, 5).map((game) => (
                  <Link
                    to={`/game-detail/${game.id}`}
                    className="profile-review-card"
                    key={game.id}
                  >
                    <div className="profile-review-top">
                      <h3>{game.title}</h3>
                      <span className="profile-review-tc">
                        {game.timeControl}
                      </span>
                    </div>
                    <div className="profile-review-bottom">
                      <span className="profile-review-author">
                        by {game.author}
                      </span>
                      <span className="profile-review-time">
                        {timeAgo(game.submittedAt)}
                      </span>
                    </div>
                  </Link>
                ))
              )}

              {inProgress.length > 0 && (
                <>
                  <div className="section-header" style={{ marginTop: 20 }}>
                    <h2>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      In Progress
                    </h2>
                    <span className="badge">{inProgress.length}</span>
                  </div>
                  {inProgress.slice(0, 3).map((game) => (
                    <Link
                      to={`/review-game/${game.id}`}
                      className="profile-review-card in-progress"
                      key={game.id}
                    >
                      <div className="profile-review-top">
                        <h3>{game.title}</h3>
                        <span className="profile-review-tc">
                          {game.timeControl}
                        </span>
                      </div>
                      <div className="profile-review-bottom">
                        <span className="profile-review-author">
                          by {game.author}
                        </span>
                        <span className="profile-badge-in-review profile-status-badge">
                          In Review
                        </span>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
