export default function CommentForm() {
  return (
    <div className="card">
      <h3>Annotate Move 45</h3>

      <textarea
        placeholder="Write your analysis..."
        rows={4}
      />

      <div className="comment-actions">
        <button className="btn-primary">Save Comment</button>
      </div>
    </div>
  );
}