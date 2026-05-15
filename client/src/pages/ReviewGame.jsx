import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { fetchGame, completeReview, upsertComment, saveReviewAnalysisDraft } from "../services/api";
import useAnalysisTree, { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";
import GameAverageRatingChip from "../components/GameAverageRatingChip.jsx";
import "../styles/game-review.css";
import { serializeAnalysisTreeNode } from "../utils/analysisTree";
import { playMoveSoundForNode } from "../utils/moveSound";
import { formatAuthorOutcomeLine } from "../utils/gameOutcome";

function ReviewGameInner({
  game,
  onCompleteWithAnalysis,
  completing,
  completeError,
  onSaveComment,
  savingComment,
}) {
  const queryClient = useQueryClient();
  const { viewerId } = useAuth();
  const tree = useAnalysisTree({
    pgn: game?.pgn,
    serverAnalysisJson: game?.analysisTree ?? null,
    serverComments: game?.comments ?? [],
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const { structureVersion, getSerializedTree } = tree;
  const draftInFlightIdRef = useRef(0);
  const draftAbortRef = useRef(null);

  useEffect(() => {
    if (structureVersion < 1) return;
    if (!game?.id || game.status !== "in_review") return;
    if (game.reviewer?.id !== viewerId) return;

    const t = setTimeout(() => {
      const payload = getSerializedTree();
      if (!payload) return;
      draftAbortRef.current?.abort();
      const ac = new AbortController();
      draftAbortRef.current = ac;
      const thisReq = (draftInFlightIdRef.current += 1);
      saveReviewAnalysisDraft(game.id, payload, { signal: ac.signal })
        .then((updated) => {
          if (thisReq !== draftInFlightIdRef.current) return;
          queryClient.setQueryData(["game", game.id], updated);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
        });
    }, 1100);

    return () => {
      clearTimeout(t);
      draftAbortRef.current?.abort();
    };
  }, [structureVersion, game?.id, game?.status, game?.reviewer?.id, viewerId, queryClient, getSerializedTree]);

  const handleSaveComment = useCallback(
    (text) => {
      const node = tree.currentNode;
      tree.setComment(text);
      if (game?.id) {
        onSaveComment({
          ply: node.ply,
          san: node.san || null,
          comment: text,
          analysisTree: getSerializedTree(),
        });
      }
    },
    [tree, game?.id, onSaveComment, getSerializedTree],
  );

  const title = game?.title || "Game Review";
  const authorName = game?.author?.displayName ?? "Unknown";
  const subtitle = game ? `${game.timeControl} · Submitted by ${authorName}` : "";
  const outcomeLine = formatAuthorOutcomeLine(game);

  const isInReview = game?.status === "in_review";
  const isMyReview = game?.reviewer?.id === viewerId;
  const boardReady = Boolean(tree.root);
  const isPrivateGame = Boolean(game?.isPrivate);

  const handleSelectNode = useCallback((node) => {
    if (!node || node.id === tree.currentNode?.id) return;
    tree.goToNode(node);
    playMoveSoundForNode(node);
  }, [tree]);

  const handleFirst = useCallback(() => {
    const target = tree.root;
    if (!target || target.id === tree.currentNode?.id) return;
    tree.goToFirst();
    playMoveSoundForNode(target);
  }, [tree]);

  const handlePrev = useCallback(() => {
    const target = tree.currentNode?.parent;
    if (!target) return;
    tree.goToPrev();
    playMoveSoundForNode(target);
  }, [tree]);

  const handleNext = useCallback(() => {
    const target = tree.currentNode?.children?.[0];
    if (!target) return;
    tree.goToNext();
    playMoveSoundForNode(target);
  }, [tree]);

  const handleLast = useCallback(() => {
    let target = tree.currentNode;
    if (!target) return;
    while (target.children.length > 0) target = target.children[0];
    if (target.id === tree.currentNode?.id) return;
    tree.goToLast();
    playMoveSoundForNode(target);
  }, [tree]);

  useKeyboardNav({
    onFirst: handleFirst,
    onPrev: handlePrev,
    onNext: handleNext,
    onLast: handleLast,
  });

  const handleMakeMove = useCallback(
    (from, to, promotion = "q") => {
      const result = tree.makeMove(from, to, promotion);
      if (result?.san) playMoveSoundForNode(result);
      return result;
    },
    [tree],
  );

  const header = (
    <>
      <div className="review-header">
        <div>
          <h2 className="review-title">{title}</h2>
          <div className="review-subtitle-row">
            {subtitle ? <span className="review-subtitle">{subtitle}</span> : null}
            {isPrivateGame ? <span className="private-badge">Private</span> : null}
          </div>
          {outcomeLine ? <span className="review-outcome-note">{outcomeLine}</span> : null}
        </div>
        <div className="review-header-actions">
          {boardReady && isInReview && isMyReview && !showConfirm && (
            <button
              type="button"
              className="complete-review-btn"
              onClick={() => setShowConfirm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Complete Review
            </button>
          )}
          {boardReady && isInReview && isMyReview && showConfirm && (
            <div className="complete-confirm">
              <span className="confirm-text">Mark as completed?</span>
              {completeError && (
                <span style={{ display: "block", marginBottom: 8, color: "#b42318", fontSize: 13 }}>
                  {completeError}
                </span>
              )}
              <button
                className="confirm-yes-btn"
                type="button"
                onClick={() => onCompleteWithAnalysis(serializeAnalysisTreeNode(tree.root))}
                disabled={completing}
              >
                {completing ? "Finishing…" : "Yes, finish"}
              </button>
              <button
                type="button"
                className="confirm-no-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="review-header-rating-row">
        <GameAverageRatingChip averageRating={game?.averageRating} />
      </div>
    </>
  );

  if (!tree.root) {
    return (
      <main className="review-container">
        <title>Boardmates | Review Game</title>
        {header}
        <p className="review-preparing-msg" role="status" aria-live="polite">
          Preparing board…
        </p>
      </main>
    );
  }

  return (
    <main className="review-container">
      <title>Boardmates | Review Game</title>
      {header}

      {game?.reviewNotes && (
        <div className="review-notes-card">
          <div className="review-notes-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Submitter&rsquo;s Review Request
          </div>
          <p className="review-notes-text">{game.reviewNotes}</p>
        </div>
      )}

      <div className="review-grid">
        <div className="left-column">
          <ChessBoard
            fen={tree.currentNode.fen}
            currentNode={tree.currentNode}
            onMove={handleMakeMove}
            onFirst={handleFirst}
            onPrev={handlePrev}
            onNext={handleNext}
            onLast={handleLast}
            moveLabel={getMoveLabel(tree.currentNode)}
          />
          <MoveList
            root={tree.root}
            currentNode={tree.currentNode}
            onSelectNode={handleSelectNode}
          />
          <CommentForm
            currentNode={tree.currentNode}
            onSaveComment={handleSaveComment}
            saving={savingComment}
          />
        </div>
        <div className="right-column">
          <CommentList
            root={tree.root}
            currentNode={tree.currentNode}
            onSelectNode={handleSelectNode}
          />
        </div>
      </div>
    </main>
  );
}

export default function ReviewGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [completeError, setCompleteError] = useState("");

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => fetchGame(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const completeMutation = useMutation({
    mutationFn: (analysisTree) => completeReview(id, { analysisTree }),
    onSuccess: () => {
      setCompleteError("");
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game", id] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/");
    },
    onError: (err) => {
      setCompleteError(err.message || "Could not complete review. Try again.");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data) => upsertComment(id, data),
    onSuccess: (data) => {
      if (data?.game) {
        queryClient.setQueryData(["game", id], data.game);
      } else {
        queryClient.invalidateQueries({ queryKey: ["game", id] });
      }
    },
  });

  const handleSaveComment = useCallback(
    (payload) => commentMutation.mutate(payload),
    [commentMutation],
  );

  if (isLoading) {
    return (
      <main className="review-container">
        <p style={{ color: "var(--color-text-tertiary)", padding: 40 }}>Loading game…</p>
      </main>
    );
  }

  if (isError || !game) {
    return (
      <main className="review-container">
        <p style={{ color: "var(--color-text-tertiary)", padding: 40 }}>Game not found.</p>
      </main>
    );
  }

  return (
    <ReviewGameInner
      key={id}
      game={game}
      onCompleteWithAnalysis={(analysisTree) => {
        setCompleteError("");
        completeMutation.mutate(analysisTree);
      }}
      completeError={completeError}
      completing={completeMutation.isPending}
      onSaveComment={handleSaveComment}
      savingComment={commentMutation.isPending}
    />
  );
}
