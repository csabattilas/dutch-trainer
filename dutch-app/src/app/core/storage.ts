import type { Progress } from './srs';

const KEY = 'dutch-trainer/progress/v1';

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable (private mode / quota): progress just won't persist.
  }
}
