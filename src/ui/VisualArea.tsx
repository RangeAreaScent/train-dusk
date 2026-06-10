import { useEffect, useMemo, useState } from "react";

interface Props {
  /** Primary scene-visual id. Looked up under /assets/visuals/<id>.png */
  visualKey?: string;
  /** Optional fallback id(s) to try in order if the primary is missing.
   *  Lets endings reuse car_5 variants and passages share one image. */
  fallback?: string | string[];
  /** Popup icon id — /assets/popups/<id>.png */
  popup?: string;
  /** If true, look under /assets/cutscenes/ instead. */
  cutscene?: boolean;
  /** Character sprite id — /assets/characters/<id>.png, rendered over background. */
  overlay?: string;
  /** Two-character layout: left and right sprites. */
  overlayLeft?: string;
  overlayRight?: string;
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

export function VisualArea({ visualKey, popup, cutscene, fallback, overlay, overlayLeft, overlayRight }: Props) {
  const folder = cutscene ? "cutscenes" : "visuals";
  const chain = useMemo(() => {
    const ids: string[] = [];
    if (visualKey) ids.push(visualKey);
    if (Array.isArray(fallback)) ids.push(...fallback);
    else if (fallback) ids.push(fallback);
    return ids.map((id) => `/assets/${folder}/${id}.png`);
  }, [visualKey, fallback, folder]);

  const { src: visualSrc, state: visualState } = useFirstAvailable(chain);
  const popupSrc = popup ? `/assets/popups/${popup}.png` : null;
  const { src: popupResolved, state: popupState } = useFirstAvailable(
    popupSrc ? [popupSrc] : [],
  );
  const overlaySrc = overlay ? `/assets/characters/${overlay}.png` : null;
  const { src: overlayResolved } = useFirstAvailable(overlaySrc ? [overlaySrc] : []);
  const overlayLeftSrc = overlayLeft ? `/assets/characters/${overlayLeft}.png` : null;
  const { src: overlayLeftResolved } = useFirstAvailable(overlayLeftSrc ? [overlayLeftSrc] : []);
  const overlayRightSrc = overlayRight ? `/assets/characters/${overlayRight}.png` : null;
  const { src: overlayRightResolved } = useFirstAvailable(overlayRightSrc ? [overlayRightSrc] : []);

  return (
    <div className="relative h-full w-full bg-neutral-900 overflow-hidden">
      {visualSrc && visualState === "ok" ? (
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
