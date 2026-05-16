export const MIN_REVIEW_COMMENTS = 3;

export function countSavedReviewComments(comments) {
  return (comments ?? []).filter((c) => String(c.comment || "").trim()).length;
}
