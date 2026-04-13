import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MOCK_GAMES, { CURRENT_USER } from "../data/mockFeed";
import GameCard from "../components/GameCard.jsx";
import "../styles/feed.css";

const PAGE_SIZE = 6;

export default function Feed() {
  const navigate = useNavigate();
  const [games, setGames] = useState(() =>
    [...MOCK_GAMES].sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
    ),
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const handleStartReview = useCallback(
    (id) => {
      setGames((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, status: "in_review", reviewer: CURRENT_USER }
            : g,
        ),
      );
      navigate(`/review-game/${id}`);
    },
    [navigate],
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

      {hasMore && <div ref={sentinelRef} className="scroll-sentinel" />}
    </main>
  );
}
