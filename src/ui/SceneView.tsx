import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Choice, GameState } from "../engine/types";
import { getScene, getSceneText } from "../engine/scenes";
import { applyChoice, markSceneViewed } from "../engine/state";
import { GameFrame } from "./GameFrame";
import { VisualArea } from "./VisualArea";
import { TypedText } from "./TypedText";
import { Choices } from "./Choices";
import { NameInputField } from "./NameInputField";

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
}

export function SceneView({ state, setState }: Props) {
  const scene = getScene(state.currentScene);
  const lines = useMemo(
    () => getSceneText(scene, state.language, state.runCount),
    [scene, state.language, state.runCount],
  );

  const textAreaRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);

  const [pages, setPages] = useState<string[][]>([lines]);
  const [pageIndex, setPageIndex] = useState(0);
  const [textDone, setTextDone] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setPageIndex(0);
    setTextDone(false);
    setInputValue("");
    setState(markSceneViewed(state, scene.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  useLayoutEffect(() => {
    const text = textAreaRef.current;
    const m = measurerRef.current;
    if (!text || !m) return;

    const compute = () => {
      const maxH = text.clientHeight;
      if (maxH <= 0) return;

      const result: string[][] = [];
      let start = 0;
      while (start < lines.length) {
        while (start < lines.length && lines[start] === "") start++;
        if (start >= lines.length) break;

        let lastFit = start + 1;
        let end = start + 1;
        while (end <= lines.length) {
          m.textContent = lines.slice(start, end).join("\n");
          if (m.scrollHeight <= maxH) {
            lastFit = end;
            end++;
          } else {
            break;
          }
        }
        let pageEnd = lastFit;
        while (pageEnd > start + 1 && lines[pageEnd - 1] === "") pageEnd--;
        result.push(lines.slice(start, pageEnd));
        start = lastFit;
      }
      setPages(result.length > 0 ? result : [[]]);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(text);
    return () => ro.disconnect();
  }, [lines]);

  const safeIndex = Math.min(pageIndex, pages.length - 1);
  const isLastPage = safeIndex >= pages.length - 1;
  const hasMore = !isLastPage;

  const handleAdvance = () => {
    if (hasMore) {
      setPageIndex((i) => i + 1);
      setTextDone(false);
    }
  };

  const handleSelect = (choice: Choice) => {
    setState(applyChoice(state, choice, inputValue));
  };

  const implicitContinue: Choice | null =
    !scene.choices && (scene.returnTo || scene.next)
      ? {
          label: { ko: "계속한다", en: "Continue" },
          next: scene.next,
          returnTo: scene.returnTo,
        }
      : null;

  const choicesToShow =
    scene.choices ?? (implicitContinue ? [implicitContinue] : []);

  const showInput = textDone && isLastPage && !!scene.inputField;
  const showChoices = textDone && isLastPage && choicesToShow.length > 0;

  return (
    <GameFrame
      visual={<VisualArea visualKey={scene.visual} popup={scene.popup} />}
      body={
        <div className="flex h-full flex-col">
          <div
            ref={textAreaRef}
            className="flex-1 min-h-0 overflow-hidden relative"
          >
            <TypedText
              lines={pages[safeIndex] ?? []}
              speed={state.textSpeed}
              resetKey={`${scene.id}:${safeIndex}`}
              onComplete={() => setTextDone(true)}
              onAdvance={handleAdvance}
            />
            <div
              ref={measurerRef}
              aria-hidden
              className="absolute inset-x-0 top-0 invisible pointer-events-none whitespace-pre-line font-serif text-2xl leading-relaxed"
            />
          </div>

          <div className="shrink-0 mt-3 h-[170px] overflow-hidden">
            {textDone && hasMore && (
              <div
                className="text-right text-black/60 text-2xl cursor-pointer select-none animate-pulse"
                onClick={handleAdvance}
              >
                ▾
              </div>
            )}

            {showInput && scene.inputField && (
              <NameInputField
                placeholder={scene.inputField.placeholder[state.language]}
                value={inputValue}
                maxLength={scene.inputField.maxLength}
                onChange={setInputValue}
              />
            )}

            {showChoices && (
              <Choices
                choices={choicesToShow}
                lang={state.language}
                state={state}
                inputValue={inputValue}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>
      }
    />
  );
}
