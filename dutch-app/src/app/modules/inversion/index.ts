import type { Exercise, ExerciseModule } from '../../core/types';
import { pick, shuffle } from '../../core/util';
import { verbs, type Verb } from '../../data/lexicon';

type Pronoun = 'ik' | 'jij' | 'hij' | 'zij' | 'wij';
type Category = 'time' | 'place' | 'other';

const PRONOUNS: Pronoun[] = ['ik', 'jij', 'hij', 'zij', 'wij'];

const ADVERBS: Record<Category, string[]> = {
  time: ['vandaag', 'morgen', 'soms', 'later'],
  place: ['hier', 'thuis', 'daar'],
  other: ['misschien', 'natuurlijk', 'daarom'],
};

/** Verb form after the subject, in normal order (subject first). */
function normalForm(verb: Verb, p: Pronoun): string {
  if (p === 'ik') return verb.stem;
  if (p === 'wij') return verb.inf;
  return verb.third;
}

/** Verb form when the verb comes first. Only jij changes: the -t drops. */
function invertedForm(verb: Verb, p: Pronoun): string {
  return p === 'jij' ? verb.stem : normalForm(verb, p);
}

export function invertedSentence(adverb: string, p: Pronoun, verb: Verb): string {
  return [adverb, invertedForm(verb, p), p, verb.rest].filter(Boolean).join(' ');
}

export function wrongOrderSentence(adverb: string, p: Pronoun, verb: Verb): string {
  return [adverb, p, normalForm(verb, p), verb.rest].filter(Boolean).join(' ');
}

export const inversion: ExerciseModule = {
  id: 'inversion',
  title: 'Inversion (verb second)',
  description: 'After time/place words the verb comes second: Vandaag werk ik.',
  units: ['grammar-notes'],
  writing: {
    task: 'Write a sentence that starts with a time or place word (vandaag, morgen, soms, thuis, hier…).',
    focus: 'inversion: when a sentence starts with a time or place word, the verb comes second, before the subject',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const category = pick(rng, ['time', 'place', 'other'] as Category[]);
      const adverb = pick(rng, ADVERBS[category]);
      const verb = pick(rng, category === 'place' ? verbs.filter((v) => v.placeSafe) : verbs);
      const p = pick(rng, PRONOUNS);
      const answer = invertedSentence(adverb, p, verb);
      const baseExplanation = `After "${adverb}" the verb must be second, so the subject moves behind it: ${answer}.`;
      const hints = [
        'The verb must be in second position: opening word, then the verb, then the subject.',
        `Subject: "${p}". Verb: ${verb.inf} (${verb.stem} / ${verb.third}).${p === 'jij' ? ' With jij after the verb, the -t drops.' : ''}`,
      ];

      // With jij, sometimes drill the dropped -t on its own. Skipped for verbs like eten
      // where stem and third person are identical (the two choices would be the same).
      if (p === 'jij' && verb.stem !== verb.third && rng() < 0.5) {
        const wrong = [adverb, verb.third, p, verb.rest].filter(Boolean).join(' ');
        out.push({
          skill: 'inversion/jij-no-t',
          module: 'inversion',
          unit: 'grammar-notes',
          level: 'A1',
          prompt: 'Which sentence is correct?',
          choices: shuffle(rng, [answer, wrong]),
          answer,
          hints: ['With jij, the -t of the verb drops when jij comes after the verb.', hints[1]],
          explanation: `${baseExplanation} With jij the -t drops when jij comes after the verb (jij ${verb.third} -> ${verb.stem} jij).`,
        });
      } else if (rng() < 0.5) {
        const wrong = wrongOrderSentence(adverb, p, verb);
        out.push({
          skill: `inversion/${category}`,
          module: 'inversion',
          unit: 'grammar-notes',
          level: 'A1',
          prompt: 'Which sentence is correct?',
          choices: shuffle(rng, [answer, wrong]),
          answer,
          hints,
          explanation: baseExplanation,
        });
      } else {
        out.push({
          skill: `inversion/${category}`,
          module: 'inversion',
          unit: 'grammar-notes',
          level: 'A1',
          prompt: `Build the sentence. Start with "${adverb}".`,
          tiles: shuffle(rng, answer.split(' ')),
          answer,
          asChoice: {
            prompt: `Which sentence is correct? It starts with "${adverb}".`,
            choices: shuffle(rng, [
              answer,
              wrongOrderSentence(adverb, p, verb),
              // verb at the end: also wrong in Dutch main clauses
              [adverb, p, verb.rest, invertedForm(verb, p)].filter(Boolean).join(' '),
            ]),
          },
          hints,
          explanation: baseExplanation,
        });
      }
    }
    return out;
  },
};
