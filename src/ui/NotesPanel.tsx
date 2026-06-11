import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [popup, setPopup] = useState<{ text: string; kind: "valid" | "invalid" } | null>(null);

  useEffect(() => {
    if (!popup) return;
    const id = setTimeout(() => setPopup(null), 2400);
    return () => clearTimeout(id);
  }, [popup]);

  const clues: Card[] = collectedClueIds(state).map((id) => {
    const def = getClueDef(id);
    return { id, kind: "clue", label: def ? def.name[lang] : id };
  });

  const insights: Card[] = unlockedInsightIds(state).map((id) => {
    const def = getInsightDef(id);
    return { id, kind: "insight", label: def ? def.text[lang] : id };
  });

  const handleCard = (id: string) => {
    if (selected === id) {
      setSelected(null);
      return;
    }
    if (!selected) {
      setSelected(id);
      return;
    }
    const result = onConnect(selected, id);
    if (result.kind === "valid" && result.insightText) {
      setPopup({ text: `◇ ${result.insightText[lang]}`, kind: "valid" });
    } else if (result.kind === "invalid" && result.message) {
      setPopup({ text: result.message, kind: "invalid" });
    }
    setSelected(null);
  };

  const renderCard = (c: Card) => {
    const isSelected = selected === c.id;
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => handleCard(c.id)}
        className={`text-left font-serif text-sm leading-snug px-2.5 py-2.5 border border-black bg-white transition-all ${
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
    <div className="absolute inset-0 bg-white text-black flex flex-col z-10">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <div className="font-serif text-xl">
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

      <div className="flex-1 min-h-0 overflow-y-scroll px-4 pb-4 space-y-4">
        <section>
          <div className="text-xs tracking-widest text-black/50 mb-2">
            {T(lang, "본 것들", "Things I've Seen")}
          </div>
          {clues.length === 0 ? (
            <div className="text-sm text-black/40">{T(lang, "아직 없음.", "Nothing yet.")}</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">{clues.map(renderCard)}</div>
          )}
        </section>

        <section>
          <div className="text-xs tracking-widest text-black/50 mb-2">
            {T(lang, "떠오르는 생각", "Thoughts That Surface")}
          </div>
          {insights.length === 0 ? (
            <div className="text-sm text-black/40">{T(lang, "아직 없음.", "Nothing yet.")}</div>
          ) : (
            <div className="grid grid-cols-1 gap-2">{insights.map(renderCard)}</div>
          )}
        </section>
      </div>

      {/* Connection hint — only while a card is selected */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="shrink-0 text-center text-xs font-serif text-black/40 pb-2"
          >
            {T(lang, "다음 카드를 선택…", "Pick a second card…")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating popup for connection result */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 text-sm font-serif text-center border shadow-lg max-w-[85%] z-20 bg-white ${
              popup.kind === "valid" ? "border-black text-black" : "border-black/30 text-black/60"
            }`}
          >
            {popup.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
