import type { Exercise, ExerciseModule, Rng } from '../../core/types';
import { pick, shuffle } from '../../core/util';

const HOURS = ['twaalf', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];

function hourWord(h: number): string {
  return HOURS[((h % 12) + 12) % 12];
}

/** h in 1..12, m a multiple of 5. Returns the phrase after "het is". */
export function timeInDutch(h: number, m: number): { phrase: string; skill: string } {
  const next = hourWord(h + 1);
  const here = hourWord(h);
  switch (m) {
    case 0:
      return { phrase: `${here} uur`, skill: 'time/oclock' };
    case 5:
      return { phrase: `vijf over ${here}`, skill: 'time/over' };
    case 10:
      return { phrase: `tien over ${here}`, skill: 'time/over' };
    case 15:
      return { phrase: `kwart over ${here}`, skill: 'time/kwart' };
    case 20:
      return { phrase: `tien voor half ${next}`, skill: 'time/half' };
    case 25:
      return { phrase: `vijf voor half ${next}`, skill: 'time/half' };
    case 30:
      return { phrase: `half ${next}`, skill: 'time/half' };
    case 35:
      return { phrase: `vijf over half ${next}`, skill: 'time/half' };
    case 40:
      return { phrase: `tien over half ${next}`, skill: 'time/half' };
    case 45:
      return { phrase: `kwart voor ${next}`, skill: 'time/kwart' };
    case 50:
      return { phrase: `tien voor ${next}`, skill: 'time/voor' };
    case 55:
      return { phrase: `vijf voor ${next}`, skill: 'time/voor' };
    default:
      throw new Error(`minute must be a multiple of 5, got ${m}`);
  }
}

const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/** Answer plus two wrong options: the neighbouring hours (a classic half/kwart mix-up)
 *  and a random other minute. All choices are distinct. */
function timeChoices(rng: Rng, h: number, m: number): string[] {
  const right = timeInDutch(h, m).phrase;
  const wrong = new Set<string>();
  const candidates = shuffle(rng, [
    timeInDutch((h % 12) + 1, m).phrase,
    timeInDutch(((h + 10) % 12) + 1, m).phrase,
    timeInDutch(h, pick(rng, MINUTES)).phrase,
  ]);
  for (const c of candidates) {
    if (c !== right && wrong.size < 2) wrong.add(c);
  }
  return shuffle(rng, [right, ...wrong].map((p) => `het is ${p}`));
}

const RULE_HINT: Record<string, string> = {
  'time/oclock': 'On the hour you say the number followed by "uur".',
  'time/over': 'Up to 10 minutes past the hour, use "over": vijf over, tien over.',
  'time/kwart': 'kwart over = :15 and kwart voor = :45. After :45 you count to the NEXT hour.',
  'time/half': '"half" means 30 minutes before the NEXT hour, so :30 is "half" + the next hour.',
  'time/voor': 'After :45, count down to the next hour with "voor": vijf voor, tien voor.',
};

function timeHints(skill: string, h: number): string[] {
  return [
    RULE_HINT[skill],
    `This hour is "${hourWord(h)}" and the next hour is "${hourWord(h + 1)}".`,
  ];
}

export const time: ExerciseModule = {
  id: 'time',
  title: 'Telling time',
  description: 'Write clock times in Dutch: over, voor, kwart, half.',
  units: ['grammar-notes'],
  writing: {
    task: 'Write what time you get up and what time you go to bed.',
    focus: 'telling the time in Dutch (kwart over, half, kwart voor, vijf voor…) and time words like \'s ochtends',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const h = 1 + Math.floor(rng() * 12);
      const m = pick(rng, MINUTES);
      const { phrase, skill } = timeInDutch(h, m);
      const clock = `${h}:${String(m).padStart(2, '0')}`;
      out.push({
        skill,
        module: 'time',
        unit: 'grammar-notes',
        level: 'A1',
        prompt: `Write in Dutch: ${clock}`,
        answer: `het is ${phrase}`,
        accept: [phrase],
        hints: timeHints(skill, h),
        asChoice: { prompt: `Which is ${clock}?`, choices: timeChoices(rng, h, m) },
        explanation:
          skill === 'time/half' || skill === 'time/kwart' || skill === 'time/voor'
            ? `Dutch counts towards the next hour after :30 ("half ${hourWord(h + 1)}" = 30 minutes before ${hourWord(h + 1)}). Answer: het is ${phrase}.`
            : `Answer: het is ${phrase}.`,
      });
    }
    return out;
  },
};
