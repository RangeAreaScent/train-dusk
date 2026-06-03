import scenesData from "../data/scenes.json";
import endingsData from "../data/endings.json";
import type { Choice, EndingDef, GameState, Lang, Scene } from "./types";
import { choiceKey, hasSavedGame } from "./state";

const SAVE_KEY = "trainDusk_save";

/**
 * Build the full scene map by merging scenes.json with the ending sequences
 * defined in endings.json. Ending sequence items become first-class scenes;
 * items without an explicit next/choices/isEndingCard auto-flow to the next
 * item in their sequence.
 */
function buildSceneMap(): {
  scenes: Record<string, Scene>;
  aliases: Record<string, string>;
} {
  const scenes: Record<string, Scene> = { ...(scenesData as unknown as Record<string, Scene>) };

  const endingKeys: Array<keyof typeof endingsData> = [
    "endingA",
    "endingB",
    "endingC",
    "endingD",
  ];

  for (const key of endingKeys) {
    const ending = (endingsData as unknown as Record<string, { sequence?: Scene[] }>)[key as string];
    const seq = ending?.sequence;
    if (!Array.isArray(seq)) continue;
    for (let i = 0; i < seq.length; i++) {
      const node: Scene = { ...seq[i] };
      const auto =
        !node.next &&
        !node.returnTo &&
        !node.choices &&
        !node.isEndingCard &&
        i + 1 < seq.length;
      if (auto) node.next = seq[i + 1].id;
      if (!node.text) node.text = { ko: [], en: [] };
      scenes[node.id] = node;
    }
  }

  // Synthetic settings_menu scene (title_screen routes here). All choices
  // are intercepted by SceneView as in-place actions; none navigate further.
  scenes.settings_menu = {
    id: "settings_menu",
    text: {
      ko: ["설정"],
      en: ["Settings"],
    },
    choices: [
      {
        label: { ko: "언어 / Language", en: "Language / 언어" },
        next: "language_toggle",
      },
      {
        label: { ko: "속도: 느림", en: "Speed: Slow" },
        next: "text_speed_slow",
      },
      {
        label: { ko: "속도: 보통", en: "Speed: Normal" },
        next: "text_speed_normal",
      },
      {
        label: { ko: "속도: 빠름", en: "Speed: Fast" },
        next: "text_speed_fast",
      },
      {
        label: { ko: "셸: 검정", en: "Shell: Black" },
        next: "shell_black",
      },
      {
        label: { ko: "셸: 그레이", en: "Shell: Gray" },
        next: "shell_gray",
      },
      {
        label: { ko: "종이: 흰색", en: "Paper: White" },
        next: "paper_white",
      },
      {
        label: { ko: "종이: 크림", en: "Paper: Cream" },
        next: "paper_cream",
      },
      {
        label: { ko: "사운드: 켬", en: "Sound: On" },
        next: "sound_on",
      },
      {
        label: { ko: "사운드: 끔", en: "Sound: Off" },
        next: "sound_off",
      },
      {
        label: { ko: "음악: 켬", en: "Music: On" },
        next: "music_on",
      },
      {
        label: { ko: "음악: 끔", en: "Music: Off" },
        next: "music_off",
      },
      {
        label: { ko: "돌아가기", en: "Back" },
        next: "back_to_title",
      },
    ],
  };

  // Entry-name aliases. car_4_* scenes route to these names; we resolve
  // them to the first scene of each ending's sequence.
  const aliases: Record<string, string> = {
    ending_A_intro: "endA_intro",
    ending_B_intro: "endB_intro",
    ending_C_intro: "endC_intro",
    ending_D_intro: "endD_realization",
  };

  return { scenes, aliases };
}

const { scenes, aliases } = buildSceneMap();

export function getScene(id: string): Scene {
  const resolved = aliases[id] ?? id;
  const s = scenes[resolved];
  if (!s) throw new Error(`Scene not found: ${id}`);
  return s;
}

export function getSceneText(
  scene: Scene,
  lang: Lang,
  runCount: number,
): string[] {
  let lines = scene.text[lang];
  for (let r = 2; r <= runCount; r++) {
    const variant = scene.variants?.[`run${r}`];
    if (!variant) continue;
    if (variant.replace) lines = variant.replace[lang];
    else if (variant.append) lines = [...lines, ...variant.append[lang]];
  }
  return lines;
}

export function isChoiceAvailable(choice: Choice, state: GameState): boolean {
  if (choice.condition === "hasSave") {
    return hasSavedGame(SAVE_KEY);
  }
  if (choice.requiresAllViewed) {
    if (!choice.requiresAllViewed.every((id) => state.viewedScenes.includes(id))) {
      return false;
    }
  }
  if (choice.requiresClue && !state.clues[choice.requiresClue]) {
    return false;
  }
  if (choice.requiresInsight && !state.insights[choice.requiresInsight]) {
    return false;
  }
  if (choice.requiresFlag && !state.flags[choice.requiresFlag]) {
    return false;
  }
  return true;
}

export function isChoiceConsumed(choice: Choice, state: GameState): boolean {
  if (!choice.viewOnce) return false;
  const key = choiceKey(choice);
  return key ? state.viewedChoices.includes(key) : false;
}

export function getEndingDef(endingId: string): EndingDef | null {
  const key = `ending${endingId}`;
  const e = (endingsData as unknown as Record<string, EndingDef>)[key];
  return e ?? null;
}

// ─── Branch-check resolution ──────────────────────────────────────────────

function hasMiddleInsight(state: GameState): boolean {
  return !!(state.insights.callsMyName || state.insights.lostTime);
}

function evalCondition(cond: string, state: GameState): boolean {
  switch (cond) {
    case "default":
      return true;
    case "hasMiddleInsight":
      return hasMiddleInsight(state);
    case "whisperCount >= 3 && hiddenTriggered":
      return (
        state.counters.whisperCount >= 3 && !!state.flags.hiddenTriggered
      );
    case "avoidCount >= 4":
      return state.counters.avoidCount >= 4;
    case "conductorTrigger && hasMiddleInsight && hiddenTriggered && whisperCount >= 3":
      return (
        !!state.flags.conductorTrigger &&
        hasMiddleInsight(state) &&
        !!state.flags.hiddenTriggered &&
        state.counters.whisperCount >= 3
      );
    case "conductorTrigger && hasMiddleInsight":
      return !!state.flags.conductorTrigger && hasMiddleInsight(state);
    case "insights.mustWakeUp && endingsReached.length >= 2":
      return (
        !!state.insights.mustWakeUp && state.endingsReached.length >= 2
      );
    default:
      return false;
  }
}

/**
 * Resolve a target scene ID through any chain of branch-check scenes —
 * picking the first matching branch at each step — so the player lands
 * on a real scene with text/choices, never a blank router. Capped at
 * 10 hops so bad data can't loop forever.
 */
export function resolveBranches(targetId: string, state: GameState): string {
  let id = targetId;
  for (let depth = 0; depth < 10; depth++) {
    const resolved = aliases[id] ?? id;
    const sc = scenes[resolved];
    if (!sc || !sc.isBranchCheck) return id;
    const branches = sc.branches;
    if (!branches || branches.length === 0) return id;
    let next: string | null = null;
    for (const b of branches) {
      if (evalCondition(b.condition, state)) {
        next = b.next;
        break;
      }
    }
    if (!next || next === id) return id;
    id = next;
  }
  return id;
}
