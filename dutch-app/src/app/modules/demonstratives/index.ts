import type { Exercise, ExerciseModule } from '../../core/types';
import { pick, shuffle } from '../../core/util';
import { nouns } from '../../data/lexicon';

const CHOICES = ['deze', 'die', 'dit', 'dat'];

export const demonstratives: ExerciseModule = {
  id: 'demonstratives',
  title: 'Demonstratives (deze/die, dit/dat)',
  description: 'Pick this/that for de- and het-words.',
  units: ['grammar-notes'],
  writing: {
    task: 'Write two sentences about things around you, using deze, die, dit or dat.',
    focus: 'demonstratives: deze/die with de-words, dit/dat with het-words (near/far)',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const noun = pick(rng, nouns);
      const near = rng() < 0.5;
      const answer = noun.gender === 'de' ? (near ? 'deze' : 'die') : near ? 'dit' : 'dat';
      out.push({
        skill: `demonstratives/${noun.gender}-${near ? 'near' : 'far'}`,
        module: 'demonstratives',
        unit: 'grammar-notes',
        level: 'A1',
        prompt: `___ ${noun.nl}  (${near ? 'this' : 'that'} ${noun.en})`,
        hints: [
          'Near = deze/dit, far = die/dat. De-words take deze/die; het-words take dit/dat.',
          `${noun.nl} is a ${noun.gender}-word.`,
        ],
        choices: shuffle(rng, CHOICES),
        answer,
        explanation: `${noun.nl} is a ${noun.gender}-word, so ${near ? 'near' : 'far'} = ${answer}.`,
      });
    }
    return out;
  },
};
