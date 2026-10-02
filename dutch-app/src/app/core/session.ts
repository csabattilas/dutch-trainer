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

/** Generate a pool, then take the items whose skills are most due. */
export function buildSession(
  modules: ExerciseModule[],
  progress: Progress,
  rng: Rng,
  size: number,
  filter: SessionFilter = {},
): Exercise[] {
  const active = modules.filter(
    (m) =>
      (!filter.moduleIds || filter.moduleIds.includes(m.id)) &&
      (!filter.unit || m.units.includes(filter.unit)),
  );
  const pool = active.flatMap((m) => m.generate(rng, size * 3));
  const inUnit = filter.unit ? pool.filter((e) => e.unit === filter.unit) : pool;
  const filtered = filter.choiceOnly ? inUnit.flatMap(toChoice) : inUnit;
  // Shuffle first so ties in urgency are broken randomly, then stable-sort by urgency.
  const ranked = shuffle(rng, filtered).sort(
    (a, b) => urgency(progress[a.skill]) - urgency(progress[b.skill]),
  );
  return ranked.slice(0, size);
}
