/** Minimal Leitner scheme, tracked per skill. */
export interface SkillState {
  box: number; // 0..MAX_BOX
  due: number; // epoch ms
  seen: number;
  correct: number;
}

export type Progress = Record<string, SkillState>;

const DAY = 24 * 60 * 60 * 1000;
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
const MAX_BOX = INTERVAL_DAYS.length - 1;

export function review(
  state: SkillState | undefined,
  correct: boolean,
  opts: { now?: number; hinted?: boolean } = {},
): SkillState {
  const now = opts.now ?? Date.now();
  const prev = state ?? { box: 0, due: now, seen: 0, correct: 0 };
  // A correct answer that needed a hint keeps its box: right, but not known cold.
  const box = !correct ? 0 : opts.hinted ? prev.box : Math.min(prev.box + 1, MAX_BOX);
  return {
    box,
    due: now + INTERVAL_DAYS[box] * DAY,
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
  };
}

/** Lower = more urgent. Unseen skills come first, then overdue ones, most overdue first. */
export function urgency(state: SkillState | undefined, now = Date.now()): number {
  if (!state) return -Infinity;
  return state.due - now;
}
