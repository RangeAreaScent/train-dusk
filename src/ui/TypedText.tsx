import { useEffect, useState } from "react";
import config from "../data/config.json";
import type { TextSpeed } from "../engine/types";

interface Props {
  lines: string[];
  speed: TextSpeed;
  resetKey: string;
  onComplete?: () => void;
  onAdvance?: () => void;
}

/** Height of an "empty" line — a soft paragraph break, much smaller than
 * a real line of text. Keeps the page rhythm tight so 4+ lines actually
 * fit instead of two short sentences stranded with white space. */
const BLANK_GAP_EM = 0.35;

export function TypedText({
  lines,
  speed,
  resetKey,
  onComplete,
  onAdvance,
}: Props) {
  const fullText = lines.join("\n");
  const [shown, setShown] = useState(0);
  const msPerChar = config.textSpeed[speed];

  useEffect(() => {
    setShown(0);
  }, [resetKey]);

  useEffect(() => {
    if (shown >= fullText.length) {
      onComplete?.();
      return;
    }
    const id = window.setTimeout(() => setShown((s) => s + 1), msPerChar);
    return () => window.clearTimeout(id);
  }, [shown, fullText, msPerChar, onComplete]);

  const done = shown >= fullText.length;

  const handleClick = () => {
    if (!done) {
      setShown(fullText.length);
    } else {
      onAdvance?.();
    }
  };

  const visibleText = fullText.slice(0, shown);
  const parts = visibleText.split("\n");

  return (
    <div
      className="text-black font-serif text-2xl leading-snug cursor-pointer select-none"
      onClick={handleClick}
    >
      {parts.map((line, i) => {
        const isLast = i === parts.length - 1;
        if (line === "") {
          return (
            <div
              key={i}
              aria-hidden
              style={{ height: `${BLANK_GAP_EM}em` }}
            />
          );
        }
        return (
          <div key={i}>
            {line}
            {isLast && !done && <span className="opacity-50">▍</span>}
          </div>
        );
      })}
    </div>
  );
}
