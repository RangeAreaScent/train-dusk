import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Choice, ConnectResult, GameState, PaperTheme } from "../engine/types";
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
  const [choicesReady, setChoicesReady] = useState(false);
  /** When true, the choices popup is temporarily hidden so the player
   *  can re-read the text behind it. Tapping the text area toggles it. */
  const [popupHidden, setPopupHidden] = useState(false);

  // Mark scene viewed + reset paging + collect clues on scene change.
  useEffect(() => {
    setPageIndex(0);
    setTextDone(false);
    setInputValue("");
    setNotesOpen(false);
    setChoicesReady(false);
    setPopupHidden(false);
    setState(applyClueChecks(markSceneViewed(state, scene.id), scene));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  // Reset choicesReady + popup-hidden state on page change.
  useEffect(() => {
    setChoicesReady(false);
    setPopupHidden(false);
  }, [pageIndex]);

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

  // Dynamic pagination by DOM measurement — paragraph-aware so a single
  // paragraph never gets split across pages unless it physically doesn't
  // fit on its own. Blank lines render as small (0.35em) gaps in both the
  // measurer and TypedText so the rhythm matches what the user sees.
  useLayoutEffect(() => {
    const text = textAreaRef.current;
    const m = measurerRef.current;
    if (!text || !m) return;

    const BLANK_GAP_EM = 0.35;

    /** Replace measurer contents with the structured rendering of `slice`. */
    const fillMeasurer = (slice: string[]) => {
      m.innerHTML = "";
      for (const l of slice) {
        const d = document.createElement("div");
        if (l === "") {
          d.style.height = `${BLANK_GAP_EM}em`;
          d.setAttribute("aria-hidden", "true");
        } else {
          d.textContent = l;
        }
        m.appendChild(d);
      }
    };

    /** Group lines into paragraphs (runs of non-empty lines), preserving
     *  one blank line between consecutive groups as a "soft" separator. */
    const groupParagraphs = (
      ls: string[],
    ): { lines: string[]; trailingBlank: boolean }[] => {
      const out: { lines: string[]; trailingBlank: boolean }[] = [];
      let cur: string[] = [];
      for (const l of ls) {
        if (l === "") {
          if (cur.length) {
            out.push({ lines: cur, trailingBlank: true });
            cur = [];
          }
        } else {
          cur.push(l);
        }
      }
      if (cur.length) out.push({ lines: cur, trailingBlank: false });
      return out;
    };

    /** Cap of "content" (non-blank) lines per page. Keeps the reader's
     *  field of view tight even when more would physically fit. */
    const MAX_CONTENT_LINES_PER_PAGE = 5;

    const countContent = (slice: string[]) =>
      slice.reduce((n, l) => (l === "" ? n : n + 1), 0);

    const compute = () => {
      const maxH = text.clientHeight;
      if (maxH <= 0) return;

      const paragraphs = groupParagraphs(lines);
      const result: string[][] = [];

      let i = 0;
      while (i < paragraphs.length) {
        let lastFitParas: string[] = [];
        let lastFitIdx = i;

        for (let j = i; j < paragraphs.length; j++) {
          const candidate: string[] = [];
          for (let k = i; k <= j; k++) {
            if (k > i) candidate.push("");
            candidate.push(...paragraphs[k].lines);
          }
          fillMeasurer(candidate);
          const fitsHeight = m.scrollHeight <= maxH;
          const fitsLineCap = countContent(candidate) <= MAX_CONTENT_LINES_PER_PAGE;
          if (fitsHeight && fitsLineCap) {
            lastFitParas = candidate;
            lastFitIdx = j + 1;
          } else {
            break;
          }
        }

        if (lastFitParas.length > 0) {
          result.push(lastFitParas);
          i = lastFitIdx;
          continue;
        }

        // Single paragraph too tall / too many content lines — split within.
        const single = paragraphs[i].lines;
        let take = 1;
        while (take < single.length) {
          const slice = single.slice(0, take + 1);
          fillMeasurer(slice);
          if (
            m.scrollHeight > maxH ||
            countContent(slice) > MAX_CONTENT_LINES_PER_PAGE
          ) {
            break;
          }
          take++;
        }
        result.push(single.slice(0, take));
        paragraphs[i] = {
          lines: single.slice(take),
          trailingBlank: paragraphs[i].trailingBlank,
        };
        if (paragraphs[i].lines.length === 0) i++;
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
    } else if (!choicesReady) {
      setChoicesReady(true);
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
      savePref({
        language: next,
        textSpeed: state.textSpeed,
        shellTheme: state.shellTheme,
        paperTheme: state.paperTheme,
      });
      setState({ ...state, language: next });
      return;
    }

    // Text speed presets — also stay in place.
    if (target === "text_speed_slow" || target === "text_speed_normal" || target === "text_speed_fast") {
      const next = target.replace("text_speed_", "") as GameState["textSpeed"];
      savePref({
        language: state.language,
        textSpeed: next,
        shellTheme: state.shellTheme,
        paperTheme: state.paperTheme,
      });
      setState({ ...state, textSpeed: next });
      return;
    }

    // Shell theme
    if (target === "shell_black" || target === "shell_gray") {
      const next = target === "shell_black" ? "black" : "gray";
      savePref({
        language: state.language,
        textSpeed: state.textSpeed,
        shellTheme: next,
        paperTheme: state.paperTheme,
      });
      setState({ ...state, shellTheme: next });
      return;
    }

    // Paper theme
    if (target === "paper_white" || target === "paper_cream") {
      const next = target === "paper_white" ? "white" : "cream";
      savePref({
        language: state.language,
        textSpeed: state.textSpeed,
        shellTheme: state.shellTheme,
        paperTheme: next,
      });
      setState({ ...state, paperTheme: next });
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

  // Cutscenes get a slower, more deliberate fade than regular scenes.
  const fadeDuration = scene.isCutscene ? 0.9 : 0.35;
  const visualKeyForAnim = scene.visual ?? `__no_visual_${scene.id}`;

  // ─── Ending card branch ──────────────────────────────────────────────
  if (scene.isEndingCard && scene.endingId) {
    return (
      <GameFrame
        visual={
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`v:${scene.endingId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="h-full w-full"
            >
              <VisualArea visualKey={`ending_${scene.endingId}`} />
            </motion.div>
          </AnimatePresence>
        }
        notesLabel={notesLabel}
        settingsLabel={settingsLabel}
        shellTheme={state.shellTheme}
        paperTheme={state.paperTheme}
        body={
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`b:${scene.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="h-full w-full"
            >
              <EndingCard
                endingId={scene.endingId}
                meta={{
                  runCount: state.runCount,
                  endingsReached: state.endingsReached,
                }}
                state={state}
                lang={state.language}
                paperTheme={state.paperTheme}
                onRestart={handleRestart}
                onMainMenu={handleMainMenu}
              />
            </motion.div>
          </AnimatePresence>
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

  const showInput = textDone && isLastPage && choicesReady && !!scene.inputField;
  const showChoices = textDone && isLastPage && choicesReady && choicesToShow.length > 0;
  // The ▾ is shown after typing finishes and until either we move to the
  // next page (hasMore) or the user reveals the choices (isLastPage path).
  const showAdvanceChevron =
    textDone && !choicesReady && (hasMore || choicesToShow.length > 0);

  return (
    <GameFrame
      visual={
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`v:${visualKeyForAnim}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration }}
            className="h-full w-full"
          >
            <VisualArea
              visualKey={scene.visual}
              popup={scene.popup}
              cutscene={scene.isCutscene}
            />
          </motion.div>
        </AnimatePresence>
      }
      notesEnabled={notesEnabled}
      notesLabel={notesLabel}
      settingsLabel={settingsLabel}
      shellTheme={state.shellTheme}
      paperTheme={state.paperTheme}
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
        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`b:${scene.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeDuration }}
          className="flex h-full flex-col relative"
        >
          {/* Text area fills the full body — the choices popup overlays
              the bottom when revealed and can grow up to 60% of body for
              long lists; the user can tap the text to dismiss the popup
              and re-read the prose, then tap again to bring it back. */}
          <div
            ref={textAreaRef}
            onClickCapture={(e) => {
              if (choicesReady) {
                e.stopPropagation();
                setPopupHidden((h) => !h);
              }
            }}
            className="flex-1 min-h-0 overflow-hidden relative"
          >
            <TypedText
              lines={pages[safeIndex] ?? []}
              speed={state.textSpeed}
              resetKey={`${scene.id}:${safeIndex}`}
              showNextIndicator={showAdvanceChevron}
              centered={scene.id === "title_screen"}
              onComplete={() => setTextDone(true)}
              onAdvance={handleAdvance}
            />
            <div
              ref={measurerRef}
              aria-hidden
              className="absolute inset-x-0 top-0 invisible pointer-events-none font-serif text-xl leading-snug"
            />
          </div>

          {(showInput || showChoices) && !popupHidden && (
            <ChoicesPopup paperTheme={state.paperTheme}>
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
            </ChoicesPopup>
          )}
        </motion.div>
        </AnimatePresence>
        </>
      }
    />
  );
}

function ChoicesPopup({
  children,
  paperTheme,
}: {
  children: ReactNode;
  paperTheme: PaperTheme;
}) {
  const bg = paperTheme === "cream" ? "#f5ecd6" : "#ffffff";
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center p-3 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="popup-scroll pointer-events-auto w-full max-h-[80%] overflow-y-scroll border-[2px] border-black p-3"
        style={{
          backgroundColor: bg,
          boxShadow: "4px 4px 0 #000",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
