import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/util';
import { verbs } from '../../data/lexicon';
import { inversion, invertedSentence, wrongOrderSentence } from './index';

const werken = verbs.find((v) => v.inf === 'werken')!;
const eten = verbs.find((v) => v.inf === 'eten')!;

describe('inversion sentences', () => {
  it.each([
    ['vandaag', 'ik', werken, 'vandaag werk ik hard'],
    ['vandaag', 'jij', werken, 'vandaag werk jij hard'], // -t drops
    ['morgen', 'hij', werken, 'morgen werkt hij hard'],
    ['soms', 'zij', eten, 'soms eet zij een boterham'],
    ['later', 'wij', werken, 'later werken wij hard'],
  ] as const)('%s + %s + %s', (adverb, p, verb, expected) => {
    expect(invertedSentence(adverb, p, verb)).toBe(expected);
  });

  it('builds the un-inverted (wrong) order for contrast', () => {
    expect(wrongOrderSentence('vandaag', 'jij', werken)).toBe('vandaag jij werkt hard');
  });
});

describe('inversion generator', () => {
  const exercises = inversion.generate(mulberry32(42), 200);

  it('always starts the answer with the fronted adverb and keeps the verb second', () => {
    for (const e of exercises) {
      const words = e.answer.split(' ');
      const subjects = ['ik', 'jij', 'hij', 'zij', 'wij'];
      expect(subjects).not.toContain(words[0]);
      expect(subjects).toContain(words[2]);
    }
  });

  it('tile exercises contain exactly the words of the answer', () => {
    const tiled = exercises.filter((e) => e.tiles);
    expect(tiled.length).toBeGreaterThan(0);
    for (const e of tiled) {
      expect([...e.tiles!].sort()).toEqual(e.answer.split(' ').sort());
    }
  });

  it('choice exercises include the answer exactly once', () => {
    for (const e of exercises.filter((x) => x.choices)) {
      expect(e.choices!.filter((c) => c === e.answer)).toHaveLength(1);
      expect(e.choices).toHaveLength(2);
    }
  });
});
