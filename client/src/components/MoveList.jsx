import { getMoveLabel } from "../hooks/useAnalysisTree";

const NAG_SYMBOLS = {
  Brilliant: "!!",
  "Good Move": "!",
  Inaccuracy: "?!",
  Mistake: "?",
  Blunder: "??",
};

export default function MoveList({ root, currentNode, onSelectNode }) {
  function cell(node) {
    const isActive = currentNode.id === node.id;
    const hasAnnotation = node.comment || node.nag;
    return (
      <span
        key={`c-${node.id}`}
        className={
          "move-cell" +
          (isActive ? " active-move" : "") +
          (hasAnnotation ? " has-comment" : "")
        }
        onClick={() => onSelectNode(node)}
      >
        {node.san}
        {node.nag && <span className="nag"> {NAG_SYMBOLS[node.nag]}</span>}
      </span>
    );
  }

  function renderLine(firstNode) {
    const elements = [];
    let node = firstNode;

    while (node) {
      const isWhite = node.ply % 2 === 1;
      const moveNum = Math.ceil(node.ply / 2);

      if (isWhite) {
        const black = node.children[0] ?? null;

        elements.push(
          <div key={node.id} className="move-row">
            <span className="move-num">{moveNum}.</span>
            {cell(node)}
            {black ? cell(black) : <span className="move-cell" />}
          </div>
        );

        for (let i = 1; i < node.children.length; i++) {
          const v = node.children[i];
          elements.push(
            <div key={`v-${v.id}`} className="variation-block">
              {renderLine(v)}
            </div>
          );
        }

        if (black) {
          for (let i = 1; i < black.children.length; i++) {
            const v = black.children[i];
            elements.push(
              <div key={`v-${v.id}`} className="variation-block">
                {renderLine(v)}
              </div>
            );
          }
          node = black.children[0] ?? null;
        } else {
          node = null;
        }
      } else {
        elements.push(
          <div key={node.id} className="move-row">
            <span className="move-num">{moveNum}.</span>
            <span className="move-cell ellipsis">…</span>
            {cell(node)}
          </div>
        );

        for (let i = 1; i < node.children.length; i++) {
          const v = node.children[i];
          elements.push(
            <div key={`v-${v.id}`} className="variation-block">
              {renderLine(v)}
            </div>
          );
        }

        node = node.children[0] ?? null;
      }
    }

    return elements;
  }

  const label = getMoveLabel(currentNode);

  return (
    <div className="card">
      <div className="card-header">
        Move History
        <span className="current-label">{label}</span>
      </div>
      <div className="move-tree">
        {root.children.length > 0 ? (
          renderLine(root.children[0])
        ) : (
          <div className="move-empty">Play a move to begin analysis</div>
        )}
      </div>
    </div>
  );
}
