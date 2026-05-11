import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { claimReview, fetchGame } from "../services/api";
import { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import { useAuth } from "../context/useAuth";
import AuthPromptActions from "../components/AuthPromptActions.jsx";
import "../styles/game-review.css";
import { Chess } from "chess.js";
import { buildTreeFromAnalysisJson } from "../utils/analysisTree";
import { playMoveSoundForNode } from "../utils/moveSound";
import { formatAuthorOutcomeLine } from "../utils/gameOutcome";

let detailNodeId = 10000;

function buildTreeFromPgn(pgn, comments = []) {
  function createNode(fen, san = null, parent = null) {
    return {
      id: `detail-${++detailNodeId}`,
      fen,
      san,
      ply: parent ? parent.ply + 1 : 0,
      comment: "",
      parent,
      children: [],
    };
  }

  const commentMap = new Map();
  for (const c of comments) {
    commentMap.set(`${c.ply}:${c.san || ""}`, c.comment);
  }

  const root = createNode(new Chess().fen());
  try {
    const game = new Chess();
    game.loadPgn(pgn);
    const moves = game.history({ verbose: true });
    let current = root;
    const replay = new Chess(root.fen);
    for (const move of moves) {
      replay.move(move.san);
      const child = createNode(replay.fen(), move.san, current);
      const key = `${child.ply}:${child.san || ""}`;
      if (commentMap.has(key)) child.comment = commentMap.get(key);
      current.children.push(child);
      current = child;
    }
  } catch {
    // Invalid PGN — return empty root
  }
  return root;
}

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { viewerId, user, isAuthenticated } = useAuth();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => fetchGame(id),
  });

  const root = useMemo(() => {
    if (game?.analysisTree) {
      const fromJson = buildTreeFromAnalysisJson(game.analysisTree);
      if (fromJson) return fromJson;
    }
    if (!game?.pgn) return null;
    return buildTreeFromPgn(game.pgn, game.comments || []);
  }, [game]);

  const [currentNode, setCurrentNode] = useState(null);
  const [sandboxFen, setSandboxFen] = useState(null);
  const [claimError, setClaimError] = useState("");
  const [showClaimConfirm, setShowClaimConfirm] = useState(false);
  const activeNode = currentNode ?? root;

  const claimMutation = useMutation({
    mutationFn: claimReview,
    onSuccess: () => {
      setClaimError("");
      setShowClaimConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game", id] });
      navigate(`/review-game/${id}`, { replace: true });
    },
    onError: (err) => {
      setClaimError(err.message || "Could not claim this game.");
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

  const handleSelectNode = useCallback((node) => {
    if (!node || node.id === activeNode?.id) return;
    syncToGameNode(node, true);
  }, [activeNode, syncToGameNode]);

  const handleBoardMove = useCallback((from, to, promotion = "q") => {
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
  }, [sandboxFen, activeNode]);

  useKeyboardNav({ onFirst: goToFirst, onPrev: goToPrev, onNext: goToNext, onLast: goToLast });

  if (isLoading) {
    return (
      <main className="review-container">
        <p style={{ color: "var(--color-text-tertiary)", padding: 40 }}>Loading game…</p>
      </main>
    );
  }

  if (isError || !game || !root) {
    return (
      <main className="review-container">
        <p style={{ color: "var(--color-text-tertiary)", padding: 40 }}>Game not found.</p>
      </main>
    );
  }

  const authorName = game.author?.displayName ?? "Unknown";
  const reviewerName = game.reviewer?.displayName ?? null;
  const title = game.title;
  const subtitle = `${game.timeControl} · Submitted by ${authorName}`;
  const outcomeLine = formatAuthorOutcomeLine(game);
  const isAuthor = viewerId && (game.authorId === viewerId || game.author?.id === viewerId);
  const canClaimFromDetail = game.status === "pending" && !isAuthor;
  const viewerRapidRating = Number(user?.rapidRating);
  const gameAverageRating = Number(game.averageRating);
  const hasViewerRating = Number.isFinite(viewerRapidRating) && viewerRapidRating > 0;
  const hasGameAverageRating = Number.isFinite(gameAverageRating) && gameAverageRating > 0;
  const minRequiredRating = hasGameAverageRating ? gameAverageRating + 200 : null;
  const isPrivateGame = Boolean(game.isPrivate);
  const isRatingEligible = isPrivateGame || (hasViewerRating && hasGameAverageRating && viewerRapidRating >= minRequiredRating);
  const reviewEligibilityMessage = isPrivateGame
    ? ""
    : !hasViewerRating
      ? "Set your chess account rating to review games."
      : !hasGameAverageRating
        ? "This game has no average rating yet."
        : !isRatingEligible
          ? `You need ${minRequiredRating}+ rapid to review this game.`
          : "";
  const showGuestClaimPrompt = canClaimFromDetail && !isAuthenticated;
  const showClaimFlow = canClaimFromDetail && isAuthenticated && isRatingEligible;

  return (
    <main className="review-container">
      <title>Boardmates | Reviewed Game</title>
      <div className="review-header">
        <div>
          <h2 className="review-title">{title}</h2>
          <div className="review-subtitle-row">
            <span className="review-subtitle">{subtitle}</span>
            {isPrivateGame ? <span className="private-badge">Private</span> : null}
          </div>
          {outcomeLine ? <span className="review-outcome-note">{outcomeLine}</span> : null}
          {claimError ? (
            <p style={{ marginTop: 8, color: "var(--color-danger-soft-text, #b42318)", fontSize: 13 }}>
              {claimError}
            </p>
          ) : null}
        </div>
        <div className="review-header-actions">
          {showGuestClaimPrompt ? (
            <div className="review-header-guest-claim">
              <span className="review-header-guest-label">Review this game</span>
              <AuthPromptActions signupFirst />
            </div>
          ) : null}
          {canClaimFromDetail && isAuthenticated && !isRatingEligible ? (
            <p className="review-header-guest-label">{reviewEligibilityMessage}</p>
          ) : null}
          {showClaimFlow ? (
            showClaimConfirm ? (
              <div className="claim-confirm-inline">
                <span className="confirm-text">Start review?</span>
                <button
                  type="button"
                  className="confirm-yes-btn"
                  onClick={() => claimMutation.mutate(game.id)}
                  disabled={claimMutation.isPending}
                  aria-label="Confirm review game"
                  title="Confirm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="confirm-no-btn"
                  onClick={() => setShowClaimConfirm(false)}
                  disabled={claimMutation.isPending}
                  aria-label="Cancel review game"
                  title="Cancel"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="complete-review-btn"
                onClick={() => setShowClaimConfirm(true)}
                disabled={claimMutation.isPending}
              >
                {claimMutation.isPending ? "Claiming…" : "Review Game"}
              </button>
            )
          ) : null}
          {reviewerName && (
            <div className="reviewer-badge">
              <span className="reviewer-dot" />
              Reviewed by {reviewerName}
            </div>
          )}
        </div>
      </div>

      {game.reviewNotes && (
        <div className="review-notes-card">
          <div className="review-notes-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Submitter&rsquo;s Notes
          </div>
          <p className="review-notes-text">{game.reviewNotes}</p>
        </div>
      )}

      <div className="review-grid">
        <div className="left-column">
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
          <MoveList
            root={root}
            currentNode={activeNode}
            onSelectNode={handleSelectNode}
          />
        </div>
        <div className="right-column">
          <CommentList
            root={root}
            currentNode={activeNode}
            onSelectNode={handleSelectNode}
          />
        </div>
      </div>
    </main>
  );
}
