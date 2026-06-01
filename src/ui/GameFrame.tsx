import type { ReactNode } from "react";

interface Props {
  visual: ReactNode;
  body: ReactNode;
}

export function GameFrame({ visual, body }: Props) {
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
            disabled
            className="border border-black px-3 py-0.5 text-xs font-mono opacity-40 cursor-not-allowed"
          >
            노트
          </button>
          <button
            type="button"
            disabled
            className="border border-black px-3 py-0.5 text-xs font-mono opacity-40 cursor-not-allowed"
          >
            설정
          </button>
        </div>

        <div className="h-px bg-black" />

        <div className="flex-1 overflow-hidden bg-white p-5">{body}</div>
      </div>
    </div>
  );
}
