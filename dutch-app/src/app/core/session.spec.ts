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
    const mods = new Set(session.map((e) => e.module));
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
