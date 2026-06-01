import { useState } from "react";
import type { ConnectResult, GameState, Lang } from "../engine/types";
import {
  collectedClueIds,
  getClueDef,
  getInsightDef,
  unlockedInsightIds,
} from "../engine/state";

interface Props {
  state: GameState;
  lang: Lang;
  onConnect: (a: string, b: string) => ConnectResult;
  onClose: () => void;
}

type CardKind = "clue" | "insight";

interface Card {
  id: string;
  label: string;
  kind: CardKind;
}

const T = (lang: Lang, ko: string, en: string) => (lang === "ko" ? ko : en);

export function NotesPanel({ state, lang, onConnect, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ConnectResult | null>(null);

  const clues: Card[] = collectedClueIds(state).map((id) => {
    const def = getClueDef(id);
    return {
      id,
      kind: "clue",
      label: def ? def.name[lang] : id,
    };
  });

  const insights: Card[] = unlockedInsightIds(state).map((id) => {
    const def = getInsightDef(id);
    return {
      id,
      kind: "insight",
      label: def ? def.text[lang] : id,
    };
  });

  const handleCard = (id: string) => {
    if (selected === id) {
      setSelected(null);
      return;
    }
    if (!selected) {
      setSelected(id);
      setFeedback(null);
      return;
    }
    const result = onConnect(selected, id);
    setFeedback(result);
    setSelected(null);
  };

  const renderCard = (c: Card) => {
    const isSelected = selected === c.id;
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => handleCard(c.id)}
        className={`text-left font-serif text-sm leading-snug px-2 py-2 border border-black bg-white transition-all ${
          isSelected
            ? "border-[3px] -translate-y-0.5 shadow-[2px_2px_0_#000]"
            : "hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#000]"
        }`}
        style={{ minHeight: 56 }}
      >
        {c.label}
      </button>
    );
  };

  return (
    <div className="absolute inset-0 bg-white text-black p-4 flex flex-col z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="font-serif text-2xl">
          {T(lang, "노트", "Notes")}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-sm border border-black px-2 py-0.5 hover:bg-black hover:text-white"
        >
          {T(lang, "닫기", "Close")}
        </button>
      </div>

      <div className="min-h-[44px] mb-3 text-sm leading-snug text-center">
        {feedback?.kind === "valid" && feedback.insightText && (
          <div className="font-serif text-black animate-pulse">
            ◇ {feedback.insightText[lang]}
          </div>
        )}
        {feedback?.kind === "invalid" && (
          <div className="font-serif text-black/60">{feedback.message}</div>
        )}
        {!feedback && selected && (
          <div className="font-serif text-black/50">
            {T(lang, "다음 카드를 선택…", "Pick a second card…")}
          </div>
        )}
        {!feedback && !selected && (
          <div className="font-serif text-black/40">
            {T(
              lang,
              "두 카드를 골라 이어보세요.",
              "Tap two cards to connect them.",
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <section>
          <div className="text-xs tracking-widest text-black/60 mb-2">
            {T(lang, "본 것들", "Things I've Seen")}
          </div>
          {clues.length === 0 ? (
            <div className="text-sm text-black/40">
              {T(lang, "아직 없음.", "Nothing yet.")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">{clues.map(renderCard)}</div>
          )}
        </section>

        <section>
          <div className="text-xs tracking-widest text-black/60 mb-2">
            {T(lang, "떠오르는 생각", "Thoughts That Surface")}
          </div>
          {insights.length === 0 ? (
            <div className="text-sm text-black/40">
              {T(lang, "아직 없음.", "Nothing yet.")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">{insights.map(renderCard)}</div>
          )}
        </section>
      </div>
    </div>
  );
}
