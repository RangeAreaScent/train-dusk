import { useEffect, useState } from "react";
import config from "../data/config.json";
import type { TextSpeed } from "../engine/types";
import { startTyping, stopTyping } from "../audio/typewriter";

interface Props {
  lines: string[];
  speed: TextSpeed;
  resetKey: string;
  /** When true and typing finishes, render a ▶ on the line below the
   *  last text line as a "tap to continue" cue. */
  showNextIndicator?: boolean;
  /** Render the text centered (used by the title screen). */
  centered?: boolean;
  /** When set to true, immediately reveal all remaining characters. */
  forceComplete?: boolean;
  onComplete?: () => void;
  onAdvance?: () => void;
}

const BLANK_GAP_EM = 0.35;

export function TypedText({
  lines,
  speed,
  resetKey,
  showNextIndicator,
  centered,
  forceComplete,
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
    if (forceComplete && shown < fullText.length) setShown(fullText.length);
  }, [forceComplete, shown, fullText.length]);

  useEffect(() => {
    if (shown >= fullText.length) {
      stopTyping();
      onComplete?.();
      return;
    }
    startTyping();
    const id = window.setTimeout(() => {
      setShown((s) => s + 1);
    }, msPerChar);
    return () => window.clearTimeout(id);
  }, [shown, fullText, msPerChar, onComplete]);

  useEffect(() => () => stopTyping(), []);

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
      className={`text-black font-serif text-xl leading-snug cursor-pointer select-none ${
        centered ? "text-center" : ""
      }`}
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
      {done && showNextIndicator && (
        <div
          className={`mt-2 text-2xl text-black/70 chevron-drift leading-none ${
            centered ? "text-center" : "text-right"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onAdvance?.();
          }}
        >
          ▶
        </div>
      )}
    </div>
  );
}
