export type Lang = "ko" | "en";
export type TextSpeed = "slow" | "normal" | "fast";
export type ShellTheme = "black" | "gray";
export type PaperTheme = "white" | "cream";
export type SoundPref = "on" | "off";
export type MusicPref = "on" | "off";

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
  /** Choice only appears after this clue has been collected. */
  requiresClue?: string;
  /** Choice only appears after this insight has been unlocked. */
  requiresInsight?: string;
  /** Choice only appears after this flag has been set true. */
  requiresFlag?: string;
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
  overlay?: string;
  overlayLeft?: string;
  overlayRight?: string;
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
  /** Synthetic router scene — engine auto-evaluates branches and
   *  forwards before render. */
  isBranchCheck?: boolean;
  branches?: BranchRule[];
}

export interface BranchRule {
  condition: string;
  next: string;
}

export interface Choice {
  action?: string;
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
  shellTheme: ShellTheme;
  paperTheme: PaperTheme;
  sound: SoundPref;
  music: MusicPref;
  viewedScenes: string[];
  viewedChoices: string[];
  counters: {
    whisperCount: number;
    avoidCount: number;
    exploreCount: number;
  };
  flags: Record<string, boolean>;
  endingsReached: EndingId[];
  clues: Record<string, boolean>;
  insights: Record<string, boolean>;
  /** Scene to return to when leaving settings_menu. Title if absent. */
  previousScene?: string;
}

export interface ConnectResult {
  kind: "valid" | "invalid";
  insightId?: string;
  insightText?: LocalizedText;
  message?: string;
}
