import useAnalysisTree, { getMoveLabel } from "../hooks/useAnalysisTree";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import "../styles/game-detail.css";

export default function GameDetail() {
  const tree = useAnalysisTree();

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">Carlsen vs. Nepomniachtchi</h2>
          <span className="review-subtitle">
            World Championship 2021 · Game 6
          </span>
        </div>
      </div>

      <div className="review-grid">
        <div className="left-column">
          <ChessBoard
            fen={tree.currentNode.fen}
            onMove={tree.makeMove}
            onFirst={tree.goToFirst}
            onPrev={tree.goToPrev}
            onNext={tree.goToNext}
            onLast={tree.goToLast}
            moveLabel={getMoveLabel(tree.currentNode)}
          />
          <MoveList
            root={tree.root}
            currentNode={tree.currentNode}
            onSelectNode={tree.goToNode}
          />
        </div>
        <div className="right-column">
          <CommentList
            root={tree.root}
            currentNode={tree.currentNode}
            onSelectNode={tree.goToNode}
          />
        </div>
      </div>
    </main>
  );
}
