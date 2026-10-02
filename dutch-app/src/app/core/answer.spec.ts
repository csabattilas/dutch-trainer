import { describe, expect, it } from 'vitest';
import { autoAdvanceDelay, grade } from './answer';
import { DEFAULT_SETTINGS, parseSettings } from './settings';
import type { Exercise } from './types';

const base: Exercise = {
  skill: 's',
  module: 'm',
  unit: 'u',
  level: 'A1',
  prompt: 'p',
  answer: 'deze',
  explanation: 'e',
};
const fourChoices = { ...base, choices: ['deze', 'die', 'dit', 'dat'] };
const twoChoices = { ...base, choices: ['deze', 'die'] };

describe('grade', () => {
  it('gives a retry after a wrong first answer', () => {
    expect(grade(fourChoices, 'die', { secondChance: true, retrying: false })).toEqual({ kind: 'retry' });
  });

  it('is final on the second attempt, marked as second try', () => {
    expect(grade(fourChoices, 'deze', { secondChance: true, retrying: true })).toEqual({
      kind: 'final',
      correct: true,
      secondTry: true,
    });
    expect(grade(fourChoices, 'dat', { secondChance: true, retrying: true })).toMatchObject({ correct: false });
  });

  it('never retries two-option questions', () => {
    expect(grade(twoChoices, 'die', { secondChance: true, retrying: false })).toMatchObject({
      kind: 'final',
      correct: false,
    });
  });

  it('retries typed answers', () => {
    expect(grade(base, 'die', { secondChance: true, retrying: false })).toEqual({ kind: 'retry' });
  });

  it('no retry when second chance is off', () => {
    expect(grade(fourChoices, 'die', { secondChance: false, retrying: false })).toMatchObject({ kind: 'final' });
  });

  it('a correct first answer is final straight away', () => {
    expect(grade(fourChoices, ' Deze ', { secondChance: true, retrying: false })).toEqual({
      kind: 'final',
      correct: true,
      secondTry: false,
    });
  });
});

describe('isCorrect with tablet punctuation', () => {
  it("accepts a curly apostrophe for 's", () => {
    const e = { ...base, answer: "ik drink 's ochtends koffie" };
    expect(grade(e, 'Ik drink ’s ochtends koffie.', { secondChance: false, retrying: false })).toMatchObject({
      correct: true,
    });
  });
});

describe('autoAdvanceDelay', () => {
  it.each([
    ['off', true, null],
    ['off', false, null],
    ['correct', true, 2000],
    ['correct', false, null],
    ['always', true, 2000],
    ['always', false, 4000],
  ] as const)('%s, correct=%s -> %s', (mode, correct, expected) => {
    expect(autoAdvanceDelay(mode, correct, 2)).toBe(expected);
  });
});

describe('parseSettings', () => {
  it('falls back to defaults for missing or invalid values', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings({ autoAdvance: 'sometimes', size: 7, secondChance: 'yes' })).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid values', () => {
    expect(
      parseSettings({ autoAdvance: 'off', delaySeconds: 4, size: 50, style: 'mixed', secondChance: false, buildMode: 'tap' }),
    ).toEqual({
      autoAdvance: 'off',
      delaySeconds: 4,
      size: 50,
      style: 'mixed',
      secondChance: false,
      buildMode: 'tap',
    });
  });
});
