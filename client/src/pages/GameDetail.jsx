import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chess } from "chess.js";
import { claimReview, fetchGame } from "../services/api";
import { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import ClaimDialog from "../components/app/ClaimDialog.jsx";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import Card from "../components/ui/Card.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import { useAuth } from "../context/useAuth";
import { readPgnMetadata } from "../adapters/pgnMetadata";
import { buildTreeFromAnalysisJson, buildTreeFromPgnWithComments } from "../utils/analysisTree";
import { playMoveSoundForNode } from "../utils/moveSound";
import { formatAuthorOutcomeLine } from "../utils/gameOutcome";
import { getReviewEligibility } from "../utils/reviewEligibility";
import { formatDate } from "../utils/time";
import { metaLine } from "../utils/metaLine";
// game-review.css styles the shared board, move list and notes components.
import "../styles/game-review.css";
import "../styles/game-detail.css";

function hasComments(node) {
  if (node.comment) return true;
  return node.children.some(hasComments);
}

/**
 * Published games show the reviewer's tree and notes. Before publication the page shows
 * the submitted moves only, so notes still being written are not presented as a review.
 */
function buildDetailTree(game) {
  if (!game?.pgn) return null;
  if (game.status === "completed") {
    if (game.analysisTree) {
      const fromJson = buildTreeFromAnalysisJson(game.analysisTree);
      if (fromJson) return fromJson;
    }
    return buildTreeFromPgnWithComments(game.pgn, game.comments || []);
  }
  return buildTreeFromPgnWithComments(game.pgn);
}

function playersLine(metadata) {
  if (!metadata?.white || !metadata?.black) return null;
  const white = metadata.whiteElo ? `${metadata.white} (${metadata.whiteElo})` : metadata.white;
  const black = metadata.blackElo ? `${metadata.black} (${metadata.blackElo})` : metadata.black;
  return `${white} vs ${black}`;
}

function useCopyLink() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      window.prompt("Copy this link", window.location.href);
    }
  }, []);

  return { copied, copy };
}

