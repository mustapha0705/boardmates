import { useState, useEffect } from "react";
import { getMoveLabel } from "../hooks/useAnalysisTree";

export default function CommentForm({ currentNode, onSaveComment, saving }) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(currentNode.comment || "");
  }, [currentNode]);

  function handleSave() {
    onSaveComment(text.trim());
  }

  function handleClear() {
    setText("");
    onSaveComment("");
  }

  const label = getMoveLabel(currentNode);

  return (
    <div className="card">
      <div className="comment-form-header">
        <h3 className="annotate-title">Annotate {label}</h3>
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
          disabled={!text.trim() || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save Comment"}
        </button>
      </div>
    </div>
  );
}
