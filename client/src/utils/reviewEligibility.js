/**
 * Client-side mirror of the deployed claim rule in `server/src/controllers/gameController.js`:
 * a reviewer's verified rapid rating must be at least REVIEW_RATING_GAP above the game's
 * average rating. The server remains authoritative; this only decides what the UI offers.
 *
 * Messages match the existing feed copy so behaviour is unchanged.
 */
export const REVIEW_RATING_GAP = 200;

export function getReviewEligibility({ viewerRapidRating, gameAverageRating }) {
  const viewerRating = Number(viewerRapidRating);
  const gameRating = Number(gameAverageRating);
  const hasViewerRating = Number.isFinite(viewerRating) && viewerRating > 0;
  const hasGameRating = Number.isFinite(gameRating) && gameRating > 0;

  if (!hasViewerRating) {
    return { canReview: false, message: "Set your chess account rating to review games", minRequired: null };
  }
  if (!hasGameRating) {
    return { canReview: false, message: "Game rating unavailable", minRequired: null };
  }

  const minRequired = gameRating + REVIEW_RATING_GAP;
  if (viewerRating < minRequired) {
    return { canReview: false, message: `Need ${minRequired}+ rapid`, minRequired };
  }

  return { canReview: true, message: "", minRequired };
}
