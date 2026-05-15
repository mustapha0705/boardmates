import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
// import { useTheme } from "../context/ThemeContext";
import { fetchProfileStats, fetchProfileGames, fetchProfileReviews } from "../services/api";
import { timeAgo } from "../utils/time";
import { chessPlatformLabel } from "../utils/chessPlatform";
import "../styles/profile.css";

const PAGE_SIZE = 10;

const LOADING_MORE_STYLE = {
  textAlign: "center",
  color: "var(--color-text-tertiary)",
  fontSize: 13,
  padding: 16,
};

function useInfiniteScrollSentinel(hasNextPage, isFetchingNextPage, fetchNextPage) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  return ref;
}

const STATUS_BADGE = {
  pending: { label: "Pending", className: "profile-badge-pending" },
  in_review: { label: "In Review", className: "profile-badge-in-review" },
  completed: { label: "Completed", className: "profile-badge-completed" },
};

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

export default function Profile() {
  const { user } = useAuth();
  // const { isDark, toggleTheme } = useTheme();

  const { data: stats } = useQuery({
    queryKey: ["profile", "stats"],
    queryFn: fetchProfileStats,
  });

  const {
    data: submittedPages,
    fetchNextPage: fetchNextSubmitted,
    hasNextPage: hasMoreSubmitted,
    isFetchingNextPage: isFetchingMoreSubmitted,
    isLoading: submittedLoading,
    isError: submittedError,
  } = useInfiniteQuery({
    queryKey: ["profile", "games"],
    queryFn: ({ pageParam }) => fetchProfileGames({ cursor: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  const {
    data: reviewedPages,
    fetchNextPage: fetchNextReviewed,
    hasNextPage: hasMoreReviewed,
    isFetchingNextPage: isFetchingMoreReviewed,
    isLoading: reviewedLoading,
    isError: reviewedError,
  } = useInfiniteQuery({
    queryKey: ["profile", "reviews", "completed"],
    queryFn: ({ pageParam }) =>
      fetchProfileReviews({ status: "completed", cursor: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  const {
    data: inProgressPages,
    fetchNextPage: fetchNextInProgress,
    hasNextPage: hasMoreInProgress,
    isFetchingNextPage: isFetchingMoreInProgress,
    isLoading: inProgressLoading,
    isError: inProgressError,
  } = useInfiniteQuery({
    queryKey: ["profile", "reviews", "in_review"],
    queryFn: ({ pageParam }) =>
      fetchProfileReviews({ status: "in_review", cursor: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  const submittedSentinelRef = useInfiniteScrollSentinel(
    hasMoreSubmitted,
    isFetchingMoreSubmitted,
    fetchNextSubmitted,
  );
  const reviewedSentinelRef = useInfiniteScrollSentinel(
    hasMoreReviewed,
    isFetchingMoreReviewed,
    fetchNextReviewed,
  );
  const inProgressSentinelRef = useInfiniteScrollSentinel(
    hasMoreInProgress,
    isFetchingMoreInProgress,
    fetchNextInProgress,
  );

  const submitted = submittedPages?.pages.flatMap((p) => p.games) ?? [];
  const reviewed = reviewedPages?.pages.flatMap((p) => p.games) ?? [];
  const inProgress = inProgressPages?.pages.flatMap((p) => p.games) ?? [];

  const showInProgressSection = (stats?.inProgress ?? 0) > 0 || inProgress.length > 0;

  const displayName = user?.displayName ?? "Player";
  const platformLabel = chessPlatformLabel(user?.chessPlatform);
  const rapidRatingText =
    Number.isFinite(user?.rapidRating) && user.rapidRating > 0 ? `Rapid ${user.rapidRating}` : null;
  const platformLine =
    platformLabel && rapidRatingText ? `${platformLabel} · ${rapidRatingText}` : platformLabel || null;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="feed">
      <title>Boardmates | Profile</title>
      <div className="profile-page">
        <main className="profile-container">
          <section className="profile-header">
            <div className="avatar-circle">
              <span>{getInitial(displayName)}</span>
            </div>

            <div className="profile-info">
              <div className="top-row">
                <div>
                  <h1>{displayName}</h1>
                  {platformLine ? <p className="subtitle">{platformLine}</p> : null}
                  <p className="member">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Member since {memberSince}
                  </p>
                </div>
                {/* <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
                  {isDark ? "Switch to Light" : "Switch to Dark"}
                </button> */}
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats?.submitted ?? "—"}</span>
                  <span className="stat-label">Submitted</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">{stats?.reviewed ?? "—"}</span>
                  <span className="stat-label">Reviewed</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-number">{stats?.inProgress ?? "—"}</span>
                  <span className="stat-label">In Progress</span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid">
            <div>
              <div className="section-header">
                <h2>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Games Submitted
                </h2>
                <span className="badge">{stats?.submitted ?? 0}</span>
              </div>

              {submittedError ? (
                <div className="empty-state">
                  <p>Failed to load submissions.</p>
                </div>
              ) : submittedLoading && submitted.length === 0 ? (
                <p style={LOADING_MORE_STYLE} role="status" aria-live="polite">
                  Loading games…
                </p>
              ) : submitted.length === 0 ? (
                <div className="empty-state">
                  <p>No games submitted yet.</p>
                  <Link to="/submit" className="empty-cta">
                    Submit your first game →
                  </Link>
                </div>
              ) : (
                <>
                  {submitted.map((game) => {
                    const badge = STATUS_BADGE[game.status] ?? STATUS_BADGE.pending;
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
                            {game.isPrivate ? (
                              <span className="profile-meta-pill profile-private-pill">Private</span>
                            ) : null}
                            <span className={`profile-status-badge ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                        <span className="profile-game-date">
                          {timeAgo(game.submittedAt)}
                        </span>
                      </Link>
                    );
                  })}
                  {hasMoreSubmitted && (
                    <div ref={submittedSentinelRef} className="scroll-sentinel">
                      {isFetchingMoreSubmitted ? (
                        <p style={LOADING_MORE_STYLE}>Loading more…</p>
                      ) : null}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <div className="section-header">
                <h2>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Games Reviewed
                </h2>
                <span className="badge">{stats?.reviewed ?? 0}</span>
              </div>

              {reviewedError ? (
                <div className="empty-state">
                  <p>Failed to load reviewed games.</p>
                </div>
              ) : reviewedLoading && reviewed.length === 0 ? (
                <p style={LOADING_MORE_STYLE} role="status" aria-live="polite">
                  Loading reviews…
                </p>
              ) : reviewed.length === 0 ? (
                <div className="empty-state">
                  <p>No completed reviews yet.</p>
                  <Link to="/" className="empty-cta">
                    Browse the feed →
                  </Link>
                </div>
              ) : (
                <>
                  {reviewed.map((game) => (
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
                          by {game.author?.displayName ?? "Unknown"}
                        </span>
                        <span className="profile-review-time">
                          {timeAgo(game.submittedAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {hasMoreReviewed && (
                    <div ref={reviewedSentinelRef} className="scroll-sentinel">
                      {isFetchingMoreReviewed ? (
                        <p style={LOADING_MORE_STYLE}>Loading more…</p>
                      ) : null}
                    </div>
                  )}
                </>
              )}

              {showInProgressSection ? (
                <>
                  <div className="section-header" style={{ marginTop: 20 }}>
                    <h2>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      In Progress
                    </h2>
                    <span className="badge">{stats?.inProgress ?? inProgress.length}</span>
                  </div>
                  {inProgressError ? (
                    <div className="empty-state">
                      <p>Failed to load in-progress reviews.</p>
                    </div>
                  ) : inProgressLoading && inProgress.length === 0 ? (
                    <p style={LOADING_MORE_STYLE} role="status" aria-live="polite">
                      Loading…
                    </p>
                  ) : (
                    <>
                      {inProgress.map((game) => (
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
                              by {game.author?.displayName ?? "Unknown"}
                            </span>
                            <span className="profile-badge-in-review profile-status-badge">
                              In Review
                            </span>
                          </div>
                        </Link>
                      ))}
                      {hasMoreInProgress && (
                        <div ref={inProgressSentinelRef} className="scroll-sentinel">
                          {isFetchingMoreInProgress ? (
                            <p style={LOADING_MORE_STYLE}>Loading more…</p>
                          ) : null}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
