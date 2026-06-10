/**
 * Procedural typewriter click — short filtered-noise burst per character,
 * synthesised on the fly with Web Audio. No assets, ~250 lines of nothing,
 * survives mobile autoplay policy by lazily resuming the AudioContext on
 * the first user gesture.
 */

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
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
  // 25ms of white noise, reused for every click.
  const len = Math.floor(ctx.sampleRate * 0.025);
  noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
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
 *  bails fast if disabled, no AudioContext available, or buffer missing. */
export function playKeyClick(): void {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c || !noiseBuffer) return;
  tryResume();
  if (c.state !== "running") return;

  const now = c.currentTime;

  const source = c.createBufferSource();
  source.buffer = noiseBuffer;
  // Slight pitch variation so it doesn't feel mechanical/looped.
  source.playbackRate.value = 0.85 + Math.random() * 0.35;

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900 + Math.random() * 300;
  filter.Q.value = 0.8;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);

  source.start(now);
  source.stop(now + 0.05);
}

// Auto-resume on first user gesture (browser autoplay policy).
if (typeof window !== "undefined") {
  const handler = () => {
    ensureCtx();
    tryResume();
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
