import scenesData from "../data/scenes.json";
import type { Choice, GameState, Lang, Scene } from "./types";
import { choiceKey } from "./state";

const scenes = scenesData as unknown as Record<string, Scene>;

export function getScene(id: string): Scene {
  const s = scenes[id];
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
  if (choice.condition === "hasSave") return false;
  if (choice.requiresAllViewed) {
    return choice.requiresAllViewed.every((id) =>
      state.viewedScenes.includes(id),
    );
  }
  return true;
}

export function isChoiceConsumed(choice: Choice, state: GameState): boolean {
  if (!choice.viewOnce) return false;
  const key = choiceKey(choice);
  return key ? state.viewedChoices.includes(key) : false;
}

const MAX_CHARS_PER_PAGE = 200;

export function paginate(lines: string[]): string[][] {
  const paragraphs: string[][] = [];
  let cur: string[] = [];
  for (const l of lines) {
    if (l === "") {
      if (cur.length) {
        paragraphs.push(cur);
        cur = [];
      }
    } else {
      cur.push(l);
    }
  }
  if (cur.length) paragraphs.push(cur);

  const pages: string[][] = [];
  let page: string[] = [];
  let pageChars = 0;

  for (const p of paragraphs) {
    const pChars = p.reduce((s, l) => s + l.length, 0);
    if (page.length > 0 && pageChars + pChars > MAX_CHARS_PER_PAGE) {
      pages.push(page);
      page = [];
      pageChars = 0;
    }
    if (page.length > 0) page.push("");
    page.push(...p);
    pageChars += pChars;
  }
  if (page.length) pages.push(page);
  return pages.length > 0 ? pages : [[]];
}
