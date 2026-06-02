/**
 * Background music — two HTMLAudioElements (main + ending), one active
 * at a time. Mute = pause, unmute = play. No crossfade — the simplest
 * thing that still feels right.
 *
 * Ending track is intentionally non-looping with a baked-in 3 s fade-out
 * so the card lands in silence after one play.
 */

type Track = "main" | "ending";

const SOURCES: Record<Track, string> = {
  main: "/audio/main_theme.m4a",
  ending: "/audio/ending_theme.m4a",
};

const VOLUMES: Record<Track, number> = {
  main: 0.35,
  // Ending file is already volume-reduced ~20% in source; this just sets
  // playback gain in line with the main theme.
  ending: 0.45,
};

const LOOPS: Record<Track, boolean> = {
  main: true,
  ending: false,
};

const elements: Partial<Record<Track, HTMLAudioElement>> = {};
let currentTrack: Track = "main";
let enabled = true;
let armed = false;

function ensureEl(track: Track): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  const existing = elements[track];
  if (existing) return existing;
  const el = new Audio(SOURCES[track]);
  el.loop = LOOPS[track];
  el.preload = "auto";
  el.volume = VOLUMES[track];
  elements[track] = el;
  return el;
}

function tryPlay(track: Track): void {
  const el = ensureEl(track);
  if (!el) return;
  if (!enabled) return;
  if (!armed) return;
  el.play().catch(() => {
    // Autoplay refused — will retry on next user gesture.
  });
}

/** Switch to a given track. Pauses any previous track and rewinds the
 *  incoming one. No-op if already current. */
export function setMusicTrack(track: Track): void {
  if (currentTrack === track) return;
  const prev = elements[currentTrack];
  if (prev) prev.pause();
  currentTrack = track;
  const next = ensureEl(track);
  if (next) {
    try {
      next.currentTime = 0;
    } catch {
      // ignore — happens if not yet decoded
    }
    tryPlay(track);
  }
}

export function setMusicEnabled(on: boolean): void {
  enabled = on;
  const el = elements[currentTrack];
  if (!el) return;
  if (on) {
    tryPlay(currentTrack);
  } else {
    el.pause();
  }
}

export function isMusicEnabled(): boolean {
  return enabled;
}

export function armMusicOnFirstGesture(): void {
  if (typeof window === "undefined") return;
  if (armed) return;
  const gesture = () => {
    armed = true;
    window.removeEventListener("pointerdown", gesture);
    window.removeEventListener("keydown", gesture);
    window.removeEventListener("touchstart", gesture);
    tryPlay(currentTrack);
  };
  window.addEventListener("pointerdown", gesture, { passive: true });
  window.addEventListener("keydown", gesture);
  window.addEventListener("touchstart", gesture, { passive: true });
}
