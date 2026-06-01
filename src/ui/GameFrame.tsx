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
      <div
        className="bg-white text-black flex flex-col overflow-hidden shadow-2xl"
        style={{ aspectRatio: "5 / 8", height: "min(95vh, 860px)" }}
      >
        <div className="basis-1/2 grow-0 shrink-0 overflow-hidden">
          {visual}
        </div>

        <div className="flex gap-2 px-3 py-2 bg-white">
          <button
            type="button"
            disabled={!notesEnabled}
            onClick={onOpenNotes}
            className={`border border-black px-3 py-0.5 text-xs font-mono ${
              notesEnabled
                ? "hover:bg-black hover:text-white cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            {notesLabel}
          </button>
          <button
            type="button"
            disabled={!onOpenSettings}
            onClick={onOpenSettings}
            className={`border border-black px-3 py-0.5 text-xs font-mono ${
              onOpenSettings
                ? "hover:bg-black hover:text-white cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            {settingsLabel}
          </button>
        </div>

        <div className="h-px bg-black" />

        <div className="flex-1 overflow-hidden bg-white p-5 relative">{body}</div>
      </div>
    </div>
  );
}
