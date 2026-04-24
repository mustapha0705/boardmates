/** @param {string | null | undefined} platform */
export function chessPlatformLabel(platform) {
  if (platform === "chess_com") return "Chess.com";
  if (platform === "lichess") return "Lichess";
  return "";
}
