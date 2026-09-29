import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { claimReview, fetchGames, fetchProfileGames, fetchProfileStats } from "../services/api";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import Card from "../components/ui/Card.jsx";
import ShowMore from "../components/ui/ShowMore.jsx";
import StatTile from "../components/ui/StatTile.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import ClaimDialog from "../components/app/ClaimDialog.jsx";
import GameRow from "../components/app/GameRow.jsx";
import { metaLine } from "../utils/metaLine";
import { getReviewEligibility } from "../utils/reviewEligibility";
import { timeAgo } from "../utils/time";
import "../styles/home.css";

const QUEUE_PAGE = 6;
const MY_GAMES_PAGE = 5;
const RECENT_PAGE = 3;

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isOwnGame(game, viewerId) {
  if (!viewerId) return false;
  return game.authorId === viewerId || game.author?.id === viewerId;
}

function QueueCard({ game, viewerId, viewerRating, onClaim }) {
  const own = isOwnGame(game, viewerId);
  const eligibility = getReviewEligibility({
    viewerRapidRating: viewerRating,
    gameAverageRating: game.averageRating,
    isPrivate: game.isPrivate,
  });
  const question = String(game.reviewNotes ?? "").trim();

  return (
    <Card className="bm-queue-card">
      <div className="bm-queue-card__top">
        <StatusPill status="pending" />
        <span className="bm-meta">{timeAgo(game.submittedAt)}</span>
      </div>

      <Link to={`/game-detail/${game.id}`} className="bm-queue-card__title bm-link">
        {game.title}
      </Link>

      {question ? <span className="bm-queue-card__question">&ldquo;{question}&rdquo;</span> : null}

      <span className="bm-queue-card__meta">
        <span>{game.timeControl}</span>
        {game.averageRating ? <span>avg {game.averageRating}</span> : null}
        <span>by {own ? "you" : (game.author?.displayName ?? "Unknown")}</span>
      </span>

      <div className="bm-queue-card__actions">
        {own ? (
          <Button as={Link} to={`/game-detail/${game.id}`} variant="secondary" size="sm">
            View game
          </Button>
        ) : eligibility.canReview ? (
          <Button variant="primary" size="sm" onClick={() => onClaim(game)}>
            Review game
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" disabled title={eligibility.message}>
              Review game
            </Button>
            <span className="bm-queue-card__reason">{eligibility.message}</span>
          </>
        )}
      </div>
    </Card>
  );
}

function MyGameRow({ game }) {
  return (
    <GameRow
      status={game.status}
      title={game.title}
      meta={metaLine(game.timeControl, game.averageRating ? `avg ${game.averageRating}` : null, timeAgo(game.submittedAt))}
      isPrivate={game.isPrivate}
      aside={game.reviewer?.displayName ? `Reviewer ${game.reviewer.displayName}` : null}
      to={`/game-detail/${game.id}`}
      actionLabel={game.status === "completed" ? "Read review" : "View game"}
    />
  );
}

function RecentRow({ game }) {
  return (
    <GameRow
      status="completed"
      title={game.title}
      meta={metaLine(
        game.timeControl,
        game.averageRating ? `avg ${game.averageRating}` : null,
        game.completedAt ? timeAgo(game.completedAt) : null,
      )}
      aside={game.reviewer?.displayName ? `Reviewed by ${game.reviewer.displayName}` : null}
      to={`/game-detail/${game.id}`}
      actionLabel="Read review"
    />
  );
}

