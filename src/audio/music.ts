/**
 * Background music — single HTMLAudioElement, native loop=true. Designed
 * to be the most boring, reliable thing possible:
 * - one audio element, native browser decoding (AAC m4a)
 * - native looping (no crossfade, no Web Audio buffer)
 * - arms on first user gesture to survive autoplay policy
 * - mute = pause, unmute = play (no Web Audio gain ramp)
 */

const SRC = "/audio/main_theme.m4a";
const VOLUME = 0.35;

let audio: HTMLAudioElement | null = null;
let enabled = true;
let armed = false;

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (audio) return audio;
  const el = new Audio(SRC);
  el.loop = true;
  el.preload = "auto";
  el.volume = VOLUME;
  audio = el;
  return audio;
}

/** Begin playback if enabled. Safe to call multiple times — pauses
 *  are reversible, browsers ignore redundant play() calls. */
function tryPlay(): void {
  const el = ensureAudio();
  if (!el) return;
  if (!enabled) return;
  if (!armed) return; // wait for the first user gesture
  el.play().catch(() => {
    // Browser may still refuse if no gesture is in flight — retry on
    // the next gesture via the gesture handler.
  });
}

export function setMusicEnabled(on: boolean): void {
  enabled = on;
  const el = ensureAudio();
  if (!el) return;
  if (on) {
    tryPlay();
  } else {
    el.pause();
  }
}

export function isMusicEnabled(): boolean {
  return enabled;
}

/** Listen for the first pointerdown/keydown/touchstart and use it to
 *  satisfy the browser's autoplay policy. Mounting is idempotent. */
export function armMusicOnFirstGesture(): void {
  if (typeof window === "undefined") return;
  if (armed) return;
  const gesture = () => {
    armed = true;
    window.removeEventListener("pointerdown", gesture);
    window.removeEventListener("keydown", gesture);
    window.removeEventListener("touchstart", gesture);
    tryPlay();
  };
  window.addEventListener("pointerdown", gesture, { passive: true });
  window.addEventListener("keydown", gesture);
  window.addEventListener("touchstart", gesture, { passive: true });
}
