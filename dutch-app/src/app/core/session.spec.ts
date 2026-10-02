import { describe, expect, it } from 'vitest';
import { modules } from '../modules/registry';
import { buildSession } from './session';
import { mulberry32 } from './util';

describe('buildSession choiceOnly', () => {
  const session = buildSession(modules, {}, mulberry32(7), 30, { choiceOnly: true });

  it('returns only multiple-choice exercises', () => {
    expect(session.length).toBeGreaterThan(0);
    for (const e of session) {
      expect(e.choices).toBeDefined();
      expect(e.tiles).toBeUndefined();
    }
  });

  it('contains the answer exactly once among distinct choices', () => {
    for (const e of session) {
      expect(e.choices!.filter((c) => c === e.answer)).toHaveLength(1);
      expect(new Set(e.choices).size).toBe(e.choices!.length);
    }
  });

  it('includes the time and inversion modules, converted from typed/tile', () => {
    const s = buildSession(modules, {}, mulberry32(7), 30, { moduleIds: ['time', 'inversion'], choiceOnly: true });
    const mods = new Set(s.map((e) => e.module));
    expect(mods.has('time')).toBe(true);
    expect(mods.has('inversion')).toBe(true);
  });
});

describe('hints', () => {
  const all = buildSession(modules, {}, mulberry32(11), 200);

  it('every exercise has at least one hint', () => {
    for (const e of all) expect(e.hints?.length ?? 0).toBeGreaterThan(0);
  });

  // Single-word answers (deze, groene...) legitimately appear in rule hints that list
  // every option, so only multi-word answers (sentences, time phrases) are checked.
  it('no hint contains a full multi-word answer', () => {
    for (const e of all.filter((x) => x.answer.includes(' '))) {
      for (const h of e.hints!) expect(h.toLowerCase()).not.toContain(e.answer.toLowerCase());
    }
  });
});

describe('variety', () => {
  const inversionOnly = { moduleIds: ['inversion'], choiceOnly: true };

  it('has no repeated question when the module has enough unique ones', () => {
    const s = buildSession(modules, {}, mulberry32(21), 10, inversionOnly);
    const keys = s.map((e) => `${e.prompt}|${e.answer}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('mixes rules instead of grouping them: never 3 of the same rule in a row', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const skills = buildSession(modules, {}, mulberry32(seed), 10, inversionOnly).map((e) => e.skill);
      for (let i = 2; i < skills.length; i++) {
        expect(skills[i] === skills[i - 1] && skills[i] === skills[i - 2], `seed ${seed}: ${skills}`).toBe(false);
      }
    }
  });

  it('still includes a rule that is known and not due', () => {
    const now = 1_000_000;
    const progress = { 'inversion/other': { box: 3, due: now + 1e9, seen: 5, correct: 5 } };
    const s = buildSession(modules, progress, mulberry32(3), 10, inversionOnly, now);
    expect(s.some((e) => e.skill === 'inversion/other')).toBe(true);
  });

  it('puts new and due rules first', () => {
    const now = 1_000_000;
    const notDue = { box: 3, due: now + 1e9, seen: 5, correct: 5 };
    const progress = { 'inversion/time': notDue, 'inversion/place': notDue, 'inversion/jij-no-t': notDue };
    const s = buildSession(modules, progress, mulberry32(8), 10, inversionOnly, now);
    expect(s[0].skill).toBe('inversion/other');
  });
});

describe('session size', () => {
  it.each(modules.map((m) => m.id))('fills 50 multiple-choice questions for %s alone', (id) => {
    const s = buildSession(modules, {}, mulberry32(5), 50, { moduleIds: [id], choiceOnly: true });
    expect(s).toHaveLength(50);
  });
});

describe('buildSession mixed', () => {
  it('still produces typed and tile exercises when not choiceOnly', () => {
    const s = buildSession(modules, {}, mulberry32(7), 60);
    expect(s.some((e) => e.tiles)).toBe(true);
    expect(s.some((e) => !e.choices && !e.tiles)).toBe(true);
  });
});
