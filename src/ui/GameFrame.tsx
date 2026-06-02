import type { ReactNode } from "react";
import type { PaperTheme, ShellTheme } from "../engine/types";

interface Props {
  visual: ReactNode;
  body: ReactNode;
  notesEnabled?: boolean;
  notesLabel?: string;
  settingsLabel?: string;
  onOpenNotes?: () => void;
  onOpenSettings?: () => void;
  shellTheme?: ShellTheme;
  paperTheme?: PaperTheme;
}

const SHELL_GRADIENTS: Record<ShellTheme, string> = {
  black: "linear-gradient(180deg, #2a2a2c 0%, #1a1a1c 50%, #0e0e10 100%)",
  gray: "linear-gradient(180deg, #7a7a82 0%, #5e5e66 50%, #44444c 100%)",
};

const SHELL_HINGE: Record<ShellTheme, string> = {
  black: "linear-gradient(180deg, #1a1a1c 0%, #0c0c0e 50%, #1a1a1c 100%)",
  gray: "linear-gradient(180deg, #50505a 0%, #3a3a44 50%, #50505a 100%)",
};

const PAPER_BG: Record<PaperTheme, string> = {
  white: "#ffffff",
  cream: "#f5ecd6",
};

/**
 * A folding-handheld shell — dark plastic outer, an LCD-bezelled "top screen"
 * for the visual area, a hinge band with controls + brand mark, and a paper
 * "bottom screen" for the body text.
 */
export function GameFrame({
  visual,
  body,
  notesEnabled = false,
  notesLabel = "노트",
  settingsLabel = "설정",
  onOpenNotes,
  onOpenSettings,
  shellTheme = "black",
  paperTheme = "white",
}: Props) {
  const shellBg = SHELL_GRADIENTS[shellTheme];
  const hingeBg = SHELL_HINGE[shellTheme];
  const paperBg = PAPER_BG[paperTheme];

  return (
    <div className="h-full w-full flex items-center justify-center bg-black p-0 sm:p-4">
      {/* Outer shell — dark plastic body. On mobile we let the shell hit
       *  the viewport edges (no padding, square-ish rounding); on tablet+
       *  it sits centered with breathing room. */}
      <div
        className="relative flex flex-col overflow-hidden rounded-none sm:rounded-[28px] shadow-2xl"
        style={{
          aspectRatio: "5 / 8",
          width: "min(100vw, calc(min(95vh, 860px) * 5 / 8))",
          maxHeight: "100vh",
          background: shellBg,
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.6)",
        }}
      >
        {/* Power LED */}
        <div
          className="absolute top-3 left-4 w-1.5 h-1.5 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #6eff8c 0%, #2a5a3a 70%, #0d1f15 100%)",
            boxShadow: "0 0 4px rgba(110,255,140,0.4)",
          }}
        />

        {/* TOP SCREEN */}
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

        {/* HINGE */}
        <div
          className="relative px-4 py-2 flex items-center gap-3"
          style={{
            background: hingeBg,
            boxShadow:
              "inset 0 1px 2px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex gap-[3px] mr-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[3px] rounded-full"
                style={{
                  background: shellTheme === "gray" ? "#2a2a30" : "#2e2e34",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={!notesEnabled}
            onClick={onOpenNotes}
            className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
              notesEnabled
                ? "border-neutral-600 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:translate-y-[1px]"
                : "border-neutral-700 bg-neutral-900 text-neutral-600 opacity-50 cursor-not-allowed"
            }`}
          >
            {notesLabel}
          </button>
          <button
            type="button"
            disabled={!onOpenSettings}
            onClick={onOpenSettings}
            className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
              onOpenSettings
                ? "border-neutral-600 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:translate-y-[1px]"
                : "border-neutral-700 bg-neutral-900 text-neutral-600 opacity-50 cursor-not-allowed"
            }`}
          >
            {settingsLabel}
          </button>

          <div
            className="ml-auto text-[9px] font-mono tracking-[0.4em] select-none"
            style={{ color: shellTheme === "gray" ? "#2c2c34" : "#666670" }}
          >
            TRAIN · DUSK
          </div>

          <div className="flex gap-[3px] ml-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[3px] rounded-full"
                style={{
                  background: shellTheme === "gray" ? "#2a2a30" : "#2e2e34",
                }}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM SCREEN — paper */}
        <div className="flex-1 px-3 pt-2 pb-6 min-h-0">
          <div
            className="h-full w-full rounded-md overflow-hidden text-black p-5 relative"
            style={{
              backgroundColor: paperBg,
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
