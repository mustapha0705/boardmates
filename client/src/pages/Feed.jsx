import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGames, CURRENT_USER } from "../context/GameContext";
import GameCard from "../components/GameCard.jsx";
import "../styles/feed.css";

const PAGE_SIZE = 6;

export default function Feed() {
  const navigate = useNavigate();
  const { games, updateGame } = useGames();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const handleStartReview = useCallback(
    (id) => {
      updateGame(id, { status: "in_review", reviewer: CURRENT_USER });
      navigate(`/review-game/${id}`);
    },
    [navigate, updateGame],
  );

  const visible = games.slice(0, visibleCount);
  const hasMore = visibleCount < games.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, games.length));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [games.length]);

  return (
    <main className="feed">
      <h1 className="feed-heading">Review Feed</h1>
      <p className="feed-sub">Games waiting for your strategic feedback</p>

      {games.length === 0 ? (
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
        </div>
      ) : (
        <div className="feed-list">
          {visible.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              currentUser={CURRENT_USER}
              onStartReview={handleStartReview}
            />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="scroll-sentinel" />}
    </main>
  );
}
