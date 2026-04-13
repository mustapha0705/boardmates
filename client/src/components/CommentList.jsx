import { useState } from "react";
import { getMoveLabel } from "../hooks/useAnalysisTree";

function collectCommentedNodes(node) {
  const result = [];
  function walk(n) {
    if (n.comment) result.push(n);
    for (const child of n.children) walk(child);
  }
  walk(node);
  result.sort((a, b) => a.ply - b.ply);
  return result;
}

export default function CommentList({ root, currentNode, onSelectNode }) {
  const [search, setSearch] = useState("");

  const commented = collectCommentedNodes(root);

  const filtered = commented.filter((node) => {
    const q = search.toLowerCase();
    const label = getMoveLabel(node).toLowerCase();
    const text = node.comment.toLowerCase();
    return label.includes(q) || text.includes(q);
  });

  return (
    <div className="comments-card">
      <div className="comments-header">
        <span>Reviewer Notes</span>
        <span className="comments-count">{commented.length}</span>
      </div>

      <div className="comments-body">
        {filtered.length === 0 ? (
          <div className="move-empty">
            {commented.length === 0
              ? "No comments yet. Select a move and add a comment."
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
                  </span>
                </div>
                <p className="comment-text">{node.comment}</p>
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
