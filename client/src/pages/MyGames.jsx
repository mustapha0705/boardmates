import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProfileGames } from "../services/api";
import { timeAgo } from "../utils/time";
import GameRow from "../components/app/GameRow.jsx";
import { metaLine } from "../utils/metaLine";
import Callout from "../components/ui/Callout.jsx";
import FilterChips from "../components/ui/FilterChips.jsx";
import ShowMore from "../components/ui/ShowMore.jsx";
import "../styles/my-games.css";

const PAGE_SIZE = 10;

/**
 * `GET /profile/games` has no status filter, so these filters apply to the games loaded
 * so far and "Show more" keeps paging through the same cursor. "Analyzing" is not offered:
 * analysis status does not exist yet.
 */
const FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "pending", label: "Waiting", match: (game) => game.status === "pending" },
  { id: "in_review", label: "In review", match: (game) => game.status === "in_review" },
  { id: "completed", label: "Reviewed", match: (game) => game.status === "completed" },
  { id: "private", label: "Private", match: (game) => game.isPrivate },
];

export default function MyGames() {
  const [filter, setFilter] = useState("all");

  // Same key and page size as the Profile "Submitted" tab, so the two share one cache.
  const games = useInfiniteQuery({
    queryKey: ["profile", "games"],
    queryFn: ({ pageParam }) => fetchProfileGames({ cursor: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  useEffect(() => {
    if (games.isError) console.error("My games: could not load your games", games.error);
  }, [games.isError, games.error]);

  const loaded = games.data?.pages.flatMap((page) => page.games) ?? [];
  const active = FILTERS.find((option) => option.id === filter) ?? FILTERS[0];
  const visible = loaded.filter(active.match);
  const filtered = filter !== "all";

  return (
    <div className="bm-my-games">
      <title>Boardmates | My Games</title>

      <div className="bm-my-games__intro">
        <h1 className="bm-h1">My games</h1>
        <p className="bm-body">Every game you have submitted, newest first.</p>
      </div>

      <FilterChips options={FILTERS} value={filter} onChange={setFilter} label="Filter games by status" />

      {games.isError ? (
        <Callout tone="error" title="We couldn’t load your games">
          Refresh the page to try again.
        </Callout>
      ) : games.isLoading ? (
        <p className="bm-body" role="status" aria-live="polite">
          Loading your games&hellip;
        </p>
      ) : loaded.length === 0 ? (
        <Callout tone="neutral" title="You haven’t submitted a game yet">
          Submit a PGN with the question you want answered, and a stronger player can claim it.{" "}
          <Link to="/submit" className="bm-link">
            Submit a game
          </Link>
        </Callout>
      ) : (
        <>
          <p className="bm-meta" role="status" aria-live="polite">
            {filtered
              ? `${visible.length} of ${loaded.length} loaded ${loaded.length === 1 ? "game" : "games"} match “${active.label}”.`
              : `Showing ${loaded.length} ${loaded.length === 1 ? "game" : "games"}.`}
            {games.hasNextPage ? " More are available below." : ""}
          </p>

          {visible.length > 0 ? (
            <div className="bm-rows">
              {visible.map((game) => (
                <GameRow
                  key={game.id}
                  status={game.status}
                  title={game.title}
                  meta={metaLine(
                    game.timeControl,
                    game.averageRating ? `avg ${game.averageRating}` : null,
                    `submitted ${timeAgo(game.submittedAt)}`,
                  )}
                  isPrivate={game.isPrivate}
                  aside={game.reviewer?.displayName ? `Reviewer ${game.reviewer.displayName}` : null}
                  to={`/game-detail/${game.id}`}
                  actionLabel={game.status === "completed" ? "Read review" : "View game"}
                />
              ))}
            </div>
          ) : (
            <Callout tone="neutral" title={`No “${active.label}” games loaded`}>
              {games.hasNextPage ? "Load more games to keep looking, or choose another filter." : "Choose another filter to see your other games."}
            </Callout>
          )}

          <ShowMore query={games} label="Show more games" />
        </>
      )}
    </div>
  );
}
