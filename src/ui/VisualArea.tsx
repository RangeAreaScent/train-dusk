import { useEffect, useState } from "react";

interface Props {
  /** Scene ID for the main visual — looked up under /assets/visuals/<id>.png */
  visualKey?: string;
  /** Popup icon ID — looked up under /assets/popups/<id>.png */
  popup?: string;
  /** If true, look under /assets/cutscenes/ instead of /assets/visuals/ */
  cutscene?: boolean;
}

type ImgState = "loading" | "ok" | "missing";

function useImageProbe(src: string | null): ImgState {
  const [state, setState] = useState<ImgState>("loading");
  useEffect(() => {
    if (!src) {
      setState("missing");
      return;
    }
    setState("loading");
    const img = new Image();
    img.onload = () => setState("ok");
    img.onerror = () => setState("missing");
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  return state;
}

export function VisualArea({ visualKey, popup, cutscene }: Props) {
  const folder = cutscene ? "cutscenes" : "visuals";
  const visualSrc = visualKey ? `/assets/${folder}/${visualKey}.png` : null;
  const popupSrc = popup ? `/assets/popups/${popup}.png` : null;
  const visualState = useImageProbe(visualSrc);
  const popupState = useImageProbe(popupSrc);

  return (
    <div className="relative h-full w-full bg-neutral-900 overflow-hidden">
      {visualSrc && visualState === "ok" ? (
        <img
          src={visualSrc}
          alt=""
          className="h-full w-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <Placeholder label={visualKey ?? "—"} />
      )}

      {popup && (
        <div className="absolute top-3 right-3">
          {popupSrc && popupState === "ok" ? (
            <img
              src={popupSrc}
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

/**
 * Fallback visual when no asset is present yet. A subtle dithered field +
 * the asset ID, so during development you can see at a glance which file
 * still needs to be drawn.
 */
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
