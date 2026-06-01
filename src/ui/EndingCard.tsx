import type { EndingId, GameState, Lang, MetaSave } from "../engine/types";
import { getEndingDef } from "../engine/scenes";

interface Props {
  endingId: EndingId;
  meta: MetaSave;
  state: GameState;
  lang: Lang;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function EndingCard({
  endingId,
  meta,
  lang,
  onRestart,
  onMainMenu,
}: Props) {
  const def = getEndingDef(endingId);
  const name = def ? def.name[lang] : endingId;

  const endingsLabel =
    meta.endingsReached.length > 0
      ? meta.endingsReached.join(" ")
      : endingId;

  const isComplete = ["A", "B", "C", "D"].every((id) =>
    meta.endingsReached.includes(id as EndingId),
  );

  const T = (ko: string, en: string) => (lang === "ko" ? ko : en);

  return (
    <div className="flex h-full flex-col items-center justify-between overflow-y-auto">
      <div className="flex flex-col items-center text-center w-full pt-2">
        <div className="text-black/70 tracking-widest text-sm">─────────</div>
        <div className="mt-3 font-serif text-3xl text-black">{name}</div>
        <div className="mt-3 text-black/70 tracking-widest text-sm">
          ─────────
        </div>
        <div className="mt-5 text-black/80 text-xl tracking-widest">
          ◇  ◇  ◇
        </div>
        <div className="mt-5 text-black/60 text-sm tracking-widest">
          ─ Train Dusk ─
        </div>
      </div>

      <div className="w-full text-center text-black/60 text-sm mt-3 space-y-1">
        <div>
          {T(`─ 회차: ${meta.runCount} ─`, `─ Run: ${meta.runCount} ─`)}
        </div>
        <div>
          {T(
            `─ 도달한 엔딩: ${endingsLabel} ─`,
            `─ Endings: ${endingsLabel} ─`,
          )}
        </div>
        {isComplete && (
          <div className="mt-1 text-black/80">
            {T("─ 모든 엔딩을 보았습니다. ─", "─ All endings reached. ─")}
          </div>
        )}
      </div>

      <div className="w-full mt-4 pb-2 flex flex-col items-center gap-1 text-xl">
        <button
          type="button"
          className="font-serif text-black cursor-pointer hover:opacity-70"
          onClick={onRestart}
        >
          ▸ {T("다시 시작", "Start Again")}
        </button>
        <button
          type="button"
          className="font-serif text-black cursor-pointer hover:opacity-70"
          onClick={onMainMenu}
        >
          ▸ {T("메인 화면", "Main Menu")}
        </button>
      </div>
    </div>
  );
}
