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

  // ── Body thud: triangle oscillator with fast pitch drop ───────────────
  // Gives a warm, rounded "thock" — like a quiet mechanical switch.
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(95 + Math.random() * 20, now);
  osc.frequency.exponentialRampToValueAtTime(52, now + 0.022);

  const oscGain = c.createGain();
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.26, now + 0.001);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

  osc.connect(oscGain);
  oscGain.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.045);

  // ── Soft transient: very brief mid-freq noise, barely audible ─────────
  // Adds a tiny sense of "contact" without sharpness.
  const click = c.createBufferSource();
  click.buffer = noiseBuffer;
  click.playbackRate.value = 1.0 + Math.random() * 0.15;

  const clickFilter = c.createBiquadFilter();
  clickFilter.type = "bandpass";
  clickFilter.frequency.value = 1800 + Math.random() * 500;
  clickFilter.Q.value = 2.5;

  const clickGain = c.createGain();
  clickGain.gain.setValueAtTime(0, now);
  clickGain.gain.linearRampToValueAtTime(0.045, now + 0.0005);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.009);

  click.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(c.destination);
  click.start(now);
  click.stop(now + 0.012);
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
