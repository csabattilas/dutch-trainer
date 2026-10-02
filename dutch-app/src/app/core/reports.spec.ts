import { describe, expect, it } from 'vitest';
import { flag, reportsToText } from './reports';
import type { Exercise } from './types';

const exercise: Exercise = {
  skill: 'inversion/time',
  module: 'inversion',
  unit: 'grammar-notes',
  level: 'A1',
  prompt: 'Which sentence is correct?',
  choices: ['morgen woont zij in Utrecht', 'morgen zij woont in Utrecht'],
  answer: 'morgen woont zij in Utrecht',
  explanation: 'Verb second.',
};

describe('flag', () => {
  it('keeps the question, the given answer and a trimmed note', () => {
    const r = flag(exercise, 'morgen zij woont in Utrecht', '  sounds odd  ');
    expect(r).toMatchObject({
      module: 'inversion',
      skill: 'inversion/time',
      answer: 'morgen woont zij in Utrecht',
      given: 'morgen zij woont in Utrecht',
      note: 'sounds odd',
    });
  });

  it('leaves out an empty answer and note', () => {
    const r = flag(exercise, '', '   ');
    expect(r.given).toBeUndefined();
    expect(r.note).toBeUndefined();
  });
});

describe('reportsToText', () => {
  it('lists every report with question, answers and note', () => {
    const text = reportsToText([flag(exercise, 'x', 'sounds odd')]);
    expect(text).toContain('1 reported question(s)');
    expect(text).toContain('Question: Which sentence is correct?');
    expect(text).toContain("App's answer: morgen woont zij in Utrecht");
    expect(text).toContain('My answer: x');
    expect(text).toContain('My note: sounds odd');
  });
});
