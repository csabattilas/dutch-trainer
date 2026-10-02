import { describe, expect, it } from 'vitest';
import { review } from './srs';

describe('review', () => {
  it('advances the box on a correct answer', () => {
    const s = review({ box: 1, due: 0, seen: 1, correct: 1 }, true, { now: 0 });
    expect(s.box).toBe(2);
  });

  it('resets to box 0 on a wrong answer', () => {
    const s = review({ box: 3, due: 0, seen: 4, correct: 3 }, false, { now: 0 });
    expect(s.box).toBe(0);
  });

  it('keeps the box when a correct answer needed a hint, but still counts it', () => {
    const s = review({ box: 2, due: 0, seen: 2, correct: 2 }, true, { now: 0, hinted: true });
    expect(s.box).toBe(2);
    expect(s.correct).toBe(3);
    expect(s.seen).toBe(3);
  });

  it('a wrong answer with a hint still resets', () => {
    expect(review({ box: 2, due: 0, seen: 2, correct: 2 }, false, { now: 0, hinted: true }).box).toBe(0);
  });
});
