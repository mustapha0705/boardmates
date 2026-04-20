import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchGame } from "../services/api";
import { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import "../styles/game-review.css";
import { Chess } from "chess.js";

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

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => fetchGame(id),
  });

  const root = useMemo(() => {
    if (!game?.pgn) return null;
    return buildTreeFromPgn(game.pgn, game.comments || []);
  }, [game]);

  const [currentNode, setCurrentNode] = useState(null);
  const activeNode = currentNode ?? root;

  const goToFirst = useCallback(() => setCurrentNode(root), [root]);
  const goToPrev = useCallback(() => setCurrentNode((n) => (n ?? root)?.parent || n || root), [root]);
  const goToNext = useCallback(() => setCurrentNode((n) => (n ?? root)?.children[0] || n || root), [root]);
  const goToLast = useCallback(() => {
    setCurrentNode(() => {
      let cur = root;
      if (!cur) return null;
      while (cur.children.length > 0) cur = cur.children[0];
      return cur;
    });
  }, [root]);

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

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">{title}</h2>
          <span className="review-subtitle">{subtitle}</span>
        </div>
        {reviewerName && (
          <div className="reviewer-badge">
            <span className="reviewer-dot" />
            Reviewed by {reviewerName}
          </div>
        )}
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
            onSelectNode={setCurrentNode}
          />
        </div>
        <div className="right-column">
          <CommentList
            root={root}
            currentNode={activeNode}
            onSelectNode={setCurrentNode}
          />
        </div>
      </div>
    </main>
  );
}
