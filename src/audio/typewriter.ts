/**
 * Typewriter sound — loops a short MP3 of mechanical typing for as long
 * as text is being revealed, and fades out when typing stops. Lazily
 * loads + resumes on the first user gesture (mobile autoplay policy).
 */

const SAMPLE_URL = "/audio/typewriter.mp3";
const LOOP_GAIN = 0.35;
const FADE_IN_MS = 30;
const FADE_OUT_MS = 80;

let ctx: AudioContext | null = null;
let sampleBuffer: AudioBuffer | null = null;
let loading = false;
let resumed = false;
let enabled = true;

let activeSource: AudioBufferSourceNode | null = null;
let activeGain: GainNode | null = null;

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
      () => { resumed = true; },
      () => { /* ignore */ },
    );
  } else {
    resumed = true;
  }
}

export function setTypewriterEnabled(on: boolean): void {
  enabled = on;
  if (!on) stopTyping();
}

export function isTypewriterEnabled(): boolean {
  return enabled;
}

/** Begin (or continue) typewriter loop. No-op if already running, if
 *  disabled, or if sample not loaded yet. */
export function startTyping(): void {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  tryResume();
  if (!sampleBuffer) {
    void loadSample(c);
    return;
  }
  if (c.state !== "running") return;
  if (activeSource) return; // already looping

  const now = c.currentTime;
  // Start from a random offset so consecutive sentences don't feel identical.
  const startOffset = Math.random() * Math.max(0, sampleBuffer.duration - 0.5);

  const src = c.createBufferSource();
  src.buffer = sampleBuffer;
  src.loop = true;
  src.loopStart = 0;
  src.loopEnd = sampleBuffer.duration;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(LOOP_GAIN, now + FADE_IN_MS / 1000);

  src.connect(gain);
  gain.connect(c.destination);
  src.start(now, startOffset);

  activeSource = src;
  activeGain = gain;
}

/** Fade out and stop the current loop. Safe to call when nothing is
 *  playing. */
export function stopTyping(): void {
  if (!ctx || !activeSource || !activeGain) return;
  const c = ctx;
  const src = activeSource;
  const gain = activeGain;
  activeSource = null;
  activeGain = null;
  const now = c.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_MS / 1000);
  try {
    src.stop(now + FADE_OUT_MS / 1000 + 0.01);
  } catch {
    // already stopped
  }
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
