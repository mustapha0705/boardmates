import { useState, useCallback, useMemo } from "react";
import { getMoveLabel } from "../hooks/useAnalysisTree";
import useKeyboardNav from "../hooks/useKeyboardNav";
import buildMockReviewedGame from "../data/mockReviewedGame";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import "../styles/game-detail.css";

const NOOP = () => null;

export default function GameDetail() {
  const { root, meta } = useMemo(() => buildMockReviewedGame(), []);
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

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">
            {meta.white} vs. {meta.black}
          </h2>
          <span className="review-subtitle">{meta.event}</span>
        </div>
        <div className="reviewer-badge">
          <span className="reviewer-dot" />
          Reviewed by {meta.reviewer}
        </div>
      </div>

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
