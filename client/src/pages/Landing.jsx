import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Chess } from "chess.js";
import { fetchGame, fetchGames } from "../services/api";
import PublicPage from "../components/public/PublicPage.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Callout from "../components/ui/Callout.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import MiniBoard, { START_FEN } from "../components/ui/MiniBoard.jsx";
import { timeAgo } from "../utils/time";
import "../styles/landing.css";

const FIVE_MINUTES = 5 * 60 * 1000;

const HOW_IT_WORKS = [
  {
    index: "01 — You",
    title: "Submit the game and the question",
    body: "Upload or paste a PGN, say which side you played, and tell the reviewer what you want to understand.",
  },
  {
    index: "02 — A stronger player",
    title: "One reviewer claims it",
    body: "Claiming locks the game to a single reviewer whose rating has been verified through Chess.com or Lichess.",
  },
  {
    index: "03 — You",
    title: "Read notes tied to the moves",
    body: "Every note is anchored to the move it explains, so you can step through the game and read why each moment mattered.",
  },
];

const HERO_FACTS = [
  "One reviewer per game: claiming locks it until the review is published.",
  "Reviewer ratings are verified through Chess.com or Lichess before a game can be claimed.",
  "Every note is anchored to the move it explains.",
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function initialOf(name) {
  return String(name ?? "").trim().charAt(0).toUpperCase() || "?";
}

/** Builds a real published note (position, move label, text, reviewer) from API data. */
function buildFeaturedNote(game) {
  if (!game?.pgn) return null;
  const note = (game.comments ?? []).find((comment) => String(comment.comment ?? "").trim());
  if (!note) return null;

  try {
    const source = new Chess();
    source.loadPgn(game.pgn);
    const history = source.history({ verbose: true });
    const index = Math.min(Math.max(Number(note.ply) || 1, 1), history.length) - 1;
    const move = history[index];
    if (!move) return null;

    const replay = new Chess();
    for (let i = 0; i <= index; i += 1) {
      replay.move(history[i].san);
    }

    const moveNumber = Math.ceil((index + 1) / 2);
    const separator = (index + 1) % 2 === 1 ? "." : "...";

    return {
      fen: replay.fen(),
      highlight: [move.from, move.to],
      moveLabel: `${moveNumber}${separator} ${move.san}`,
      text: String(note.comment).trim(),
      reviewer: game.reviewer?.displayName ?? null,
      gameId: game.id,
      title: game.title,
    };
  } catch {
    return null;
  }
}

function ReviewCard({ game }) {
  const question = String(game.reviewNotes ?? "").trim();
  const when = game.completedAt ?? game.submittedAt;

  return (
    <Card as={Link} to={`/game-detail/${game.id}`} interactive className="bm-review-card">
      <StatusPill status="completed" />
      <span className="bm-review-card__title">{game.title}</span>
      {question ? <span className="bm-review-card__question">&ldquo;{question}&rdquo;</span> : null}
      <span className="bm-review-card__meta">
        <span>{game.timeControl}</span>
        {game.averageRating ? <span>avg {game.averageRating}</span> : null}
        {when ? <span>{timeAgo(when)}</span> : null}
      </span>
      {game.reviewer?.displayName ? (
        <span className="bm-meta">Reviewed by {game.reviewer.displayName}</span>
      ) : null}
    </Card>
  );
}

export default function Landing() {
  const recent = useQuery({
    queryKey: ["landing", "recent-reviews"],
    queryFn: () => fetchGames({ status: "completed", limit: 3 }),
    staleTime: FIVE_MINUTES,
  });

  const games = recent.data?.games ?? [];
  const featuredId = games[0]?.id ?? null;

  const featured = useQuery({
    queryKey: ["game", featuredId],
    queryFn: () => fetchGame(featuredId),
    enabled: Boolean(featuredId),
    staleTime: FIVE_MINUTES,
  });

  useEffect(() => {
    // Diagnostics only: the public section degrades to a quiet empty state instead of
    // showing visitors an error banner.
    if (recent.isError) {
      console.error("Landing: could not load published reviews", recent.error);
    }
    if (featured.isError) {
      console.error("Landing: could not load the featured review", featured.error);
    }
  }, [recent.isError, recent.error, featured.isError, featured.error]);

  const note = buildFeaturedNote(featured.data);
  const secondaryHref = note?.gameId ? `/game-detail/${note.gameId}` : null;

  return (
    <PublicPage>
      <title>Boardmates | Human chess review</title>
      <meta
        name="description"
        content="Submit a chess game and a stronger player reviews it: move-by-move notes written by a human reviewer and published under their name."
      />

      <div className="bm-landing">
        {/* Hero */}
        <section className="bm-shell bm-landing__hero">
          <div className="bm-hero__copy">
            <span className="bm-pill bm-pill--approved">
              <span className="bm-pill__icon">
                <CheckIcon />
              </span>
              Every published review is written by a human
            </span>

            <div className="bm-hero__lead">
              <h1 className="bm-display bm-hero__title">Understand your games through human insight.</h1>
              <p className="bm-body bm-body--lg bm-body--strong">
                A stronger player studies the game you submit, writes notes on the moves that decided it, and publishes
                the review under their name.
              </p>
            </div>

            <div className="bm-hero__actions">
              <Button as={Link} to="/submit" variant="primary" size="lg">
                Submit a game
              </Button>
              {secondaryHref ? (
                <Button as={Link} to={secondaryHref} variant="secondary" size="lg">
                  Read a published review
                </Button>
              ) : (
                <Button as="a" href="#how-it-works" variant="secondary" size="lg">
                  See how it works
                </Button>
              )}
            </div>

            <ul className="bm-hero__facts">
              {HERO_FACTS.map((fact) => (
                <li key={fact} className="bm-hero__fact">
                  <CheckIcon />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="bm-preview bm-card--flush">
            <div className="bm-preview__header">
              <span className="bm-preview__caption">
                {note?.title ? note.title : "A published review"}
              </span>
              <StatusPill status="completed" />
            </div>

            <MiniBoard
              fen={note?.fen ?? START_FEN}
              highlight={note?.highlight ?? []}
              flipped
              label={note ? `Position after ${note.moveLabel}` : "Chess starting position"}
            />

            {note ? (
              <div className="bm-preview__note">
                <div className="bm-preview__note-meta">
                  <span className="bm-preview__move">{note.moveLabel}</span>
                  <span className="bm-meta">Reviewer note</span>
                </div>
                <p className="bm-preview__note-text">{note.text}</p>
                {note.reviewer ? (
                  <div className="bm-preview__byline">
                    <span className="bm-avatar" aria-hidden="true">
                      {initialOf(note.reviewer)}
                    </span>
                    <span>Written by {note.reviewer}</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="bm-preview__note">
                <p className="bm-preview__note-text">
                  Published reviews show a reviewer&rsquo;s notes beside the board, anchored to the move each note
                  explains.
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bm-shell">
          <div className="bm-section__head">
            <h2 className="bm-h2">How a review happens</h2>
          </div>
          <div className="bm-grid bm-grid--three">
            {HOW_IT_WORKS.map((step) => (
              <Card key={step.index}>
                <span className="bm-step__index">{step.index}</span>
                <h3 className="bm-step__title">{step.title}</h3>
                <p className="bm-body">{step.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Recently reviewed */}
        <section id="recent-reviews" className="bm-shell">
          <div className="bm-section__head">
            <h2 className="bm-h2">Recently reviewed</h2>
            <p className="bm-meta">Published reviews, open to read without an account.</p>
          </div>

          {recent.isLoading ? (
            <p className="bm-body" role="status" aria-live="polite">
              Loading published reviews&hellip;
            </p>
          ) : games.length > 0 ? (
            <div className="bm-grid bm-grid--three">
              {games.map((game) => (
                <ReviewCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <Callout tone="neutral" title="No published reviews to show yet">
              Completed reviews appear here as reviewers publish them.
            </Callout>
          )}
        </section>

        {/* Engine vs reviewer */}
        <section className="bm-shell">
          <div className="bm-compare">
            <div>
              <h2 className="bm-serif-lead">An engine tells you the move. A person tells you the habit.</h2>
              <p className="bm-body" style={{ marginTop: "var(--bm-space-6)" }}>
                Engine output is accurate and hard to learn from on its own. Boardmates reviewers are asked for the
                things a number cannot give you: what happened, why it mattered, and what to do differently next time.
              </p>
            </div>
            <div className="bm-compare__rows">
              <div className="bm-compare__row">
                <span className="bm-compare__label">Engine</span>
                <span className="bm-compare__value bm-mono">An evaluation number and a &ldquo;best move&rdquo;.</span>
              </div>
              <div className="bm-compare__row bm-compare__row--human">
                <span className="bm-compare__label">Reviewer</span>
                <span className="bm-compare__value">
                  {note
                    ? `“${note.text}”`
                    : "Plain language: what happened, why it mattered, and the habit that prevents it next time."}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="bm-shell">
          <div className="bm-cta-band">
            <div>
              <h2 className="bm-h1">Ready to have a game reviewed?</h2>
              <p className="bm-body" style={{ marginTop: "var(--bm-space-3)" }}>
                Submitting takes a PGN and a question. Creating an account takes an email and a password.
              </p>
            </div>
            <div className="bm-cta-band__actions">
              <Button as={Link} to="/submit" variant="primary" size="lg">
                Submit a game
              </Button>
              <Button as={Link} to="/signup" variant="secondary" size="lg">
                Create account
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}
