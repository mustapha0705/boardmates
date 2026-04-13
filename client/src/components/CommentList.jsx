import { useState } from "react";
import { getMoveLabel } from "../hooks/useAnalysisTree";

const NAG_SYMBOLS = {
  Brilliant: "!!",
  "Good Move": "!",
  Inaccuracy: "?!",
  Mistake: "?",
  Blunder: "??",
};

function collectAnnotatedNodes(node) {
  const result = [];
  function walk(n) {
    if (n.comment || n.nag) result.push(n);
    for (const child of n.children) walk(child);
  }
  walk(node);
  result.sort((a, b) => a.ply - b.ply);
  return result;
}

export default function CommentList({ root, currentNode, onSelectNode }) {
  const [search, setSearch] = useState("");

  const annotated = collectAnnotatedNodes(root);

  const filtered = annotated.filter((node) => {
    const q = search.toLowerCase();
    const label = getMoveLabel(node).toLowerCase();
    const text = (node.comment || "").toLowerCase();
    return label.includes(q) || text.includes(q);
  });

  return (
    <div className="comments-card">
      <div className="comments-header">
        <span>Reviewer Notes</span>
        <span className="comments-count">{annotated.length}</span>
      </div>

      <div className="comments-body">
        {filtered.length === 0 ? (
          <div className="move-empty">
            {annotated.length === 0
              ? "No annotations yet. Select a move and add a comment."
              : "No results match your search."}
          </div>
        ) : (
          filtered.map((node) => {
            const label = getMoveLabel(node);
            const isActive = currentNode.id === node.id;
            return (
              <div
                key={node.id}
                className={`comment ${isActive ? "active" : ""}`}
                onClick={() => onSelectNode(node)}
              >
                <div className="comment-meta">
                  <span className={`tag ${isActive ? "" : "muted"}`}>
                    {label}
                    {node.nag ? ` ${NAG_SYMBOLS[node.nag] || ""}` : ""}
                  </span>
                </div>
                {node.comment && (
                  <p className="comment-text">{node.comment}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="comment-search">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search comments..."
        />
      </div>
    </div>
  );
}
