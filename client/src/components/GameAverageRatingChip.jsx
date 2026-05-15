/** Plain text line for submitter-provided average rating (all statuses, including guests). */
export default function GameAverageRatingChip({ averageRating }) {
  const n = Number(averageRating);
  const hasRating = Number.isFinite(n) && n > 0;
  return (
    <p className="review-avg-rating-line">
      Avg. rating:{" "}
      <span className="review-avg-rating-num">{hasRating ? n : "—"}</span>
    </p>
  );
}
