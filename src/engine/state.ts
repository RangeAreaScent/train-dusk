import cluesData from "../data/clues.json";
import connectionsData from "../data/connections.json";
import type {
  Choice,
  ConnectResult,
  EndingId,
  GameState,
  Lang,
  LocalizedText,
  MetaSave,
  Scene,
} from "./types";

const SAVE_KEY = "trainDusk_save";
const META_KEY = "trainDusk_meta";
const PREF_KEY = "trainDusk_pref";

export const initialState: GameState = {
  playerName: "",
  currentScene: "title_screen",
  runCount: 1,
  language: "ko",
  textSpeed: "normal",
  shellTheme: "black",
  paperTheme: "white",
  viewedScenes: [],
  viewedChoices: [],
  counters: {
    whisperCount: 0,
    avoidCount: 0,
    exploreCount: 0,
  },
  flags: {},
  endingsReached: [],
  clues: {},
  insights: {},
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

// ─── Clues / Insights ─────────────────────────────────────────────────────

interface ClueDef {
  id: string;
  name: LocalizedText;
  minRun: number;
}

interface InsightDef {
  id: string;
  tier: string;
  requires: string[];
  requiresType?: string;
  text: LocalizedText;
  minRun: number;
}

const cluesIndex: Record<string, ClueDef> = (() => {
  const raw = cluesData as unknown as Record<string, unknown>;
  const out: Record<string, ClueDef> = {};
  for (const [k, v] of Object.entries(raw)) {
    const def = v as Partial<ClueDef> & { id?: string; name?: LocalizedText };
    if (def && typeof def === "object" && def.id && def.name) {
      out[k] = {
        id: def.id,
        name: def.name,
        minRun: def.minRun ?? 1,
      };
    }
  }
  return out;
})();

const insightsIndex: Record<string, InsightDef> = (() => {
  const raw = (connectionsData as unknown as { insights?: Record<string, InsightDef> })
    .insights ?? {};
  return raw;
})();

const invalidPool: Record<Lang, string[]> = (() => {
  const raw = (connectionsData as unknown as { invalidMessages?: Record<Lang, string[]> })
    .invalidMessages;
  return {
    ko: raw?.ko ?? [],
    en: raw?.en ?? [],
  };
})();

export function getClueDef(id: string): ClueDef | null {
  return cluesIndex[id] ?? null;
}

export function getInsightDef(id: string): InsightDef | null {
  return insightsIndex[id] ?? null;
}

export function applyClueChecks(state: GameState, scene: Scene): GameState {
  if (!scene.clueChecks || scene.clueChecks.length === 0) return state;
  const newClues = { ...state.clues };
  let changed = false;
  for (const c of scene.clueChecks) {
    if (state.runCount >= c.minRun && !newClues[c.id]) {
      newClues[c.id] = true;
      changed = true;
    }
  }
  if (!changed) return state;
  return { ...state, clues: newClues };
}

export function collectedClueIds(state: GameState): string[] {
  return Object.keys(state.clues).filter((k) => state.clues[k]);
}

export function unlockedInsightIds(state: GameState): string[] {
  return Object.keys(state.insights).filter((k) => state.insights[k]);
}

export function tryConnect(
  state: GameState,
  aId: string,
  bId: string,
  lang: Lang,
): { newState: GameState; result: ConnectResult } {
  for (const [insightId, ins] of Object.entries(insightsIndex)) {
    if (ins.minRun > state.runCount) continue;
    if (state.insights[insightId]) continue;
    const req = ins.requires;
    if (req.length !== 2) continue;
    const matches =
      (req[0] === aId && req[1] === bId) || (req[0] === bId && req[1] === aId);
    if (!matches) continue;
    const newInsights = { ...state.insights, [insightId]: true };
    return {
      newState: { ...state, insights: newInsights },
      result: { kind: "valid", insightId, insightText: ins.text },
    };
  }
  const pool = invalidPool[lang] ?? [];
  const message = pool.length
    ? pool[Math.floor(Math.random() * pool.length)]
    : "...";
  return { newState: state, result: { kind: "invalid", message } };
}

// ─── Persistence ──────────────────────────────────────────────────────────

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota or serialization issues — silently drop
  }
}

export function loadState(): GameState | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // Merge with initialState so missing fields don't break newer engine logic.
    return { ...initialState, ...parsed } as GameState;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function hasSavedGame(_key: string = SAVE_KEY): boolean {
  const ls = safeLocalStorage();
  if (!ls) return false;
  try {
    return !!ls.getItem(_key);
  } catch {
    return false;
  }
}

export function loadMeta(): MetaSave {
  const ls = safeLocalStorage();
  const fallback: MetaSave = { runCount: 1, endingsReached: [] };
  if (!ls) return fallback;
  try {
    const raw = ls.getItem(META_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MetaSave>;
    return {
      runCount: parsed.runCount ?? 1,
      endingsReached: Array.isArray(parsed.endingsReached)
        ? (parsed.endingsReached as EndingId[])
        : [],
    };
  } catch {
    return fallback;
  }
}

export function recordEnding(endingId: EndingId): MetaSave {
  const meta = loadMeta();
  const updated: MetaSave = {
    runCount: meta.runCount + 1,
    endingsReached: Array.from(
      new Set<EndingId>([...meta.endingsReached, endingId]),
    ),
  };
  const ls = safeLocalStorage();
  if (ls) {
    try {
      ls.setItem(META_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function startFreshRun(prevMeta: MetaSave): GameState {
  return {
    ...initialState,
    ...loadPref(),
    runCount: prevMeta.runCount,
  };
}

// ─── Preferences (language + text speed; survive runs) ────────────────────

export interface Prefs {
  language: GameState["language"];
  textSpeed: GameState["textSpeed"];
  shellTheme: GameState["shellTheme"];
  paperTheme: GameState["paperTheme"];
}

export function loadPref(): Prefs {
  const ls = safeLocalStorage();
  const fallback: Prefs = {
    language: initialState.language,
    textSpeed: initialState.textSpeed,
    shellTheme: initialState.shellTheme,
    paperTheme: initialState.paperTheme,
  };
  if (!ls) return fallback;
  try {
    const raw = ls.getItem(PREF_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      language: p.language === "en" || p.language === "ko" ? p.language : fallback.language,
      textSpeed:
        p.textSpeed === "slow" || p.textSpeed === "normal" || p.textSpeed === "fast"
          ? p.textSpeed
          : fallback.textSpeed,
      shellTheme:
        p.shellTheme === "black" || p.shellTheme === "gray"
          ? p.shellTheme
          : fallback.shellTheme,
      paperTheme:
        p.paperTheme === "white" || p.paperTheme === "cream"
          ? p.paperTheme
          : fallback.paperTheme,
    };
  } catch {
    return fallback;
  }
}

export function savePref(p: Prefs): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(PREF_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function initStateFromPrefs(): GameState {
  return { ...initialState, ...loadPref() };
}
