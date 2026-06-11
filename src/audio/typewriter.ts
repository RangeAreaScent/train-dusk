/**
 * Typewriter click — decodes a short MP3 of mechanical typing once and
 * plays a random 60-90ms slice per character. Random offset + slight
 * pitch jitter keeps consecutive keystrokes from sounding identical.
 * Lazily resumes the AudioContext on the first user gesture (mobile
 * autoplay policy).
 */

const SAMPLE_URL = "/audio/typewriter.mp3";
const SLICE_MIN_MS = 60;
const SLICE_MAX_MS = 90;
const TAIL_GUARD_MS = 120; // don't pick an offset within this of end-of-file
const CLICK_GAIN = 0.45;

let ctx: AudioContext | null = null;
let sampleBuffer: AudioBuffer | null = null;
let loading = false;
let resumed = false;
let enabled = true;

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function ensureCtx(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = getAudioContextCtor();
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
    return null;
  }
  return ctx;
}

async function loadSample(c: AudioContext): Promise<void> {
  if (sampleBuffer || loading) return;
  loading = true;
  try {
    const res = await fetch(SAMPLE_URL);
    const arr = await res.arrayBuffer();
    sampleBuffer = await c.decodeAudioData(arr);
  } catch {
    sampleBuffer = null;
  } finally {
    loading = false;
  }
}

function tryResume(): void {
  if (!ctx || resumed) return;
  if (ctx.state === "suspended") {
    ctx.resume().then(
      () => {
        resumed = true;
      },
      () => {
        // ignore
      },
    );
  } else {
    resumed = true;
  }
}

/** Turn the typewriter off entirely. Called by SceneView when the user
 *  toggles sound in settings. */
export function setTypewriterEnabled(on: boolean): void {
  enabled = on;
}

export function isTypewriterEnabled(): boolean {
  return enabled;
}

/** Play one short tick. Safe to call as often as the renderer wants —
 *  bails fast if disabled, sample still loading, or context unavailable. */
export function playKeyClick(): void {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  tryResume();
  if (!sampleBuffer) {
    void loadSample(c);
    return;
  }
  if (c.state !== "running") return;

  const now = c.currentTime;
  const dur = sampleBuffer.duration;
  const sliceLen = (SLICE_MIN_MS + Math.random() * (SLICE_MAX_MS - SLICE_MIN_MS)) / 1000;
  const maxStart = Math.max(0, dur - sliceLen - TAIL_GUARD_MS / 1000);
  const startOffset = Math.random() * maxStart;

  const src = c.createBufferSource();
  src.buffer = sampleBuffer;
  src.playbackRate.value = 0.95 + Math.random() * 0.15; // slight pitch jitter

  // Short fade-in/out so the slice doesn't click at its edges.
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(CLICK_GAIN, now + 0.005);
  gain.gain.setValueAtTime(CLICK_GAIN, now + sliceLen - 0.015);
  gain.gain.linearRampToValueAtTime(0, now + sliceLen);

  src.connect(gain);
  gain.connect(c.destination);
  src.start(now, startOffset, sliceLen);
}

// Auto-resume + preload on first user gesture (browser autoplay policy).
if (typeof window !== "undefined") {
  const handler = () => {
    const c = ensureCtx();
    if (c) {
      tryResume();
      void loadSample(c);
    }
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
    window.removeEventListener("touchstart", handler);
  };
  window.addEventListener("pointerdown", handler, { once: false });
  window.addEventListener("keydown", handler, { once: false });
  window.addEventListener("touchstart", handler, { once: false });
}

/** Predicate: should this character produce an audible click?
 *  Whitespace, blank lines, and most punctuation type silently — feels
 *  much more natural than a chip every other tick. */
export function isAudibleChar(ch: string): boolean {
  if (!ch) return false;
  return !/[\s.,!?…—\-:;'"`()[\]{}]/.test(ch);
}
