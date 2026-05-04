import { useCallback, useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { fetchGames, claimReview } from "../services/api";
import GameCard from "../components/GameCard.jsx";
import AuthPromptActions from "../components/AuthPromptActions.jsx";
import "../styles/feed.css";

const PAGE_SIZE = 10;

export default function Feed() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { viewerId, loading, isAuthenticated } = useAuth();
  const identityReady = Boolean(viewerId);
  const authLoading = loading && !identityReady;
  const sentinelRef = useRef(null);
  const [claimingId, setClaimingId] = useState(null);
  const [claimError, setClaimError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["games"],
    queryFn: ({ pageParam }) => fetchGames({ cursor: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  const claimMutation = useMutation({
    mutationFn: claimReview,
    onMutate: (id) => {
      setClaimError(null);
      setClaimingId(id);
    },
    onSuccess: (_data, gameId) => {
      navigate(`/review-game/${gameId}`, { replace: true });
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (err) => {
      setClaimError(err.message || "Could not claim this game");
    },
    onSettled: () => setClaimingId(null),
  });

  const handleStartReview = useCallback(
    (id) => {
      setConfirmingId(null);
      claimMutation.mutate(id);
    },
    [claimMutation],
  );

  const games = data?.pages.flatMap((page) => page.games) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
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

  return (
    <main className="feed">
      <title>Boardmates | Feed</title>

      {!isAuthenticated ? (
        <div className="feed-guest-banner" role="region" aria-label="Create an account">
          <div className="feed-guest-banner-copy">
            <span className="feed-guest-banner-title">Join Boardmates</span>
            <span className="feed-guest-banner-sub">
              Sign up to submit games, claim reviews, and build your profile.
            </span>
          </div>
          <AuthPromptActions signupFirst />
        </div>
      ) : null}

      {claimError && (
        <div className="feed-claim-error" role="alert">
          {claimError}
        </div>
      )}

      {isLoading ? (
        <div className="feed-loading" role="status" aria-live="polite" aria-busy="true">
          <div className="feed-loading-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="feed-loading-msg">Loading games…</p>
        </div>
      ) : isError ? (
        <div className="feed-empty">
          <p className="feed-empty-title">Failed to load games</p>
          <p className="feed-empty-sub">Please try refreshing the page.</p>
        </div>
      ) : games.length === 0 ? (
        <div className="feed-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 3v18" />
          </svg>
          <p className="feed-empty-title">No games yet</p>
          <p className="feed-empty-sub">
            Be the first to submit a game for review.
          </p>
          <Link to="/submit" className="feed-empty-cta">
            Submit a Game →
          </Link>
          {!isAuthenticated ? (
            <div className="feed-empty-auth">
              <p className="feed-empty-auth-label">Want to participate?</p>
              <AuthPromptActions signupFirst />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="feed-list">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              currentUserId={viewerId}
              authLoading={authLoading}
              isAuthenticated={isAuthenticated}
              onStartReview={handleStartReview}
              onOpenConfirm={(gameId) => setConfirmingId(gameId)}
              onCancelConfirm={() => setConfirmingId(null)}
              confirmOpen={confirmingId === game.id}
              claiming={claimingId === game.id}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div ref={sentinelRef} className="scroll-sentinel">
          {isFetchingNextPage && (
            <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13, padding: 16 }}>
              Loading more…
            </p>
          )}
        </div>
      )}
    </main>
  );
}
