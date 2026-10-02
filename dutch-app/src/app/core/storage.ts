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

const NOTICE_KEY = 'dutch-trainer/privacy-notice-dismissed/v1';

/** Whether the one-time privacy notice was dismissed. Defaults to "not dismissed". */
export function loadNoticeDismissed(): boolean {
  try {
    return localStorage.getItem(NOTICE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveNoticeDismissed(): void {
  try {
    localStorage.setItem(NOTICE_KEY, '1');
  } catch {
    // Storage unavailable: the notice will just show again next time.
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable (private mode / quota): progress just won't persist.
  }
}
