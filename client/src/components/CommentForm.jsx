import { useState, useEffect } from "react";
import { getMoveLabel } from "../hooks/useAnalysisTree";

const TAGS = ["Good Move", "Mistake", "Blunder", "Brilliant", "Inaccuracy"];

export default function CommentForm({ currentNode, onSaveComment, onSetNag }) {
  const [text, setText] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    setText(currentNode.comment || "");
    setSelectedTag(currentNode.nag || null);
  }, [currentNode]);

  function handleSave() {
    onSaveComment(text.trim());
    onSetNag(selectedTag);
  }

  function handleClear() {
    setText("");
    setSelectedTag(null);
    onSaveComment("");
    onSetNag(null);
  }

  const label = getMoveLabel(currentNode);

  return (
    <div className="card">
      <div className="comment-form-header">
        <h3 className="annotate-title">Annotate {label}</h3>
      </div>

      <div className="tag-row">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`tag-chip ${selectedTag === tag ? "selected" : ""}`}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <textarea
        className="annotation-input"
        placeholder="Write your analysis..."
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="comment-actions">
        <button className="btn-secondary" onClick={handleClear}>
          Clear
        </button>
        <button
          className="btn-primary"
          disabled={!text.trim() && !selectedTag}
          onClick={handleSave}
        >
          Save Comment
        </button>
      </div>
    </div>
  );
}
