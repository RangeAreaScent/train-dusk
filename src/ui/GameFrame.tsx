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
  // Warm pale gray — Game Boy DMG-01 body color.
  gray: "linear-gradient(180deg, #dcdbd2 0%, #c8c7be 50%, #b4b3aa 100%)",
};

const SHELL_HINGE: Record<ShellTheme, string> = {
  black: "linear-gradient(180deg, #1a1a1c 0%, #0c0c0e 50%, #1a1a1c 100%)",
  gray: "linear-gradient(180deg, #a8a7a0 0%, #908f88 50%, #a8a7a0 100%)",
};

const GB_PINK = "#c44579";
const GB_PINK_HOVER = "#b03568";

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
      {/* Outer shell — plastic body. Rounded corners everywhere so the
       *  handheld feel survives on mobile too. */}
      <div
        className="relative flex flex-col overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-2xl"
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
            className="h-full w-full rounded-md overflow-hidden bg-black border-2 border-black"
            style={{
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            {visual}
          </div>
        </div>

        {/* HINGE */}
        <div
          className="relative px-4 py-2 flex items-center"
          style={{
            background: hingeBg,
            boxShadow:
              "inset 0 1px 2px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="text-[9px] font-mono tracking-[0.4em] select-none"
            style={{ color: shellTheme === "gray" ? "#5a3a4a" : "#666670" }}
          >
            TRAIN · DUSK
          </div>

          <div className="ml-auto flex gap-2">
            <ShellButton
              label={notesLabel}
              enabled={notesEnabled}
              shellTheme={shellTheme}
              onClick={onOpenNotes}
            />
            <ShellButton
              label={settingsLabel}
              enabled={!!onOpenSettings}
              shellTheme={shellTheme}
              onClick={onOpenSettings}
            />
          </div>
        </div>

        {/* BOTTOM SCREEN — paper */}
        <div className="flex-1 px-3 pt-2 pb-6 min-h-0">
          <div
            className="h-full w-full rounded-md overflow-hidden text-black p-5 relative border-2 border-black"
            style={{
              backgroundColor: paperBg,
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hinge button. In black-shell mode it's a dark bezelled mono chip;
 *  in gray-shell mode it borrows the Game Boy A/B button palette
 *  (magenta-pink pill with a bevelled top highlight). */
function ShellButton({
  label,
  enabled,
  shellTheme,
  onClick,
}: {
  label: string;
  enabled: boolean;
  shellTheme: ShellTheme;
  onClick?: () => void;
}) {
  if (shellTheme === "gray") {
    return (
      <button
        type="button"
        disabled={!enabled}
        onClick={onClick}
        className={`w-14 py-0.5 text-[11px] font-mono rounded-full border transition-all text-center ${
          enabled
            ? "text-white cursor-pointer active:translate-y-[1px]"
            : "opacity-40 cursor-not-allowed text-white/70"
        }`}
        style={{
          background: enabled
            ? `linear-gradient(180deg, ${GB_PINK} 0%, ${GB_PINK_HOVER} 100%)`
            : "linear-gradient(180deg, #b89aa3 0%, #a3838d 100%)",
          borderColor: "rgba(0,0,0,0.25)",
          boxShadow: enabled
            ? "inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 1px rgba(0,0,0,0.25)"
            : "inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={`w-14 py-0.5 text-[11px] font-mono rounded border transition-colors text-center ${
        enabled
          ? "border-neutral-600 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white cursor-pointer active:translate-y-[1px]"
          : "border-neutral-700 bg-neutral-900 text-neutral-600 opacity-50 cursor-not-allowed"
      }`}
    >
      {label}
    </button>
  );
}
