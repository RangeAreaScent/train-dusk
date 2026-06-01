import type { Choice, GameState } from "./types";

export const initialState: GameState = {
  playerName: "",
  currentScene: "title_screen",
  runCount: 1,
  language: "ko",
  textSpeed: "normal",
  viewedScenes: [],
  viewedChoices: [],
  counters: {
    whisperCount: 0,
    avoidCount: 0,
    exploreCount: 0,
  },
  flags: {},
  endingsReached: [],
};

export function choiceKey(choice: Choice): string {
  return choice.next || choice.returnTo || "";
}

export function applyChoice(
  state: GameState,
  choice: Choice,
  nameInput: string,
): GameState {
  const next = choice.next || choice.returnTo;
  if (!next) return state;

  const newCounters = { ...state.counters };
  const newFlags = { ...state.flags };

  if (choice.effects) {
    for (const [k, v] of Object.entries(choice.effects)) {
      if (typeof v === "number" && k in newCounters) {
        newCounters[k as keyof typeof newCounters] += v;
      } else if (typeof v === "boolean") {
        newFlags[k] = v;
      }
    }
  }

  const key = choiceKey(choice);
  const newViewedChoices = key && !state.viewedChoices.includes(key)
    ? [...state.viewedChoices, key]
    : state.viewedChoices;

  return {
    ...state,
    playerName: choice.requiresInput ? nameInput : state.playerName,
    currentScene: next,
    counters: newCounters,
    flags: newFlags,
    viewedChoices: newViewedChoices,
  };
}

export function markSceneViewed(state: GameState, sceneId: string): GameState {
  if (state.viewedScenes.includes(sceneId)) return state;
  return {
    ...state,
    viewedScenes: [...state.viewedScenes, sceneId],
  };
}
