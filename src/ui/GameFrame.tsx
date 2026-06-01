import type { ReactNode } from "react";

interface Props {
  visual: ReactNode;
  body: ReactNode;
  notesEnabled?: boolean;
  notesLabel?: string;
  settingsLabel?: string;
  onOpenNotes?: () => void;
  onOpenSettings?: () => void;
}

/**
 * A folding-handheld shell — dark plastic outer, an LCD-bezelled "top screen"
 * for the visual area, a hinge band with controls + brand mark, and a white
 * paper "bottom screen" for the body text. Mimics a Nintendo DS / Game Boy
 * Advance form factor without leaning on literal pixel-art chrome.
 */
export function GameFrame({
  visual,
  body,
  notesEnabled = false,
  notesLabel = "노트",
  settingsLabel = "설정",
  onOpenNotes,
  onOpenSettings,
}: Props) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-black p-4">
      {/* Outer shell — dark plastic body */}
      <div
        className="relative flex flex-col overflow-hidden rounded-[28px] shadow-2xl"
        style={{
          aspectRatio: "5 / 8",
          height: "min(95vh, 860px)",
          background:
            "linear-gradient(180deg, #2a2a2c 0%, #1a1a1c 50%, #0e0e10 100%)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.6)",
        }}
      >
        {/* Power LED — subtle green dot, top-left */}
        <div
          className="absolute top-3 left-4 w-1.5 h-1.5 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #6eff8c 0%, #2a5a3a 70%, #0d1f15 100%)",
            boxShadow: "0 0 4px rgba(110,255,140,0.4)",
          }}
        />

        {/* ── TOP SCREEN — visual area, black LCD bezel ───────────────── */}
        <div className="basis-1/2 grow-0 shrink-0 px-3 pt-6 pb-2">
          <div
            className="h-full w-full rounded-md overflow-hidden bg-black"
            style={{
              boxShadow:
                "inset 0 0 0 2px #050505, inset 0 2px 6px rgba(0,0,0,0.8)",
            }}
          >
            {visual}
          </div>
        </div>

        {/* ── HINGE BAND — slim, recessed; speaker dots + controls + brand ── */}
        <div
          className="relative px-4 py-2 flex items-center gap-3"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1c 0%, #0c0c0e 50%, #1a1a1c 100%)",
            boxShadow:
              "inset 0 1px 2px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Speaker grille — left */}
          <div className="flex gap-[3px] mr-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[3px] rounded-full bg-neutral-700"
              />
            ))}
          </div>

          <button
            type="button"
            disabled={!notesEnabled}
            onClick={onOpenNotes}
            className={`px-2 py-0.5 text-[11px] font-mono rounded border border-neutral-700 transition-colors ${
              notesEnabled
                ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:translate-y-[1px]"
                : "bg-neutral-900 text-neutral-600 opacity-50 cursor-not-allowed"
            }`}
          >
            {notesLabel}
          </button>
          <button
            type="button"
            disabled={!onOpenSettings}
            onClick={onOpenSettings}
            className={`px-2 py-0.5 text-[11px] font-mono rounded border border-neutral-700 transition-colors ${
              onOpenSettings
                ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:translate-y-[1px]"
                : "bg-neutral-900 text-neutral-600 opacity-50 cursor-not-allowed"
            }`}
          >
            {settingsLabel}
          </button>

          {/* Brand mark */}
          <div className="ml-auto text-[9px] font-mono tracking-[0.4em] text-neutral-500 select-none">
            TRAIN · DUSK
          </div>

          {/* Speaker grille — right */}
          <div className="flex gap-[3px] ml-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[3px] rounded-full bg-neutral-700"
              />
            ))}
          </div>
        </div>

        {/* ── BOTTOM SCREEN — white paper for body text ────────────────── */}
        <div className="flex-1 px-3 pt-2 pb-6 min-h-0">
          <div
            className="h-full w-full rounded-md overflow-hidden bg-white text-black p-5 relative"
            style={{
              boxShadow:
                "inset 0 0 0 2px #050505, inset 0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}
