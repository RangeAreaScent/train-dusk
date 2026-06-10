import { useRef, useState } from "react";
import type { EndingId, GameState, Lang, MetaSave, PaperTheme } from "../engine/types";
import { getEndingDef } from "../engine/scenes";
import {
  buildEndingShareURL,
  copyToClipboard,
  exportElementToPng,
} from "../platform/share";

interface Props {
  endingId: EndingId;
  meta: MetaSave;
  state: GameState;
  lang: Lang;
  paperTheme?: PaperTheme;
  onRestart: () => void;
  onMainMenu: () => void;
}

const PAPER_BG: Record<PaperTheme, string> = {
  white: "#ffffff",
  cream: "#f5ecd6",
};

/** In-fiction restart label that shifts tone with the just-finished run.
 *  Run 1 → A: still believes it's possible. Run 2 → C: tries again,
 *  knowing more. Run 3 → B: pulled back. Run 4 → D: not shown. */
function restartLabel(endingId: EndingId, lang: Lang): string {
  const ko: Record<EndingId, string> = {
    A: "다시 탑승한다",
    C: "...또 한 번",
    B: "...아직",
    D: "다시 탑승한다",
  };
  const en: Record<EndingId, string> = {
    A: "Board again",
    C: "...One more time",
    B: "...Not yet",
    D: "Board again",
  };
  return lang === "ko" ? ko[endingId] : en[endingId];
}

export function EndingCard({
  endingId,
  meta,
  lang,
  paperTheme = "white",
  onRestart,
  onMainMenu,
}: Props) {
  const paperBg = PAPER_BG[paperTheme];
  const def = getEndingDef(endingId);
  const name = def ? def.name[lang] : endingId;

  const endingsLabel =
    meta.endingsReached.length > 0 ? meta.endingsReached.join(" ") : endingId;

  const isComplete = ["A", "B", "C", "D"].every((id) =>
    meta.endingsReached.includes(id as EndingId),
  );

  const T = (ko: string, en: string) => (lang === "ko" ? ko : en);

  const cardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const handleSavePNG = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const filename = `train-dusk_${endingId}_run${meta.runCount}.png`;
      await exportElementToPng(cardRef.current, filename, paperBg);
      flash(T("저장됨", "Saved"));
    } catch (e) {
      console.error(e);
      flash(T("저장 실패", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  const handleCopyURL = async () => {
    if (busy) return;
    const url = buildEndingShareURL(endingId, meta.runCount);
    const ok = await copyToClipboard(url);
    flash(ok ? T("URL 복사됨", "URL copied") : T("복사 실패", "Copy failed"));
  };

  return (
    <div className="flex h-full flex-col items-center justify-between overflow-y-auto">
      <div
        ref={cardRef}
        className="flex flex-col items-center text-center w-full pt-2"
        style={{ backgroundColor: paperBg }}
      >
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
        {toast && (
          <div className="mt-1 text-black animate-pulse">— {toast} —</div>
        )}
      </div>

      <div className="w-full mt-3 pb-2 flex flex-col items-center gap-1 text-lg">
        {endingId !== "D" && (
          <button
            type="button"
            className="font-serif text-black cursor-pointer hover:opacity-70"
            onClick={onRestart}
          >
            ▸ {restartLabel(endingId, lang)}
          </button>
        )}
        <button
          type="button"
          className="font-serif text-black cursor-pointer hover:opacity-70"
          onClick={onMainMenu}
        >
          ▸ {endingId === "D" ? T("처음으로", "To the Beginning") : T("메인 화면", "Main Menu")}
        </button>
        <button
          type="button"
          disabled={busy}
          className="font-serif text-black/80 cursor-pointer hover:opacity-70 disabled:opacity-40"
          onClick={handleSavePNG}
        >
          ▸ {T("PNG 저장", "Save as PNG")}
        </button>
        <button
          type="button"
          className="font-serif text-black/80 cursor-pointer hover:opacity-70"
          onClick={handleCopyURL}
        >
          ▸ {T("URL 복사", "Copy URL")}
        </button>
      </div>
    </div>
  );
}
