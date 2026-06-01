export type Lang = "ko" | "en";
export type TextSpeed = "slow" | "normal" | "fast";

export interface LocalizedText {
  ko: string;
  en: string;
}

export interface LocalizedLines {
  ko: string[];
  en: string[];
}

export type EndingId = "A" | "B" | "C" | "D";

export interface Choice {
  label: LocalizedText;
  next?: string;
  returnTo?: string;
  effects?: Record<string, number | boolean>;
  type?: "whisper" | "hidden";
  viewOnce?: boolean;
  condition?: string;
  requiresInput?: boolean;
  requiresAllViewed?: string[];
}

export interface ClueCheck {
  id: string;
  trigger: string;
  minRun: number;
}

export interface SceneVariant {
  append?: LocalizedLines;
  replace?: LocalizedLines;
}

export interface InputField {
  id: string;
  maxLength: number;
  placeholder: LocalizedText;
}

export interface Scene {
  id: string;
  visual?: string;
  popup?: string;
  popupPosition?: string;
  music?: string;
  car?: number;
  text: LocalizedLines;
  variants?: Record<string, SceneVariant>;
  clueChecks?: ClueCheck[];
  inputField?: InputField;
  choices?: Choice[];
  returnTo?: string;
  next?: string;
  trigger?: string;
  puzzleHook?: unknown;
  isCutscene?: boolean;
  isEndingCard?: boolean;
  endingId?: EndingId;
  cutsceneNote?: LocalizedText;
}

export interface MetaSave {
  runCount: number;
  endingsReached: EndingId[];
}

export interface EndingDef {
  id: EndingId;
  name: LocalizedText;
}

export interface GameState {
  playerName: string;
  currentScene: string;
  runCount: number;
  language: Lang;
  textSpeed: TextSpeed;
  viewedScenes: string[];
  viewedChoices: string[];
  counters: {
    whisperCount: number;
    avoidCount: number;
    exploreCount: number;
  };
  flags: Record<string, boolean>;
  endingsReached: EndingId[];
}
