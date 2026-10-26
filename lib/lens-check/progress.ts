import type { Answers, MissingReasons, Question } from "@/lib/lens-check/types";

// Quiz progress saved in the browser, so people can pick up where they left
// off. Kept apart from LensCheckFlow so the homepage can check for it without
// loading the quiz.

const STORAGE_KEY = "lens-check-progress";

export type SavedProgress = { version: string; answers: Answers; missing: MissingReasons; qi: number; followups: Question[]; submissionId?: string; ageBand?: string; expiresAt?: number; reportingConsent?: boolean };

export function readSaved(version: string): SavedProgress | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as SavedProgress | null;
    if (saved && (!saved.expiresAt || saved.expiresAt <= Date.now())) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return saved && saved.version === version && typeof saved.qi === "number" && saved.answers ? saved : null;
  } catch {
    return null;
  }
}

export function writeSaved(saved: SavedProgress | null) {
  try {
    if (saved) localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable; progress just won't survive a refresh.
  }
}

export function hasSavedProgress(version: string) {
  const saved = readSaved(version);
  return Boolean(saved && Object.keys(saved.answers).length > 0);
}

// Links ending in this hash open the quiz straight away instead of the intro,
// for buttons that already describe it (the homepage hero). A hash rather
// than a query, so it never reaches analytics or makes a second page view.
export const BEGIN_HASH = "#begin";

export function lensCheckHref({ from, begin = false }: { from?: string; begin?: boolean } = {}) {
  return `/lens-check${from ? `?from=${encodeURIComponent(from)}` : ""}${begin ? BEGIN_HASH : ""}`;
}
