import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/util';
import { findVerb, separableSentence, separableVerbs } from './index';

describe('separableSentence', () => {
  it.each([
    ['op vrijdag', 'ik', 'opruimen', 'op vrijdag ruim ik de keuken op'],
    ['op zaterdag', 'ik', 'uitslapen', 'op zaterdag slaap ik lekker lang uit'],
    ['op zondag', 'hij', 'uitrusten', 'op zondag rust hij de hele dag uit'],
    ['in het weekend', 'jij', 'uitgaan', 'in het weekend ga jij met vrienden uit'], // -t drops
    ['om zeven uur', 'wij', 'opstaan', 'om zeven uur staan wij vroeg op'],
    ['na het ontbijt', 'hij', 'schoonmaken', 'na het ontbijt maakt hij de badkamer schoon'],
  ] as const)('%s + %s + %s', (front, p, inf, expected) => {
    expect(separableSentence(front, p, findVerb(inf))).toBe(expected);
  });
});

describe('separableVerbs generator', () => {
  const exercises = separableVerbs.generate(mulberry32(3), 300);

  it('choices are distinct and contain the answer once', () => {
    for (const e of exercises) {
      const choices = e.choices ?? e.asChoice!.choices;
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices.filter((c) => c === e.answer)).toHaveLength(1);
    }
  });

  it('tiles join back into exactly the answer words', () => {
    const tiled = exercises.filter((e) => e.tiles);
    expect(tiled.length).toBeGreaterThan(0);
    for (const e of tiled) {
      const words = e.tiles!.join(' ').split(' ').sort();
      expect(words).toEqual(e.answer.split(' ').sort());
    }
  });

  it('every answer ends with the particle', () => {
    for (const e of exercises) {
      expect(['op', 'uit', 'schoon', 'af']).toContain(e.answer.split(' ').at(-1));
    }
  });
});