function NotesPlaceholder({ title, children }) {
  return (
    <Card className="bm-detail__notes">
      <div className="bm-detail__notes-head">
        <h2 className="bm-h3">Reviewer notes</h2>
      </div>
      <div className="bm-empty">
        <p className="bm-h3">{title}</p>
        <p className="bm-body">{children}</p>
      </div>
    </Card>
  );
}

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { viewerId, user, isAuthenticated } = useAuth();
  const { copied, copy } = useCopyLink();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => fetchGame(id),
  });

  const root = useMemo(() => buildDetailTree(game), [game]);
  const pgn = game?.pgn;
  const metadata = useMemo(() => (pgn ? readPgnMetadata(pgn) : null), [pgn]);

  const [currentNode, setCurrentNode] = useState(null);
  const [sandboxFen, setSandboxFen] = useState(null);
  const [claimError, setClaimError] = useState("");
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const activeNode = currentNode ?? root;

  const claimMutation = useMutation({
    mutationFn: claimReview,
    onSuccess: () => {
      setClaimError("");
      setShowClaimDialog(false);
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game", id] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      navigate(`/review-game/${id}`, { replace: true });
    },
    onError: (err) => {
      setShowClaimDialog(false);
      setClaimError(err.message || "Could not claim this game.");
      // Refresh so a claim conflict shows who holds the game now.
      queryClient.invalidateQueries({ queryKey: ["game", id] });
    },
  });

  const syncToGameNode = useCallback((node, playSound = false) => {
    if (!node) return;
    setCurrentNode(node);
    setSandboxFen(null);
    if (playSound) playMoveSoundForNode(node);
  }, []);

  const goToFirst = useCallback(() => {
    if (!root || activeNode?.id === root.id) return;
    syncToGameNode(root, true);
  }, [root, activeNode, syncToGameNode]);

  const goToPrev = useCallback(() => {
    const target = (activeNode ?? root)?.parent;
    if (!target) return;
    syncToGameNode(target, true);
  }, [activeNode, root, syncToGameNode]);

  const goToNext = useCallback(() => {
    const target = (activeNode ?? root)?.children?.[0];
    if (!target) return;
    syncToGameNode(target, true);
  }, [activeNode, root, syncToGameNode]);

  const goToLast = useCallback(() => {
    let cur = activeNode ?? root;
    if (!cur) return;
    while (cur.children.length > 0) cur = cur.children[0];
    if (cur.id === activeNode?.id) return;
    syncToGameNode(cur, true);
  }, [activeNode, root, syncToGameNode]);

  const handleSelectNode = useCallback(
    (node) => {
      if (!node || node.id === activeNode?.id) return;
      syncToGameNode(node, true);
    },
    [activeNode, syncToGameNode],
  );

  const handleBoardMove = useCallback(
    (from, to, promotion = "q") => {
      const startFen = sandboxFen || activeNode?.fen;
      if (!startFen) return null;

      const gameForBoard = new Chess(startFen);
      let move;
      try {
        move = gameForBoard.move({ from, to, promotion });
      } catch {
        return null;
      }
      if (!move) return null;

      setSandboxFen(gameForBoard.fen());
      playMoveSoundForNode({ san: move.san });
      return { fen: gameForBoard.fen() };
    },
    [sandboxFen, activeNode],
  );

  useKeyboardNav({ onFirst: goToFirst, onPrev: goToPrev, onNext: goToNext, onLast: goToLast });

  if (isLoading) {
    return (
      <div className="bm-detail">
        <title>Boardmates | Game</title>
        <p className="bm-body" role="status" aria-live="polite">
          Loading game&hellip;
        </p>
      </div>
    );
  }

  if (isError || !game || !root) {
    return (
      <div className="bm-detail">
        <title>Boardmates | Game not found</title>
        <h1 className="bm-h1">Game not found</h1>
        <Callout tone="neutral" title="We couldn’t open this game">
          The link may be wrong, or the game may have been removed.
        </Callout>
        <div>
          <Button as={Link} to="/" variant="secondary" size="sm">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const authorName = game.author?.displayName ?? "Unknown";
  const reviewerName = game.reviewer?.displayName ?? null;
  const isAuthor = Boolean(viewerId) && (game.authorId === viewerId || game.author?.id === viewerId);
  const isAssignedReviewer = Boolean(viewerId) && game.reviewer?.id === viewerId;
  const isPending = game.status === "pending";
  const isInReview = game.status === "in_review";
  const isCompleted = game.status === "completed";
  const viewerRating = Number(user?.rapidRating);
  const eligibility = getReviewEligibility({
    viewerRapidRating: user?.rapidRating,
    gameAverageRating: game.averageRating,
    isPrivate: game.isPrivate,
  });
  const canClaim = isPending && isAuthenticated && !isAuthor && eligibility.canReview;
  const blockedClaim = isPending && isAuthenticated && !isAuthor && !eligibility.canReview;
  const question = String(game.reviewNotes ?? "").trim();
  const outcomeLine = formatAuthorOutcomeLine(game);
  const pageTitle = isCompleted ? "Reviewed Game" : "Game";
  const justSubmitted = Boolean(location.state?.justSubmitted) && isAuthor;
  const publishedHasNotes = isCompleted && hasComments(root);

  const statusPill = isInReview ? (
    <StatusPill status="in_review" label={reviewerName ? `Being reviewed by ${reviewerName}` : undefined} />
  ) : isCompleted ? (
    <StatusPill status="completed" />
  ) : (
    <StatusPill status="pending" />
  );

  return (
    <div className="bm-detail">
      <title>{`Boardmates | ${pageTitle}`}</title>

      {justSubmitted ? (
        <Callout tone="success" role="status" title="Game submitted">
          {game.isPrivate
            ? "It’s waiting for a reviewer. It isn’t listed publicly, so share this page’s link with a reviewer you’d like to ask."
            : "It’s now in the list of games waiting for a reviewer."}
        </Callout>
      ) : null}

      <header className="bm-detail__header">
        <div className="bm-detail__heading">
          <div className="bm-detail__pills">
            {statusPill}
            {game.isPrivate ? <StatusPill status="private" /> : null}
          </div>
          <h1 className="bm-h1 bm-detail__title">{game.title}</h1>
          <p className="bm-detail__meta">
            {metaLine(
              game.timeControl,
              game.averageRating ? `avg ${game.averageRating}` : null,
              metadata ? `${metadata.moveCount} moves` : null,
              `submitted by ${isAuthor ? "you" : authorName}`,
              game.submittedAt ? formatDate(game.submittedAt) : null,
              isCompleted && reviewerName ? `reviewed by ${reviewerName}` : null,
            )}
          </p>
          {outcomeLine || playersLine(metadata) ? (
            <p className="bm-detail__sub">{metaLine(outcomeLine, playersLine(metadata))}</p>
          ) : null}
        </div>

        <div className="bm-detail__actions">
          {isPending && !isAuthenticated ? (
            <>
              <Button as={Link} to="/login" state={{ from: location }} variant="primary">
                Sign in to review
              </Button>
              <Button as={Link} to="/signup" state={{ from: location }} variant="tertiary" size="sm">
                Create account
              </Button>
            </>
          ) : null}
          {canClaim ? (
            <Button
              variant="primary"
              onClick={() => {
                setClaimError("");
                setShowClaimDialog(true);
              }}
              loading={claimMutation.isPending}
              disabled={claimMutation.isPending}
            >
              {claimMutation.isPending ? "Claiming…" : "Review this game"}
            </Button>
          ) : null}
          {blockedClaim ? (
            <div className="bm-detail__blocked">
              <Button variant="secondary" disabled aria-describedby="detail-claim-reason">
                Review this game
              </Button>
              <p className="bm-meta" id="detail-claim-reason">
                {eligibility.message}
              </p>
            </div>
          ) : null}
          {isInReview && isAssignedReviewer ? (
            <Button as={Link} to={`/review-game/${game.id}`} variant="primary">
              Continue review
            </Button>
          ) : null}
          {isAuthor || isCompleted ? (
            <Button variant="secondary" size="sm" onClick={copy}>
              {copied ? "Link copied" : isAuthor && !isCompleted ? "Copy share link" : "Copy link"}
            </Button>
          ) : null}
          <span className="bm-visually-hidden" role="status" aria-live="polite">
            {copied ? "Link copied to the clipboard" : ""}
          </span>
        </div>
      </header>

      {claimError ? (
        <Callout tone="error" role="alert" title="We couldn’t claim this game">
          {claimError}
        </Callout>
      ) : null}

      {isPending && isAuthenticated && !isAuthor ? (
        <div className="bm-detail__tiles">
          {!game.isPrivate && eligibility.minRequired ? (
            <div className="bm-stat">
              <span className="bm-stat__label">Rating requirement</span>
              <span className="bm-detail__tile-value bm-mono">{eligibility.minRequired}+ rapid</span>
            </div>
          ) : null}
          {Number.isFinite(viewerRating) && viewerRating > 0 ? (
            <div className="bm-stat">
              <span className="bm-stat__label">Your rating</span>
              <span className={`bm-detail__tile-value bm-mono ${eligibility.canReview ? "is-ok" : ""}`}>{viewerRating} rapid</span>
            </div>
          ) : null}
          <div className="bm-stat">
            <span className="bm-stat__label">To publish</span>
            <span className="bm-detail__tile-value">At least 3 move notes</span>
          </div>
        </div>
      ) : null}

      {question ? (
        <Card className="bm-detail__question">
          <span className="bm-overline">What {isAuthor ? "you want" : `${authorName} wants`} to understand</span>
          <p className="bm-body bm-body--strong">{question}</p>
        </Card>
      ) : null}

      <div className="bm-detail__grid">
        <div className="bm-detail__board">
          <ChessBoard
            fen={sandboxFen || activeNode.fen}
            currentNode={activeNode}
            onMove={handleBoardMove}
            onFirst={goToFirst}
            onPrev={goToPrev}
            onNext={goToNext}
            onLast={goToLast}
            moveLabel={sandboxFen ? "Analysis board" : getMoveLabel(activeNode)}
          />
          <MoveList root={root} currentNode={activeNode} onSelectNode={handleSelectNode} />
        </div>

        <div className="bm-detail__side">
          {publishedHasNotes ? (
            <CommentList root={root} currentNode={activeNode} onSelectNode={handleSelectNode} />
          ) : isCompleted ? (
            <NotesPlaceholder title="This review has no published notes">
              Reviews completed before move notes were required can be empty. You can still play through the game.
            </NotesPlaceholder>
          ) : isInReview ? (
            <NotesPlaceholder title={isAssignedReviewer ? "You’re reviewing this game" : "Review in progress"}>
              {isAssignedReviewer
                ? "Write and save your notes in the review workspace. They appear here once you publish."
                : `${reviewerName ?? "A reviewer"} is writing notes on this game. They appear here once the review is published.`}
            </NotesPlaceholder>
          ) : isAuthor ? (
            <NotesPlaceholder title="Nothing to read yet">
              Your game is waiting for a reviewer. Their notes appear here once the review is published.
            </NotesPlaceholder>
          ) : canClaim ? (
            <NotesPlaceholder title="No notes yet">
              Claim the game to start writing notes. Publishing needs at least 3 move notes.
            </NotesPlaceholder>
          ) : blockedClaim ? (
            <NotesPlaceholder title="Locked for review">
              You can still play through the game and read the review once it’s published.
            </NotesPlaceholder>
          ) : (
            <NotesPlaceholder title="No published notes yet">
              This game is waiting for a reviewer. When one publishes, their notes appear here alongside the board.
            </NotesPlaceholder>
          )}
        </div>
      </div>

      {showClaimDialog ? (
        <ClaimDialog
          game={game}
          viewerRating={user?.rapidRating}
          pending={claimMutation.isPending}
          onConfirm={() => claimMutation.mutate(game.id)}
          onClose={() => setShowClaimDialog(false)}
        />
      ) : null}
    </div>
  );
}
