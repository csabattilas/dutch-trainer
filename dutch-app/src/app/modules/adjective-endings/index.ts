import type { Exercise, ExerciseModule } from '../../core/types';
import { pick, shuffle } from '../../core/util';
import { adjectives, nouns } from '../../data/lexicon';

type Context = 'de-definite' | 'het-definite' | 'een-de' | 'een-het';

const CONTEXTS: Context[] = ['de-definite', 'het-definite', 'een-de', 'een-het'];

export const adjectiveEndings: ExerciseModule = {
  id: 'adjective-endings',
  title: 'Adjective endings (-e or not)',
  description: 'When an adjective takes -e before de- and het-words.',
  units: ['grammar-notes'],
  writing: {
    task: 'Describe two things with an adjective (e.g. een groot huis, de groene fiets).',
    focus: 'adjective endings: adjectives take -e, except with een (or no article) + a het-word',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const ctx = pick(rng, CONTEXTS);
      const noun = pick(
        rng,
        nouns.filter((n) => n.gender === (ctx === 'de-definite' || ctx === 'een-de' ? 'de' : 'het')),
      );
      const adj = pick(rng, adjectives);
      const article = ctx === 'de-definite' ? 'de' : ctx === 'het-definite' ? 'het' : 'een';
      // Only "een" + het-word drops the -e; everything else takes it.
      const takesE = ctx !== 'een-het';
      const answer = takesE ? adj.inflected : adj.base;
      out.push({
        skill: `adjective-endings/${ctx}`,
        module: 'adjective-endings',
        unit: 'grammar-notes',
        level: 'A1',
        prompt: `${article} ___ ${noun.nl}  (${adj.en} ${noun.en})`,
        hints: [
          'Adjectives take -e, except before a het-word with "een" (or with no article).',
          `${noun.nl} is a ${noun.gender}-word, and the article here is "${article}".`,
        ],
        choices: shuffle(rng, [adj.base, adj.inflected]),
        answer,
        explanation: takesE
          ? `${noun.gender === 'de' ? 'De-words' : 'With "het" + a het-word'} take -e: ${article} ${answer} ${noun.nl}.`
          : `A het-word with "een" (or no article) has no -e: een ${answer} ${noun.nl}.`,
      });
    }
    return out;
  },
};
