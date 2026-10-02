import type { Exercise, ExerciseModule } from '../../core/types';
import { pick, shuffle } from '../../core/util';

type Pronoun = 'ik' | 'jij' | 'hij' | 'wij';

interface SeparableVerb {
  inf: string;
  particle: string;
  /** Root forms: ik (stem), hij/jij-after-subject (third), wij (plural). */
  stem: string;
  third: string;
  plural: string;
  /** What goes between subject and particle. */
  middle: string;
  /** Fronted phrases that make sense with this verb (on top of the days of the week). */
  fronts: string[];
}

const DAYS = ['op maandag', 'op dinsdag', 'op woensdag', 'op donderdag', 'op vrijdag', 'op zaterdag', 'op zondag'];

// Taken from the course's "my week" text, plus opstaan/afwassen as everyday extras.
const VERBS: SeparableVerb[] = [
  { inf: 'opruimen', particle: 'op', stem: 'ruim', third: 'ruimt', plural: 'ruimen', middle: 'de keuken', fronts: ['na het werk'] },
  { inf: 'schoonmaken', particle: 'schoon', stem: 'maak', third: 'maakt', plural: 'maken', middle: 'de badkamer', fronts: ['na het ontbijt'] },
  { inf: 'uitslapen', particle: 'uit', stem: 'slaap', third: 'slaapt', plural: 'slapen', middle: 'lekker lang', fronts: ['in het weekend'] },
  { inf: 'uitrusten', particle: 'uit', stem: 'rust', third: 'rust', plural: 'rusten', middle: 'de hele dag', fronts: ['in het weekend'] },
  { inf: 'uitgaan', particle: 'uit', stem: 'ga', third: 'gaat', plural: 'gaan', middle: 'met vrienden', fronts: ['in het weekend'] },
  { inf: 'opstaan', particle: 'op', stem: 'sta', third: 'staat', plural: 'staan', middle: 'vroeg', fronts: ['om zeven uur'] },
  { inf: 'afwassen', particle: 'af', stem: 'was', third: 'wast', plural: 'wassen', middle: 'de pannen', fronts: ['na het eten'] },
];

const PRONOUNS: Pronoun[] = ['ik', 'jij', 'hij', 'wij'];

function normalForm(v: SeparableVerb, p: Pronoun): string {
  if (p === 'ik') return v.stem;
  if (p === 'wij') return v.plural;
  return v.third;
}

/** Verb before the subject: only jij changes (the -t drops). */
function invertedForm(v: SeparableVerb, p: Pronoun): string {
  return p === 'jij' ? v.stem : normalForm(v, p);
}

/** front + verb + subject + middle + particle: "op vrijdag ruim ik de keuken op" */
export function separableSentence(front: string, p: Pronoun, v: SeparableVerb): string {
  return `${front} ${invertedForm(v, p)} ${p} ${v.middle} ${v.particle}`;
}

/** Typical learner mistakes, all wrong in a Dutch main clause. */
function distractors(front: string, p: Pronoun, v: SeparableVerb): string[] {
  const finite = invertedForm(v, p);
  return [
    // no inversion
    `${front} ${p} ${normalForm(v, p)} ${v.middle} ${v.particle}`,
    // particle not split off
    `${front} ${v.particle}${finite} ${p} ${v.middle}`,
    // whole verb at the end, like a subordinate clause
    `${front} ${p} ${v.middle} ${v.particle}${normalForm(v, p)}`,
  ];
}

export function findVerb(inf: string): SeparableVerb {
  const v = VERBS.find((x) => x.inf === inf);
  if (!v) throw new Error(`unknown separable verb ${inf}`);
  return v;
}

export const separableVerbs: ExerciseModule = {
  id: 'separable-verbs',
  title: 'Separable verbs + inversion',
  description: 'Harder: Op vrijdag ruim ik de keuken op. Verb second, particle at the end.',
  units: ['mijn-week'],
  writing: {
    task: 'Write about your week, starting with a day, using a separable verb (opruimen, uitslapen, opstaan…).',
    focus: 'separable verbs with inversion: the verb part goes second, the particle goes to the end',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const v = pick(rng, VERBS);
      const front = pick(rng, [...DAYS, ...v.fronts]);
      const p = pick(rng, PRONOUNS);
      const answer = separableSentence(front, p, v);
      const choices = shuffle(rng, [answer, ...distractors(front, p, v)]);
      const base = {
        skill: `separable-verbs/${p === 'jij' ? 'jij' : 'main'}`,
        module: 'separable-verbs',
        unit: 'mijn-week',
        level: 'A2' as const,
        answer,
        hints: [
          'Separable verb: the verb part goes second (after the opening phrase), the particle goes to the very end.',
          `${v.inf} = ${v.particle} + ${v.plural}.${p === 'jij' ? ' With jij after the verb, the -t drops.' : ''}`,
        ],
        explanation: `${v.inf} splits: "${invertedForm(v, p)}" goes second, right after "${front}", and "${v.particle}" goes to the end: ${answer}.`,
      };

      if (rng() < 0.5) {
        out.push({ ...base, prompt: 'Which sentence is correct?', choices });
      } else {
        out.push({
          ...base,
          prompt: `Build the sentence (${v.inf}). Start with "${front}".`,
          // The opening phrase is one tile so the start is unambiguous.
          tiles: shuffle(rng, [front, invertedForm(v, p), p, ...v.middle.split(' '), v.particle]),
          asChoice: { prompt: `Which sentence is correct? (${v.inf})`, choices },
        });
      }
    }
    return out;
  },
};
