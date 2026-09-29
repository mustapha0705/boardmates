import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { fetchProfileGames, fetchProfileReviews, fetchProfileStats } from "../services/api";
import { timeAgo } from "../utils/time";
import { chessPlatformLabel } from "../utils/chessPlatform";
import GameRow from "../components/app/GameRow.jsx";
import { metaLine } from "../utils/metaLine";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import ShowMore from "../components/ui/ShowMore.jsx";
import StatTile from "../components/ui/StatTile.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import { TabPanel, Tabs } from "../components/ui/Tabs.jsx";
import "../styles/profile.css";

const PAGE_SIZE = 10;
const TABS_ID = "profile-lists";

function pageQuery(queryKey, fetcher) {
  return {
    queryKey,
    queryFn: ({ pageParam }) => fetcher({ cursor: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  };
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

/**
 * "Verified chess profile" (D6): a chess username verified at signup plus a rating read
 * from that platform. It describes identity only, not review quality.
 */
function hasVerifiedChessProfile(user) {
  return Boolean(user?.chessUsername) && Number.isFinite(user?.rapidRating) && user.rapidRating > 0;
}

function ListState({ query, errorText, loadingText, empty, children }) {
  if (query.isError) {
    return (
      <Callout tone="error" title={errorText}>
        Refresh the page to try again.
      </Callout>
    );
  }
  if (query.isLoading) {
    return (
      <p className="bm-body" role="status" aria-live="polite">
        {loadingText}
      </p>
    );
  }
  return children ?? empty;
}

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState("reviews");

  const stats = useQuery({ queryKey: ["profile", "stats"], queryFn: fetchProfileStats });
  const submitted = useInfiniteQuery(pageQuery(["profile", "games"], fetchProfileGames));
  const reviewed = useInfiniteQuery(
    pageQuery(["profile", "reviews", "completed"], (params) => fetchProfileReviews({ ...params, status: "completed" })),
  );
  const inProgress = useInfiniteQuery(
    pageQuery(["profile", "reviews", "in_review"], (params) => fetchProfileReviews({ ...params, status: "in_review" })),
  );

  useEffect(() => {
    if (stats.isError) console.error("Profile: could not load stats", stats.error);
  }, [stats.isError, stats.error]);

  const submittedGames = submitted.data?.pages.flatMap((page) => page.games) ?? [];
  const reviewedGames = reviewed.data?.pages.flatMap((page) => page.games) ?? [];
  const inProgressGames = inProgress.data?.pages.flatMap((page) => page.games) ?? [];

  const displayName = user?.displayName ?? "Player";
  const platformLabel = chessPlatformLabel(user?.chessPlatform);
  const verified = hasVerifiedChessProfile(user);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;
  const identityLine = [
    platformLabel && user?.chessUsername ? `${platformLabel} · ${user.chessUsername}` : platformLabel || null,
    memberSince ? `member since ${memberSince}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const tabs = [
    { id: "reviews", label: "Reviews given", count: stats.data?.reviewed },
    { id: "in-progress", label: "In progress", count: stats.data?.inProgress },
    { id: "submitted", label: "Submitted", count: stats.data?.submitted },
  ];

  return (
    <div className="bm-profile">
      <title>Boardmates | Profile</title>

      <section className="bm-profile__header" aria-labelledby="profile-name">
        <span className="bm-profile__avatar" aria-hidden="true">
          {getInitial(displayName)}
        </span>
        <div className="bm-profile__identity">
          <div className="bm-profile__name-row">
            <h1 className="bm-h1" id="profile-name">
              {displayName}
            </h1>
            {verified ? <StatusPill status="completed" label="Verified chess profile" /> : null}
          </div>
          {identityLine ? <p className="bm-body">{identityLine}</p> : null}
          {Number.isFinite(user?.rapidRating) && user.rapidRating > 0 ? (
            <div className="bm-profile__ratings">
              <span className="bm-profile__rating">Rapid {user.rapidRating}</span>
            </div>
          ) : (
            <p className="bm-meta">No verified rating on your profile yet, so you can’t claim public games to review.</p>
          )}
        </div>
      </section>

      <div className="bm-stats">
        <StatTile label="Games submitted" value={stats.data?.submitted} />
        <StatTile label="Reviews you published" value={stats.data?.reviewed} tone="accent" />
        <StatTile label="Reviews in progress" value={stats.data?.inProgress} tone="action" />
      </div>

      <section className="bm-profile__lists" aria-label="Your activity">
        <Tabs tabs={tabs} active={tab} onChange={setTab} label="Your activity" idBase={TABS_ID} />

        {tab === "reviews" ? (
          <TabPanel idBase={TABS_ID} id="reviews">
            <ListState
              query={reviewed}
              errorText="We couldn’t load your reviews"
              loadingText="Loading reviews…"
              empty={
                <Callout tone="neutral" title="No published reviews yet">
                  Claim a game from Home, write at least 3 move notes and publish it.{" "}
                  <Link to="/" className="bm-link">
                    Find a game
                  </Link>
                </Callout>
              }
            >
              {reviewedGames.length > 0 ? (
                <>
                  <div className="bm-rows">
                    {reviewedGames.map((game) => (
                      <GameRow
                        key={game.id}
                        status="completed"
                        statusLabel="Published"
                        title={game.title}
                        meta={metaLine(`for ${game.author?.displayName ?? "Unknown"}`, game.timeControl, `submitted ${timeAgo(game.submittedAt)}`)}
                        to={`/game-detail/${game.id}`}
                        actionLabel="Read review"
                      />
                    ))}
                  </div>
                  <ShowMore query={reviewed} label="Show more reviews" />
                </>
              ) : null}
            </ListState>
          </TabPanel>
        ) : null}

        {tab === "in-progress" ? (
          <TabPanel idBase={TABS_ID} id="in-progress">
            <ListState
              query={inProgress}
              errorText="We couldn’t load your reviews in progress"
              loadingText="Loading reviews in progress…"
              empty={
                <Callout tone="neutral" title="Nothing in progress">
                  Games you claim stay here until you publish the review.
                </Callout>
              }
            >
              {inProgressGames.length > 0 ? (
                <>
                  <div className="bm-rows">
                    {inProgressGames.map((game) => (
                      <GameRow
                        key={game.id}
                        status="in_review"
                        statusLabel="In review"
                        title={game.title}
                        meta={metaLine(
                          `for ${game.author?.displayName ?? "Unknown"}`,
                          game.timeControl,
                          game.claimedAt ? `claimed ${timeAgo(game.claimedAt)}` : null,
                        )}
                        to={`/review-game/${game.id}`}
                        actionLabel="Continue review"
                      />
                    ))}
                  </div>
                  <ShowMore query={inProgress} label="Show more" />
                </>
              ) : null}
            </ListState>
          </TabPanel>
        ) : null}

        {tab === "submitted" ? (
          <TabPanel idBase={TABS_ID} id="submitted">
            <ListState
              query={submitted}
              errorText="We couldn’t load your submissions"
              loadingText="Loading your games…"
              empty={
                <Callout tone="neutral" title="You haven’t submitted a game yet">
                  Submit a PGN with the question you want answered.{" "}
                  <Link to="/submit" className="bm-link">
                    Submit a game
                  </Link>
                </Callout>
              }
            >
              {submittedGames.length > 0 ? (
                <>
                  <div className="bm-rows">
                    {submittedGames.map((game) => (
                      <GameRow
                        key={game.id}
                        status={game.status}
                        title={game.title}
                        meta={metaLine(
                          game.timeControl,
                          game.averageRating ? `avg ${game.averageRating}` : null,
                          timeAgo(game.submittedAt),
                        )}
                        isPrivate={game.isPrivate}
                        to={`/game-detail/${game.id}`}
                        actionLabel={game.status === "completed" ? "Read review" : "View game"}
                      />
                    ))}
                  </div>
                  <ShowMore query={submitted} label="Show more games" />
                  <div className="bm-more">
                    <Button as={Link} to="/my-games" variant="tertiary" size="sm">
                      Filter them in My Games
                    </Button>
                  </div>
                </>
              ) : null}
            </ListState>
          </TabPanel>
        ) : null}
      </section>
    </div>
  );
}
