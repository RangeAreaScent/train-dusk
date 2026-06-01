import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Choice, ConnectResult, GameState } from "../engine/types";
import { getScene, getSceneText } from "../engine/scenes";
import {
  applyChoice,
  applyClueChecks,
  clearSave,
  collectedClueIds,
  initStateFromPrefs,
  loadMeta,
  loadState,
  markSceneViewed,
  recordEnding,
  savePref,
  saveState,
  startFreshRun,
  tryConnect,
} from "../engine/state";
import { GameFrame } from "./GameFrame";
import { VisualArea } from "./VisualArea";
import { TypedText } from "./TypedText";
import { Choices } from "./Choices";
import { NameInputField } from "./NameInputField";
import { EndingCard } from "./EndingCard";
import { NotesPanel } from "./NotesPanel";
import { clearURLParams, pushEndingURL } from "../platform/share";

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
  const [notesOpen, setNotesOpen] = useState(false);

  // Mark scene viewed + reset paging + collect clues on scene change.
  useEffect(() => {
    setPageIndex(0);
    setTextDone(false);
    setInputValue("");
    setNotesOpen(false);
    setState(applyClueChecks(markSceneViewed(state, scene.id), scene));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  // Auto-save on every state change, except on meta scenes (title, settings)
  // and ending cards. We want a clean save slot that points only at real
  // story scenes the player is actually in the middle of.
  useEffect(() => {
    if (scene.isEndingCard) return;
    if (scene.id === "title_screen" || scene.id === "settings_menu") return;
    saveState(state);
  }, [state, scene.id, scene.isEndingCard]);

  // When reaching an ending card, record the run in meta, wipe the save,
  // and stamp the URL so the card is shareable. Visitors who arrive via a
  // shared URL get the flags.viewingShared sentinel and skip all of that —
  // their local progress shouldn't be touched by viewing someone else's link.
  useEffect(() => {
    if (scene.isEndingCard && scene.endingId) {
      if (state.flags.viewingShared) return;
      const meta = recordEnding(scene.endingId);
      setState({
        ...state,
        endingsReached: meta.endingsReached,
        runCount: meta.runCount,
      });
      clearSave();
      pushEndingURL(scene.endingId, meta.runCount);
    } else {
      clearURLParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  // Dynamic pagination by DOM measurement.
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
    const target = choice.next;

    // Title-screen "이어하기" — load persisted state instead of routing.
    if (target === "load_save") {
      const saved = loadState();
      if (saved) {
        setState(saved);
        return;
      }
      return;
    }

    // Language toggle — flips ko↔en, stays on current scene.
    if (target === "language_toggle") {
      const next = state.language === "ko" ? "en" : "ko";
      savePref({ language: next, textSpeed: state.textSpeed });
      setState({ ...state, language: next });
      return;
    }

    // Text speed presets — also stay in place.
    if (target === "text_speed_slow" || target === "text_speed_normal" || target === "text_speed_fast") {
      const next = target.replace("text_speed_", "") as GameState["textSpeed"];
      savePref({ language: state.language, textSpeed: next });
      setState({ ...state, textSpeed: next });
      return;
    }

    // Back from settings — return to whatever scene was active before
    // settings was opened, falling back to title if nothing was recorded.
    if (target === "back_to_title") {
      const dest = state.previousScene || "title_screen";
      const { previousScene: _drop, ...rest } = state;
      setState({ ...rest, currentScene: dest });
      return;
    }

    setState(applyChoice(state, choice, inputValue));
  };

  const handleRestart = () => {
    clearSave();
    const meta = loadMeta();
    setState(startFreshRun(meta));
  };

  const handleMainMenu = () => {
    clearSave();
    const meta = loadMeta();
    setState({ ...initStateFromPrefs(), runCount: meta.runCount });
  };

  const handleConnect = (a: string, b: string): ConnectResult => {
    const { newState, result } = tryConnect(state, a, b, state.language);
    if (result.kind === "valid") setState(newState);
    return result;
  };

  const notesEnabled =
    collectedClueIds(state).length >= 2 &&
    scene.id !== "title_screen" &&
    scene.id !== "settings_menu" &&
    !scene.isEndingCard;

  const openSettings = () => {
    setState({
      ...state,
      previousScene: state.currentScene,
      currentScene: "settings_menu",
    });
  };

  // Settings is reachable from any non-meta scene, but on settings/title
  // we hide the duplicate header button.
  const canOpenSettings =
    scene.id !== "settings_menu" &&
    scene.id !== "title_screen" &&
    !scene.isEndingCard;

  const notesLabel = state.language === "ko" ? "노트" : "Notes";
  const settingsLabel = state.language === "ko" ? "설정" : "Settings";

  // ─── Ending card branch ──────────────────────────────────────────────
  if (scene.isEndingCard && scene.endingId) {
    return (
      <GameFrame
        visual={<VisualArea visualKey={`ending_${scene.endingId}`} />}
        notesLabel={notesLabel}
        settingsLabel={settingsLabel}
        body={
          <EndingCard
            endingId={scene.endingId}
            meta={{
              runCount: state.runCount,
              endingsReached: state.endingsReached,
            }}
            state={state}
            lang={state.language}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
          />
        }
      />
    );
  }

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
      visual={
        <VisualArea
          visualKey={scene.visual}
          popup={scene.popup}
          cutscene={scene.isCutscene}
        />
      }
      notesEnabled={notesEnabled}
      notesLabel={notesLabel}
      settingsLabel={settingsLabel}
      onOpenNotes={notesEnabled ? () => setNotesOpen(true) : undefined}
      onOpenSettings={canOpenSettings ? openSettings : undefined}
      body={
        <>
        {notesOpen && (
          <NotesPanel
            state={state}
            lang={state.language}
            onConnect={handleConnect}
            onClose={() => setNotesOpen(false)}
          />
        )}
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
                className="text-right text-black/60 text-2xl cursor-pointer select-none chevron-drift"
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
        </>
      }
    />
  );
}
