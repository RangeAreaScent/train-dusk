import type { EndingId } from "../engine/types";

/** Render a DOM node to a PNG file and trigger a browser download. */
export async function exportElementToPng(
  el: HTMLElement,
  filename: string,
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("toBlob returned null"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

const VALID_ENDINGS: EndingId[] = ["A", "B", "C", "D"];

export function buildEndingShareURL(ending: EndingId, run: number): string {
  if (typeof window === "undefined") return "";
  const u = new URL(window.location.href);
  u.searchParams.set("ending", ending);
  u.searchParams.set("run", String(run));
  return u.toString();
}

export function getEndingFromURL(): { ending: EndingId; run: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("ending");
    const r = parseInt(params.get("run") || "1", 10);
    if (e && (VALID_ENDINGS as readonly string[]).includes(e)) {
      return { ending: e as EndingId, run: Number.isFinite(r) && r > 0 ? r : 1 };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  // Legacy fallback
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function pushEndingURL(ending: EndingId, run: number): void {
  if (typeof window === "undefined") return;
  try {
    const u = buildEndingShareURL(ending, run);
    window.history.replaceState(null, "", u);
  } catch {
    // ignore
  }
}

export function clearURLParams(): void {
  if (typeof window === "undefined") return;
  try {
    const u = new URL(window.location.href);
    u.searchParams.delete("ending");
    u.searchParams.delete("run");
    window.history.replaceState(null, "", u.pathname + u.hash);
  } catch {
    // ignore
  }
}
