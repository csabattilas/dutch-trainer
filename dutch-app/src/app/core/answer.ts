import type { AutoAdvance } from './settings';
import type { Exercise } from './types';
import { normalise } from './util';

export function isCorrect(e: Exercise, given: string): boolean {
  return [e.answer, ...(e.accept ?? [])].map(normalise).includes(normalise(given));
}

export type Outcome = { kind: 'retry' } | { kind: 'final'; correct: boolean; secondTry: boolean };

/** A wrong first answer gets one retry when second chance is on, except for questions
 *  with only two options, where the retry would give the answer away. */
export function grade(
  e: Exercise,
  given: string,
  opts: { secondChance: boolean; retrying: boolean },
): Outcome {
  const correct = isCorrect(e, given);
  const retryAllowed = opts.secondChance && !opts.retrying && (!e.choices || e.choices.length > 2);
  if (!correct && retryAllowed) return { kind: 'retry' };
  return { kind: 'final', correct, secondTry: opts.retrying };
}

/** Milliseconds until moving on, or null to wait for the Next button.
 *  Wrong answers wait twice as long so the explanation can be read. */
export function autoAdvanceDelay(mode: AutoAdvance, correct: boolean, seconds: number): number | null {
  if (mode === 'off' || (mode === 'correct' && !correct)) return null;
  return (correct ? seconds : seconds * 2) * 1000;
}
