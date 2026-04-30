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
import "../styles/game-review.css";
import { Chess } from "chess.js";
import { buildTreeFromAnalysisJson } from "../utils/analysisTree";
import { playMoveSoundForNode } from "../utils/moveSound";

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

const NOOP = () => null;

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { viewerId } = useAuth();

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
  const [claimError, setClaimError] = useState("");
  const activeNode = currentNode ?? root;

  const claimMutation = useMutation({
    mutationFn: claimReview,
    onSuccess: () => {
      setClaimError("");
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game", id] });
      navigate(`/review-game/${id}`, { replace: true });
    },
    onError: (err) => {
      setClaimError(err.message || "Could not claim this game.");
    },
  });

  const goToFirst = useCallback(() => {
    if (!root || activeNode?.id === root.id) return;
    setCurrentNode(root);
    playMoveSoundForNode(root);
  }, [root, activeNode]);

  const goToPrev = useCallback(() => {
    const target = (activeNode ?? root)?.parent;
    if (!target) return;
    setCurrentNode(target);
    playMoveSoundForNode(target);
  }, [activeNode, root]);

  const goToNext = useCallback(() => {
    const target = (activeNode ?? root)?.children?.[0];
    if (!target) return;
    setCurrentNode(target);
    playMoveSoundForNode(target);
  }, [activeNode, root]);

  const goToLast = useCallback(() => {
    let cur = activeNode ?? root;
    if (!cur) return;
    while (cur.children.length > 0) cur = cur.children[0];
    if (cur.id === activeNode?.id) return;
    setCurrentNode(cur);
    playMoveSoundForNode(cur);
  }, [activeNode, root]);

  const handleSelectNode = useCallback((node) => {
    if (!node || node.id === activeNode?.id) return;
    setCurrentNode(node);
    playMoveSoundForNode(node);
  }, [activeNode]);

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
  const isAuthor = viewerId && (game.authorId === viewerId || game.author?.id === viewerId);
  const canClaimFromDetail = game.status === "pending" && !isAuthor;

  return (
    <main className="review-container">
      <title>Boardmates | Reviewed Game</title>
      <div className="review-header">
        <div>
          <h2 className="review-title">{title}</h2>
          <span className="review-subtitle">{subtitle}</span>
          {claimError ? (
            <p style={{ marginTop: 8, color: "var(--color-danger-soft-text, #b42318)", fontSize: 13 }}>
              {claimError}
            </p>
          ) : null}
        </div>
        <div className="review-header-actions">
          {canClaimFromDetail ? (
            <button
              type="button"
              className="complete-review-btn"
              onClick={() => claimMutation.mutate(game.id)}
              disabled={claimMutation.isPending}
            >
              {claimMutation.isPending ? "Claiming…" : "Review Game"}
            </button>
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
            fen={activeNode.fen}
            currentNode={activeNode}
            onMove={NOOP}
            onFirst={goToFirst}
            onPrev={goToPrev}
            onNext={goToNext}
            onLast={goToLast}
            moveLabel={getMoveLabel(activeNode)}
            readOnly
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
