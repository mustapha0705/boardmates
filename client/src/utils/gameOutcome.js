/**
 * One-line context: submitter's color and result.
 * Returns null if legacy games lack these fields.
 */
export function formatAuthorOutcomeLine(game) {
  if (!game?.playerColor || !game?.gameResult) return null;
  const name = (game.author?.displayName && String(game.author.displayName).trim()) || "Player";
  const verb =
    game.gameResult === "win" ? "won" : game.gameResult === "lose" ? "lost" : "drew";
  const colorLabel = game.playerColor === "white" ? "White" : "Black";
  return `${name} ${verb} as ${colorLabel}`;
}