export default function Home() {
  const { user, viewerId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [claimTarget, setClaimTarget] = useState(null);
  const [claimError, setClaimError] = useState("");

  const stats = useQuery({ queryKey: ["profile", "stats"], queryFn: fetchProfileStats });

  const queue = useInfiniteQuery({
    queryKey: ["games", "pending"],
    queryFn: ({ pageParam }) => fetchGames({ status: "pending", cursor: pageParam, limit: QUEUE_PAGE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  const myGames = useInfiniteQuery({
    queryKey: ["home", "my-games"],
    queryFn: ({ pageParam }) => fetchProfileGames({ cursor: pageParam, limit: MY_GAMES_PAGE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  const recent = useInfiniteQuery({
    queryKey: ["games", "completed"],
    queryFn: ({ pageParam }) => fetchGames({ status: "completed", cursor: pageParam, limit: RECENT_PAGE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  useEffect(() => {
    // Diagnostics only: sections degrade to quiet empty states rather than error banners.
    if (queue.isError) console.error("Home: could not load the review queue", queue.error);
    if (myGames.isError) console.error("Home: could not load your games", myGames.error);
    if (recent.isError) console.error("Home: could not load recent reviews", recent.error);
    if (stats.isError) console.error("Home: could not load profile stats", stats.error);
  }, [queue.isError, queue.error, myGames.isError, myGames.error, recent.isError, recent.error, stats.isError, stats.error]);

  const claimMutation = useMutation({
    mutationFn: claimReview,
    onSuccess: (_data, gameId) => {
      setClaimError("");
      setClaimTarget(null);
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      navigate(`/review-game/${gameId}`, { replace: true });
    },
    onError: (err) => {
      setClaimTarget(null);
      setClaimError(err.message || "Could not claim this game");
    },
  });

  const viewerRating = user?.rapidRating;
  const queueGames = queue.data?.pages.flatMap((page) => page.games) ?? [];
  const myGamesList = myGames.data?.pages.flatMap((page) => page.games) ?? [];
  const recentGames = recent.data?.pages.flatMap((page) => page.games) ?? [];

  return (
    <div className="bm-home">
      <title>Boardmates | Home</title>

      <div>
        <div className="bm-home__greeting">
          <h1 className="bm-h1">
            {greeting()}
            {user?.displayName ? `, ${user.displayName}` : ""}
          </h1>
        </div>
      </div>

      <div className="bm-stats">
        <StatTile label="Games submitted" value={stats.data?.submitted} />
        <StatTile label="Reviews you published" value={stats.data?.reviewed} tone="accent" />
        <StatTile label="Reviews in progress" value={stats.data?.inProgress} tone="action" />
      </div>

      <section className="bm-home__section" aria-labelledby="home-queue">
        <div className="bm-home__section-head">
          <h2 className="bm-h2" id="home-queue">
            Games waiting for a reviewer
          </h2>
          <p className="bm-meta bm-home__section-note">Matched against your verified rating when you claim.</p>
        </div>

        {claimError ? (
          <Callout tone="error" role="alert" title="We couldn't claim that game">
            {claimError}
          </Callout>
        ) : null}

        {queue.isLoading ? (
          <p className="bm-body" role="status" aria-live="polite">
            Loading games&hellip;
          </p>
        ) : queueGames.length > 0 ? (
          <>
            <div className="bm-queue">
              {queueGames.map((game) => (
                <QueueCard
                  key={game.id}
                  game={game}
                  viewerId={viewerId}
                  viewerRating={viewerRating}
                  onClaim={(target) => {
                    setClaimError("");
                    setClaimTarget(target);
                  }}
                />
              ))}
            </div>
            <ShowMore query={queue} label="Show more games" />
          </>
        ) : (
          <Callout tone="neutral" title="No games are waiting right now">
            When a player submits a game, it appears here for an eligible reviewer to claim.
          </Callout>
        )}
      </section>

      <section className="bm-home__section" aria-labelledby="home-my-games">
        <div className="bm-home__section-head">
          <h2 className="bm-h2" id="home-my-games">
            Your games
          </h2>
          <Link to="/my-games" className="bm-link bm-home__section-note">
            All submissions
          </Link>
        </div>

        {myGames.isLoading ? (
          <p className="bm-body" role="status" aria-live="polite">
            Loading your games&hellip;
          </p>
        ) : myGamesList.length > 0 ? (
          <>
            <div className="bm-rows">
              {myGamesList.map((game) => (
                <MyGameRow key={game.id} game={game} />
              ))}
            </div>
            <ShowMore query={myGames} label="Show more" />
          </>
        ) : (
          <Callout tone="neutral" title="You haven't submitted a game yet">
            Submit a PGN with the question you want answered, and a stronger player can claim it.
          </Callout>
        )}
      </section>

      <section className="bm-home__section" aria-labelledby="home-recent">
        <div className="bm-home__section-head">
          <h2 className="bm-h2" id="home-recent">
            Recently reviewed
          </h2>
        </div>

        {recent.isLoading ? (
          <p className="bm-body" role="status" aria-live="polite">
            Loading published reviews&hellip;
          </p>
        ) : recentGames.length > 0 ? (
          <>
            <div className="bm-rows">
              {recentGames.map((game) => (
                <RecentRow key={game.id} game={game} />
              ))}
            </div>
            <ShowMore query={recent} label="Show more reviews" />
          </>
        ) : (
          <Callout tone="neutral" title="No published reviews to show yet">
            Completed reviews appear here as reviewers publish them.
          </Callout>
        )}
      </section>

      {claimTarget ? (
        <ClaimDialog
          game={claimTarget}
          viewerRating={viewerRating}
          pending={claimMutation.isPending}
          onConfirm={() => claimMutation.mutate(claimTarget.id)}
          onClose={() => setClaimTarget(null)}
        />
      ) : null}
    </div>
  );
}
