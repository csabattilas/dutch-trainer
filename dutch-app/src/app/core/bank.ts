import type { WritingTask } from './tutor-prompt';
import type { Exercise, ExerciseModule, Level } from './types';
import { pick, shuffle } from './util';

/** A hand-written multiple-choice item, for topics where the right answer depends on
 *  meaning (lekker/leuk/gezellig, weather, emotions) rather than a rule code can apply. */
export interface BankItem {
  prompt: string;
  answer: string;
  /** Must contain `answer` exactly once. Leave out options that would also be correct. */
  choices: string[];
  /** Short skill name inside the module, e.g. "lekker". */
  skill: string;
  explanation: string;
  hint?: string;
}

export interface BankDefinition {
  id: string;
  title: string;
  description: string;
  unit: string;
  level: Level;
  /** Shown as the first hint for every item. */
  ruleHint: string;
  writing?: WritingTask;
  items: BankItem[];
}

export function bankModule(def: BankDefinition): ExerciseModule & { items: BankItem[] } {
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    units: [def.unit],
    writing: def.writing,
    items: def.items,
    generate(rng, count) {
      const out: Exercise[] = [];
      for (let i = 0; i < count; i++) {
        const item = pick(rng, def.items);
        out.push({
          skill: `${def.id}/${item.skill}`,
          module: def.id,
          unit: def.unit,
          level: def.level,
          prompt: item.prompt,
          answer: item.answer,
          choices: shuffle(rng, item.choices),
          hints: item.hint ? [def.ruleHint, item.hint] : [def.ruleHint],
          explanation: item.explanation,
        });
      }
      return out;
    },
  };
}
