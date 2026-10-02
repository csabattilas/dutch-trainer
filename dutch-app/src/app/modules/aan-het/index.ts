import type { Exercise, ExerciseModule } from '../../core/types';
import { pick, shuffle } from '../../core/util';

type Pronoun = 'ik' | 'jij' | 'hij' | 'wij';

const ZIJN: Record<Pronoun, string> = { ik: 'ben', jij: 'bent', hij: 'is', wij: 'zijn' };
const HEBBEN: Record<Pronoun, string> = { ik: 'heb', jij: 'hebt', hij: 'heeft', wij: 'hebben' };
const EN: Record<Pronoun, string> = { ik: 'I am', jij: 'you are', hij: 'he is', wij: 'we are' };

interface Activity {
  inf: string;
  stem: string;
  en: string;
  place: string;
}

const ACTIVITIES: Activity[] = [
  { inf: 'koken', stem: 'kook', en: 'cooking', place: 'in de keuken' },
  { inf: 'werken', stem: 'werk', en: 'working', place: 'op kantoor' },
  { inf: 'lezen', stem: 'lees', en: 'reading', place: 'in de tuin' },
  { inf: 'slapen', stem: 'slaap', en: 'sleeping', place: 'in bed' },
  { inf: 'sporten', stem: 'sport', en: 'working out', place: 'in de sportschool' },
  { inf: 'afwassen', stem: 'afwas', en: 'doing the dishes', place: 'in de keuken' },
  { inf: 'eten', stem: 'eet', en: 'eating', place: 'aan tafel' },
  { inf: 'fietsen', stem: 'fiets', en: 'cycling', place: 'in het park' },
];

/** Verbs that can't take "aan het": zijn, hebben, gaan, modals and state verbs. */
const NOT_ALLOWED: { good: string; bad: string; why: string }[] = [
  { good: 'ik heb een auto', bad: 'ik ben een auto aan het hebben', why: '"hebben" never takes aan het.' },
  { good: 'ik ben moe', bad: 'ik ben moe aan het zijn', why: '"zijn" never takes aan het.' },
  { good: 'ik ga naar huis', bad: 'ik ben naar huis aan het gaan', why: '"gaan" never takes aan het.' },
  { good: 'ik wil koffie', bad: 'ik ben koffie aan het willen', why: 'Modal verbs (willen, kunnen, moeten) never take aan het.' },
  { good: 'ik weet het antwoord', bad: 'ik ben het antwoord aan het weten', why: '"weten" is a state, not an action.' },
  { good: 'ik ken hem goed', bad: 'ik ben hem goed aan het kennen', why: '"kennen" is a state, not an action.' },
];

const RULE = 'Formula: subject + zijn + (place) + aan het + infinitive. Only for actions happening right now.';

export function aanHetSentence(p: Pronoun, a: Activity, withPlace: boolean): string {
  return [p, ZIJN[p], withPlace ? a.place : '', 'aan het', a.inf].filter(Boolean).join(' ');
}

export const aanHet: ExerciseModule = {
  id: 'aan-het',
  title: 'Present continuous (aan het)',
  description: 'Ik ben in de keuken aan het koken, and the verbs that never take aan het.',
  units: ['grammar-notes'],
  writing: {
    task: 'Write what you, or someone at home, is doing right now.',
    focus: 'present continuous: subject + zijn + (place) + aan het + infinitive; not with zijn, hebben, gaan, modals or state verbs',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const kind = rng();
      const p = pick(rng, ['ik', 'jij', 'hij', 'wij'] as Pronoun[]);
      const a = pick(rng, ACTIVITIES);

      if (kind < 0.25) {
        const item = pick(rng, NOT_ALLOWED);
        out.push({
          skill: 'aan-het/not-allowed',
          module: 'aan-het',
          unit: 'grammar-notes',
          level: 'A1',
          prompt: 'Which sentence is correct?',
          answer: item.good,
          choices: shuffle(rng, [item.good, item.bad]),
          hints: ['aan het can\'t be used with zijn, hebben, gaan, modal verbs or state verbs (weten, kennen).'],
          explanation: item.why,
        });
      } else if (kind < 0.65) {
        const answer = aanHetSentence(p, a, true);
        out.push({
          skill: 'aan-het/form',
          module: 'aan-het',
          unit: 'grammar-notes',
          level: 'A1',
          prompt: `Which sentence is correct? (${EN[p]} ${a.en})`,
          answer,
          choices: shuffle(rng, [
            answer,
            `${p} ${HEBBEN[p]} ${a.place} aan het ${a.inf}`,
            `${p} ${ZIJN[p]} ${a.place} aan het ${a.stem}`,
            `${p} ${ZIJN[p]} ${a.place} aan ${a.inf}`,
          ]),
          hints: [RULE, `The form of zijn for "${p}" is "${ZIJN[p]}".`],
          explanation: `${RULE} So: ${answer}.`,
        });
      } else {
        // No place in the tile version: with a place, "aan het koken in de keuken" is also fine Dutch,
        // so the answer wouldn't be unique.
        const answer = aanHetSentence(p, a, false);
        out.push({
          skill: 'aan-het/form',
          module: 'aan-het',
          unit: 'grammar-notes',
          level: 'A1',
          prompt: `Build: "${EN[p]} ${a.en}"`,
          answer,
          tiles: shuffle(rng, [p, ZIJN[p], 'aan het', a.inf]),
          asChoice: {
            prompt: `"${EN[p]} ${a.en}"`,
            choices: shuffle(rng, [
              answer,
              `${p} ${HEBBEN[p]} aan het ${a.inf}`,
              `${p} ${ZIJN[p]} aan het ${a.stem}`,
            ]),
          },
          hints: [RULE, `The form of zijn for "${p}" is "${ZIJN[p]}".`],
          explanation: `${RULE} So: ${answer}.`,
        });
      }
    }
    return out;
  },
};

export { ACTIVITIES };
