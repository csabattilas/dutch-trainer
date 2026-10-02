import type { Exercise, ExerciseModule } from '../../core/types';
import { pick, shuffle } from '../../core/util';

type Subject = 'ik' | 'hij' | 'wij';

interface Frame {
  forms: Record<Subject, string>;
  manners: string[];
  /** Empty for verbs without an object. */
  objects: string[];
  places: string[];
}

const TIMES = ['vandaag', 'morgen', "'s ochtends", "'s avonds", 'op maandag'];

const FRAMES: Frame[] = [
  { forms: { ik: 'drink', hij: 'drinkt', wij: 'drinken' }, manners: ['graag', 'rustig'], objects: ['koffie', 'thee'], places: ['op het terras', 'in de keuken'] },
  { forms: { ik: 'eet', hij: 'eet', wij: 'eten' }, manners: ['snel', 'graag'], objects: ['een boterham', 'een appel'], places: ['in de keuken', 'op kantoor'] },
  { forms: { ik: 'lees', hij: 'leest', wij: 'lezen' }, manners: ['graag', 'rustig'], objects: ['een boek', 'de krant'], places: ['in bed', 'op de bank'] },
  { forms: { ik: 'fiets', hij: 'fietst', wij: 'fietsen' }, manners: ['snel', 'rustig'], objects: [], places: ['naar het werk', 'naar school'] },
  { forms: { ik: 'werk', hij: 'werkt', wij: 'werken' }, manners: ['hard', 'graag'], objects: [], places: ['op kantoor', 'thuis'] },
];

const RULE = 'Course order: who – verb – when – how – what – where (S-V-T-M-O-P).';

export const sentenceOrder: ExerciseModule = {
  id: 'sentence-order',
  title: 'Sentence order (S-V-T-M-O-P)',
  description: 'Who – verb – when – how – what – where: Ik drink vandaag graag koffie op het terras.',
  units: ['zinsbouw'],
  writing: {
    task: 'Write a sentence with a time, a manner and a place (e.g. vandaag, graag, op kantoor).',
    focus: 'standard word order: subject – verb – time – manner – object – place',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const f = pick(rng, FRAMES);
      const subj = pick(rng, ['ik', 'hij', 'wij'] as Subject[]);
      const verb = f.forms[subj];
      const time = pick(rng, TIMES);
      const manner = pick(rng, f.manners);
      const object = f.objects.length ? pick(rng, f.objects) : '';
      const place = pick(rng, f.places);

      const parts = [subj, verb, time, manner, object, place].filter(Boolean);
      const answer = parts.join(' ');
      const choices = shuffle(rng, [
        answer,
        // verb at the end
        [subj, time, manner, object, place, verb].filter(Boolean).join(' '),
        // everything after the verb reversed: where – what – how – when
        [subj, verb, place, object, manner, time].filter(Boolean).join(' '),
      ]);

      out.push({
        skill: object ? 'sentence-order/with-object' : 'sentence-order/no-object',
        module: 'sentence-order',
        unit: 'zinsbouw',
        level: 'A1',
        prompt: 'Put the parts in the course order: who – verb – when – how – what – where.',
        answer,
        // Each part is one tile, so "op het terras" can't be split up.
        tiles: shuffle(rng, parts),
        asChoice: { prompt: 'Which sentence follows the standard order?', choices },
        hints: [RULE, 'The verb comes right after the subject, and the place goes last.'],
        explanation: `${RULE} When = ${time}, how = ${manner}${object ? `, what = ${object}` : ''}, where = ${place}.`,
      });
    }
    return out;
  },
};
