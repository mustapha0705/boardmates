const moveAudio = new Audio("/sounds/Move.ogg");
const captureAudio = new Audio("/sounds/Capture.ogg");
const checkAudio = new Audio("/sounds/Check.ogg");
const MOVE_SOUND_ENABLED_KEY = "boardmates.moveSoundEnabled";

export function getMoveSoundsEnabled() {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(MOVE_SOUND_ENABLED_KEY);
  if (raw == null) return true;
  return raw !== "false";
}

export function setMoveSoundsEnabled(enabled) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOVE_SOUND_ENABLED_KEY, enabled ? "true" : "false");
}

function classifySan(san) {
  const s = String(san || "");
  if (!s) return null;
  // Standard SAN: captures use "x"; check uses "+"; mate uses "#"
  if (s.includes("x")) return "capture";
  if (s.includes("#")) return "checkmate";
  if (s.includes("+")) return "check";
  return "move";
}

function playAudio(audio) {
  if (!audio) return;
  try {
    audio.currentTime = 0;
    const result = audio.play();
    if (result?.catch) result.catch(() => {});
  } catch {
    // Ignore browser autoplay and decode errors.
  }
}

export function playMoveSoundForSan(san) {
  if (!getMoveSoundsEnabled()) return;
  const type = classifySan(san);
  if (!type) return;
  if (type === "capture") {
    playAudio(captureAudio);
    return;
  }
  if (type === "checkmate") {
    playAudio(checkAudio);
    return;
  }
  if (type === "check") {
    playAudio(checkAudio);
    return;
  }
  playAudio(moveAudio);
}

export function playMoveSoundForNode(node) {
  playMoveSoundForSan(node?.san);
}
