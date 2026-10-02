import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/util';
import { aanHet, aanHetSentence, ACTIVITIES } from './index';

const koken = ACTIVITIES[0];

describe('aanHetSentence', () => {
  it('follows subject + zijn + place + aan het + infinitive', () => {
    expect(aanHetSentence('ik', koken, true)).toBe('ik ben in de keuken aan het koken');
    expect(aanHetSentence('hij', koken, false)).toBe('hij is aan het koken');
    expect(aanHetSentence('jij', koken, false)).toBe('jij bent aan het koken');
  });
});

describe('aanHet generator', () => {
  const exercises = aanHet.generate(mulberry32(4), 300);

  it('choices are distinct and contain the answer once', () => {
    for (const e of exercises) {
      const choices = e.choices ?? e.asChoice!.choices;
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices.filter((c) => c === e.answer)).toHaveLength(1);
    }
  });

  it('tile answers are rebuilt from the tiles', () => {
    for (const e of exercises.filter((x) => x.tiles)) {
      expect(e.tiles!.join(' ').split(' ').sort()).toEqual(e.answer.split(' ').sort());
    }
  });
});
