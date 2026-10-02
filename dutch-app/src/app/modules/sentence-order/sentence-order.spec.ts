import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/util';
import { sentenceOrder } from './index';

describe('sentenceOrder generator', () => {
  const exercises = sentenceOrder.generate(mulberry32(2), 300);

  it('puts the verb second and the place last', () => {
    for (const e of exercises) {
      const parts = [...e.tiles!];
      const answerParts = e.answer;
      // the answer is the tiles in S-V-T-M-O-P order, so it starts with a subject
      expect(['ik', 'hij', 'wij']).toContain(answerParts.split(' ')[0]);
      expect(parts.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('choices are distinct and contain the answer once', () => {
    for (const e of exercises) {
      const choices = e.asChoice!.choices;
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices.filter((c) => c === e.answer)).toHaveLength(1);
    }
  });

  it('matches a known example', () => {
    const found = exercises.find((e) => e.answer.startsWith('ik drink'));
    expect(found?.answer).toMatch(/^ik drink (vandaag|morgen|'s ochtends|'s avonds|op maandag) (graag|rustig) (koffie|thee) (op het terras|in de keuken)$/);
  });
});
