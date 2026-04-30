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

function classifyMove(node) {
  const san = String(node?.san || "");
  if (!san) return null;
  if (san.includes("#")) return "checkmate";
  if (san.includes("x")) return "capture";
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

export function playMoveSoundForNode(node) {
  if (!getMoveSoundsEnabled()) return;
  const type = classifyMove(node);
  if (!type) return;
  if (type === "checkmate") {
    playAudio(checkAudio);
    return;
  }
  if (type === "capture") {
    playAudio(captureAudio);
    return;
  }
  playAudio(moveAudio);
}
