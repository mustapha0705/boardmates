import { useState } from "react";

const TAGS = ["Good Move", "Mistake", "Blunder", "Brilliant", "Inaccuracy"];

export default function CommentForm({ activeMove }) {
  const [text, setText] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  return (
    <div className="card">
      <div className="comment-form-header">
        <h3 className="annotate-title">Annotate {activeMove || "Move"}</h3>
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
        <button className="btn-secondary" onClick={() => { setText(""); setSelectedTag(null); }}>
          Clear
        </button>
        <button className="btn-primary" disabled={!text.trim()}>
          Save Comment
        </button>
      </div>
    </div>
  );
}