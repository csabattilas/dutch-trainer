import type { Exercise, ExerciseModule, Rng } from './types';
import { urgency, type Progress } from './srs';
import { shuffle } from './util';

export interface SessionFilter {
  moduleIds?: string[];
  unit?: string;
  /** Only multiple choice: typed/tile exercises are converted via `asChoice`, or dropped if they have none. */
  choiceOnly?: boolean;
}

function toChoice(e: Exercise): Exercise[] {
  if (e.choices) return [e];
  if (!e.asChoice) return [];
  const { tiles: _tiles, ...rest } = e;
  return [{ ...rest, prompt: e.asChoice.prompt, choices: e.asChoice.choices }];
}

/** Same question = same prompt and same answer (choice order doesn't matter). */
const questionKey = (e: Exercise) => `${e.prompt}\u0000${e.answer}`;

/**
 * Builds a session that mixes rules instead of grouping them:
 * - rules are visited round-robin, most urgent first (new, then most overdue);
 * - rules that are new or due get two questions per round, the others one, so known
 *   rules still come back but less often;
 * - no question repeats within a session unless the module has run out of unique ones.
 */
export function buildSession(
  modules: ExerciseModule[],
  progress: Progress,
  rng: Rng,
  size: number,
  filter: SessionFilter = {},
  now = Date.now(),
): Exercise[] {
  const active = modules.filter(
    (m) =>
      (!filter.moduleIds || filter.moduleIds.includes(m.id)) &&
      (!filter.unit || m.units.includes(filter.unit)),
  );
  const pool = active.flatMap((m) => m.generate(rng, size * 3));
  const inUnit = filter.unit ? pool.filter((e) => e.unit === filter.unit) : pool;
  const candidates = shuffle(rng, filter.choiceOnly ? inUnit.flatMap(toChoice) : inUnit);

  // Split into unique questions per rule, and repeats kept as a last resort.
  const bySkill = new Map<string, Exercise[]>();
  const repeats: Exercise[] = [];
  const seen = new Set<string>();
  for (const e of candidates) {
    const key = questionKey(e);
    if (seen.has(key)) {
      repeats.push(e);
      continue;
    }
    seen.add(key);
    const list = bySkill.get(e.skill) ?? [];
    list.push(e);
    bySkill.set(e.skill, list);
  }

  // Most urgent rules first. Explicit comparison: -Infinity - -Infinity would be NaN.
  const skills = shuffle(rng, [...bySkill.keys()]).sort((a, b) => {
    const ua = urgency(progress[a], now);
    const ub = urgency(progress[b], now);
    return ua < ub ? -1 : ua > ub ? 1 : 0;
  });

  const out: Exercise[] = [];
  while (out.length < size && skills.some((s) => bySkill.get(s)!.length)) {
    for (const skill of skills) {
      const list = bySkill.get(skill)!;
      const turns = urgency(progress[skill], now) <= 0 ? 2 : 1;
      for (let t = 0; t < turns && list.length && out.length < size; t++) out.push(list.shift()!);
    }
  }
  // Small modules can run out of unique questions (e.g. 50 demonstratives): top up with repeats.
  for (const e of repeats) {
    if (out.length >= size) break;
    out.push(e);
  }
  return out;
}
