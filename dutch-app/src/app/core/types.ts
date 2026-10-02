import type { WritingTask } from './tutor-prompt';

export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface Exercise {
  /** Rule/skill this item practises. SRS state is tracked per skill, not per item,
   *  because items are generated and never repeat exactly. e.g. "demonstratives/het-far" */
  skill: string;
  module: string;
  unit: string;
  level: Level;
  prompt: string;
  /** Present => multiple choice. */
  choices?: string[];
  /** Present => build the answer by tapping these words in order (shuffled). */
  tiles?: string[];
  // Neither choices nor tiles => free text.
  /** Progressive hints, shown one at a time. First = the rule, later ones more specific.
   *  Must never contain the answer itself. */
  hints?: string[];
  /** Multiple-choice version of a tile/typed exercise, used when the learner picks
   *  "multiple choice" style. `choices` must contain `answer` exactly once. */
  asChoice?: { prompt: string; choices: string[] };
  answer: string;
  /** Other accepted answers (compared after normalisation). */
  accept?: string[];
  explanation: string;
}

export interface ExerciseModule {
  id: string;
  title: string;
  /** One line shown under the title on the home screen. */
  description: string;
  /** Free-writing task for the "Write" screen, checked by an AI tutor. */
  writing?: WritingTask;
  /** Course units this module covers (used for filtering "what we did this week"). */
  units: string[];
  /** Pure given rng: same rng sequence => same exercises. */
  generate(rng: Rng, count: number): Exercise[];
}

export type Rng = () => number;
