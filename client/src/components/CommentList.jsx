export default function CommentList() {
  return (
    <div className="comments-card">
      <div className="card-header">Reviewer Notes</div>

      <div className="comments-body">
        <div className="comment active">
          <span className="tag">Move 45</span>
          <p>
            White is preparing to reposition the Knight to f4...
          </p>
        </div>

        <div className="comment">
          <span className="tag muted">Move 32</span>
          <p>
            The rook exchange at d8 was premature.
          </p>
        </div>
      </div>

      <div className="comment-search">
        <input placeholder="Search comments..." />
      </div>
    </div>
  );
}