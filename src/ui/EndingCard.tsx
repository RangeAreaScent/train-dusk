import { forwardRef, useState, type RefObject } from "react";
import type { EndingId, GameState, Lang, MetaSave, PaperTheme } from "../engine/types";
import { getEndingDef } from "../engine/scenes";
import {
  buildEndingShareURL,
  copyToClipboard,
  exportElementToPng,
} from "../platform/share";

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

// ─── Page (rendered in the visual area, like a book page) ──────────────────

interface PageProps {
  endingId: EndingId;
  meta: MetaSave;
  lang: Lang;
  paperTheme?: PaperTheme;
}

export const EndingCardPage = forwardRef<HTMLDivElement, PageProps>(
  function EndingCardPage({ endingId, meta, lang, paperTheme = "white" }, ref) {
    const paperBg = PAPER_BG[paperTheme];
    const def = getEndingDef(endingId);
    const name = def ? def.name[lang] : endingId;

    const endingsLabel =
      meta.endingsReached.length > 0 ? meta.endingsReached.join(" ") : endingId;

    const isComplete = ["A", "B", "C", "D"].every((id) =>
      meta.endingsReached.includes(id as EndingId),
    );

    const T = (ko: string, en: string) => (lang === "ko" ? ko : en);

    return (
      <div
        ref={ref}
        className="flex h-full w-full flex-col items-center justify-center text-center px-6"
        style={{ backgroundColor: paperBg }}
      >
        <div className="text-black/70 tracking-widest text-sm">─────────</div>
        <div className="mt-3 font-serif text-4xl text-black">{name}</div>
        <div className="mt-3 text-black/70 tracking-widest text-sm">
          ─────────
        </div>
        <div className="mt-6 text-black/80 text-xl tracking-widest">
          ◇  ◇  ◇
        </div>
        <div className="mt-6 text-black/60 text-sm tracking-widest">
          ─ Train Dusk ─
        </div>

        <div className="mt-8 text-black/60 text-sm space-y-1">
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
      </div>
    );
  },
);

// ─── Actions (rendered in the dialog/choices popup) ────────────────────────

interface ActionsProps {
  endingId: EndingId;
  meta: MetaSave;
  state: GameState;
  lang: Lang;
  paperTheme?: PaperTheme;
  pageRef: RefObject<HTMLDivElement | null>;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function EndingCardActions({
  endingId,
  meta,
  lang,
  paperTheme = "white",
  pageRef,
  onRestart,
  onMainMenu,
}: ActionsProps) {
  const paperBg = PAPER_BG[paperTheme];
  const T = (ko: string, en: string) => (lang === "ko" ? ko : en);

  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const handleSavePNG = async () => {
    if (!pageRef.current || busy) return;
    setBusy(true);
    try {
      const filename = `train-dusk_${endingId}_run${meta.runCount}.png`;
      await exportElementToPng(pageRef.current, filename, paperBg);
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
    <div className="space-y-1">
      {endingId !== "D" && (
        <button
          type="button"
          className="choice-press block text-left font-serif text-xl text-black cursor-pointer"
          onClick={onRestart}
        >
          ▸ {restartLabel(endingId, lang)}
        </button>
      )}
      {endingId === "D" && (
        <button
          type="button"
          className="choice-press block text-left font-serif text-xl text-black cursor-pointer"
          onClick={onMainMenu}
        >
          ▸ {T("처음으로", "To the Beginning")}
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        className="choice-press block text-left font-serif text-xl text-black/70 cursor-pointer disabled:opacity-40"
        onClick={handleSavePNG}
      >
        ▸ {T("PNG 저장", "Save as PNG")}
      </button>
      <button
        type="button"
        className="choice-press block text-left font-serif text-xl text-black/70 cursor-pointer"
        onClick={handleCopyURL}
      >
        ▸ {T("URL 복사", "Copy URL")}
      </button>
      {toast && (
        <div className="pt-1 text-sm text-black animate-pulse">— {toast} —</div>
      )}
    </div>
  );
}
