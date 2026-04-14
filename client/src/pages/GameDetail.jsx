import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import { useGames } from "../context/GameContext";
import buildMockReviewedGame from "../data/mockReviewedGame";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import "../styles/game-review.css";
import { Chess } from "chess.js";

let detailNodeId = 10000;

function buildTreeFromPgn(pgn) {
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
  const { getGame } = useGames();
  const game = getGame(id);

  const { root, meta } = useMemo(() => {
    if (game?.pgn) {
      const treeRoot = buildTreeFromPgn(game.pgn);
      return {
        root: treeRoot,
        meta: {
          white: game.title,
          black: "",
          event: `${game.timeControl} · Submitted by ${game.author}`,
          reviewer: game.reviewer,
        },
      };
    }
    return buildMockReviewedGame();
  }, [game]);

  const [currentNode, setCurrentNode] = useState(root);

  const goToFirst = useCallback(() => setCurrentNode(root), [root]);

  const goToPrev = useCallback(
    () => setCurrentNode((n) => n.parent || n),
    [],
  );

  const goToNext = useCallback(
    () => setCurrentNode((n) => n.children[0] || n),
    [],
  );

  const goToLast = useCallback(
    () =>
      setCurrentNode((n) => {
        let cur = n;
        while (cur.children.length > 0) cur = cur.children[0];
        return cur;
      }),
    [],
  );

  useKeyboardNav({
    onFirst: goToFirst,
    onPrev: goToPrev,
    onNext: goToNext,
    onLast: goToLast,
  });

  const title = meta.black
    ? `${meta.white} vs. ${meta.black}`
    : meta.white;

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">{title}</h2>
          <span className="review-subtitle">{meta.event}</span>
        </div>
        {meta.reviewer && (
          <div className="reviewer-badge">
            <span className="reviewer-dot" />
            Reviewed by {meta.reviewer}
          </div>
        )}
      </div>

      {game?.reviewNotes && (
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
            fen={currentNode.fen}
            onMove={NOOP}
            onFirst={goToFirst}
            onPrev={goToPrev}
            onNext={goToNext}
            onLast={goToLast}
            moveLabel={getMoveLabel(currentNode)}
            readOnly
          />
          <MoveList
            root={root}
            currentNode={currentNode}
            onSelectNode={setCurrentNode}
          />
        </div>
        <div className="right-column">
          <CommentList
            root={root}
            currentNode={currentNode}
            onSelectNode={setCurrentNode}
          />
        </div>
      </div>
    </main>
  );
}
