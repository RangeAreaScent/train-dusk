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

  return (
    <div
      className="whitespace-pre-line text-black font-serif text-2xl leading-relaxed cursor-pointer select-none"
      onClick={handleClick}
    >
      {fullText.slice(0, shown)}
      {!done && <span className="opacity-50">▍</span>}
    </div>
  );
}
