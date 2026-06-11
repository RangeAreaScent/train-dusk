import React, { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  /** Primary scene-visual id. Looked up under /assets/visuals/<id>.webp */
  visualKey?: string;
  /** Optional fallback id(s) to try in order if the primary is missing.
   *  Lets endings reuse car_5 variants and passages share one image. */
  fallback?: string | string[];
  /** Popup icon id — /assets/popups/<id>.webp */
  popup?: string;
  /** If true, look under /assets/cutscenes/ instead. */
  cutscene?: boolean;
  /** Character sprite id — /assets/characters/<id>.webp, rendered over background. */
  overlay?: string;
  /** Two-character layout: left and right sprites. */
  overlayLeft?: string;
  overlayRight?: string;
  /** Cutscene image floated as a polaroid panel over the background. */
  insetCutscene?: string;
  insetPosition?: "left" | "center" | "right";
}

type ImgState = "loading" | "ok" | "missing";

/** Probe a chain of candidate sources, returning the first one that loads.
 *  Returns null when none are reachable, so the caller can render a
 *  placeholder. */
function useFirstAvailable(srcs: string[]): { src: string | null; state: ImgState } {
  const [resolved, setResolved] = useState<string | null>(null);
  const [state, setState] = useState<ImgState>("loading");
  const key = srcs.join("|");
  useEffect(() => {
    if (srcs.length === 0) {
      setResolved(null);
      setState("missing");
      return;
    }
    setState("loading");
    setResolved(null);
    let cancelled = false;
    const tryNext = (idx: number) => {
      if (cancelled) return;
      if (idx >= srcs.length) {
        setState("missing");
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setResolved(srcs[idx]);
        setState("ok");
      };
      img.onerror = () => {
        if (cancelled) return;
        tryNext(idx + 1);
      };
      img.src = srcs[idx];
    };
    tryNext(0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { src: resolved, state };
}

const PROCEDURAL_VISUALS: Record<string, React.FC> = {
  faded_photo: FadedPhoto,
};

export function VisualArea({ visualKey, popup, cutscene, fallback, overlay, overlayLeft, overlayRight, insetCutscene, insetPosition = "center" }: Props) {
  const ProceduralComp = visualKey ? PROCEDURAL_VISUALS[visualKey] : undefined;

  const folder = cutscene ? "cutscenes" : "visuals";
  const chain = useMemo(() => {
    const ids: string[] = [];
    if (visualKey) ids.push(visualKey);
    if (Array.isArray(fallback)) ids.push(...fallback);
    else if (fallback) ids.push(fallback);
    return ids.map((id) => `/assets/${folder}/${id}.webp`);
  }, [visualKey, fallback, folder]);

  const { src: visualSrc, state: visualState } = useFirstAvailable(chain);
  const popupSrc = popup ? `/assets/popups/${popup}.webp` : null;
  const { src: popupResolved, state: popupState } = useFirstAvailable(
    popupSrc ? [popupSrc] : [],
  );
  const overlaySrc = overlay ? `/assets/characters/${overlay}.webp` : null;
  const { src: overlayResolved } = useFirstAvailable(overlaySrc ? [overlaySrc] : []);
  const overlayLeftSrc = overlayLeft ? `/assets/characters/${overlayLeft}.webp` : null;
  const { src: overlayLeftResolved } = useFirstAvailable(overlayLeftSrc ? [overlayLeftSrc] : []);
  const overlayRightSrc = overlayRight ? `/assets/characters/${overlayRight}.webp` : null;
  const { src: overlayRightResolved } = useFirstAvailable(overlayRightSrc ? [overlayRightSrc] : []);
  const insetSrc = insetCutscene ? `/assets/cutscenes/${insetCutscene}.webp` : null;
  const { src: insetResolved, state: insetState } = useFirstAvailable(insetSrc ? [insetSrc] : []);

  return (
    <div className="relative h-full w-full bg-neutral-900 overflow-hidden">
      {ProceduralComp ? (
        <ProceduralComp />
      ) : visualSrc && visualState === "ok" ? (
        <img
          src={visualSrc}
          alt=""
          className="h-full w-full object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <Placeholder label={visualKey ?? "—"} />
      )}

      {overlayResolved && (
        <img
          src={overlayResolved}
          alt=""
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[85%] w-auto object-contain pointer-events-none"
          style={{ imageRendering: "pixelated" }}
        />
      )}

      {overlayLeftResolved && (
        <img
          src={overlayLeftResolved}
          alt=""
          className="absolute bottom-0 left-0 h-[85%] w-auto object-contain pointer-events-none"
          style={{ imageRendering: "pixelated" }}
        />
      )}
      {overlayRightResolved && (
        <img
          src={overlayRightResolved}
          alt=""
          className="absolute bottom-0 right-0 h-[85%] w-auto object-contain pointer-events-none"
          style={{ imageRendering: "pixelated" }}
        />
      )}

      {insetCutscene && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            insetPosition === "left"
              ? "left-[6%]"
              : insetPosition === "right"
                ? "right-[6%]"
                : "left-1/2 -translate-x-1/2"
          } pointer-events-none`}
          style={{ width: "45%", aspectRatio: "4/3" }}
        >
          {insetResolved && insetState === "ok" ? (
            <img
              src={insetResolved}
              alt=""
              className="h-full w-full object-contain bg-white p-2"
              style={{
                imageRendering: "pixelated",
                boxShadow: "6px 6px 0 rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)",
              }}
            />
          ) : (
            <div className="h-full w-full border-2 border-black bg-white/90 flex items-center justify-center text-xs font-mono text-black/60">
              {insetCutscene}
            </div>
          )}
        </div>
      )}

      {popup && (
        <div className="absolute top-3 right-3">
          {popupResolved && popupState === "ok" ? (
            <img
              src={popupResolved}
              alt={popup}
              className="w-12 h-12 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <div className="border border-neutral-500 bg-black/60 px-2 py-1 text-[10px] text-neutral-300 font-mono">
              {popup}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Procedural visuals ────────────────────────────────────────────────────

function clamp(v: number) { return Math.min(255, Math.max(0, Math.round(v))); }

function drawFadedPhoto(ctx: CanvasRenderingContext2D, W: number, H: number) {
  // Aged paper background
  ctx.fillStyle = "#d6caa8";
  ctx.fillRect(0, 0, W, H);

  // Subtle paper tone blobs
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 30 + Math.random() * 80;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(170,145,90,${0.01 + Math.random() * 0.04})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(Math.max(0, x - r), Math.max(0, y - r), r * 2, r * 2);
  }

  // Two human silhouettes — barely visible, ghost-like
  const baseY = H * 0.78, figH = H * 0.54;
  const lx = W * 0.38, rx = W * 0.58;

  const drawFigure = (px: number, scale: number) => {
    const fh = figH * scale, fw = fh * 0.28;
    ctx.fillStyle = "rgba(80,65,40,0.26)";
    // Head
    ctx.beginPath();
    ctx.ellipse(px, baseY - fh + fw * 0.55, fw * 0.26, fw * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.beginPath();
    ctx.moveTo(px - fw * 0.26, baseY - fh + fw * 1.1);
    ctx.lineTo(px + fw * 0.26, baseY - fh + fw * 1.1);
    ctx.lineTo(px + fw * 0.2,  baseY - fh * 0.4);
    ctx.lineTo(px - fw * 0.2,  baseY - fh * 0.4);
    ctx.closePath();
    ctx.fill();
    // Legs
    ctx.beginPath();
    ctx.moveTo(px - fw * 0.2, baseY - fh * 0.4);
    ctx.lineTo(px - fw * 0.1, baseY);
    ctx.lineTo(px + fw * 0.1, baseY);
    ctx.lineTo(px + fw * 0.2, baseY - fh * 0.4);
    ctx.closePath();
    ctx.fill();
  };

  drawFigure(lx, 0.88);
  drawFigure(rx, 1.0);

  // Right figure's arm around left figure's shoulder
  ctx.strokeStyle = "rgba(80,65,40,0.22)";
  ctx.lineWidth = figH * 0.055;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(rx - figH * 0.25, baseY - figH * 0.76);
  ctx.quadraticCurveTo((lx + rx) * 0.5, baseY - figH * 0.88, lx + figH * 0.1, baseY - figH * 0.75);
  ctx.stroke();

  // Sepia layer
  ctx.fillStyle = "rgba(150,110,50,0.1)";
  ctx.fillRect(0, 0, W, H);

  // Film grain
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 32;
    d[i]   = clamp(d[i]   + n);
    d[i+1] = clamp(d[i+1] + n * 0.85);
    d[i+2] = clamp(d[i+2] + n * 0.55);
  }
  ctx.putImageData(img, 0, 0);

  // Vignette
  const vg = ctx.createRadialGradient(W/2, H/2, H * 0.12, W/2, H/2, H * 0.74);
  vg.addColorStop(0,   "rgba(0,0,0,0)");
  vg.addColorStop(0.5, "rgba(0,0,0,0.04)");
  vg.addColorStop(1,   "rgba(0,0,0,0.68)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Worn corner brightening (old photo edge effect)
  [[0,0],[W,0],[0,H],[W,H]].forEach(([cx2, cy2]) => {
    const cg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.min(W, H) * 0.42);
    cg.addColorStop(0, "rgba(220,200,160,0.22)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
  });

  // Photo border
  ctx.strokeStyle = "rgba(255,250,235,0.6)";
  ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, W - 6, H - 6);
}

function FadedPhoto() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFadedPhoto(ctx, canvas.width, canvas.height);
  }, []);
  return <canvas ref={ref} width={480} height={360} className="w-full h-full object-contain" />;
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
        backgroundSize: "4px 4px",
        backgroundColor: "#0a0a0a",
      }}
    >
      <div className="text-neutral-500 text-xs font-mono tracking-wider">
        {label}
      </div>
    </div>
  );
}
