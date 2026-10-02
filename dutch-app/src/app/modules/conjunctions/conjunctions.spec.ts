import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/util';
import { conjunctions, connect, PAIRS } from './index';

const moe = PAIRS[0]; // ik blijf thuis / ik ben moe
const paraplu = PAIRS[3]; // separable verb in the main clause

describe('connect', () => {
  it('want keeps normal order', () => {
    const r = connect(moe, 'want');
    expect(`${r.lead} ${r.clause}`).toBe('ik blijf thuis, want ik ben moe');
  });

  it('omdat sends the verb to the end', () => {
    const r = connect(moe, 'omdat');
    expect(`${r.lead} ${r.clause}`).toBe('ik blijf thuis, omdat ik moe ben');
  });

  it('daarom inverts the main clause', () => {
    const r = connect(moe, 'daarom');
    expect(`${r.lead} ${r.clause}`).toBe('ik ben moe, daarom blijf ik thuis');
  });

  it('daarom keeps a separable particle at the end', () => {
    const r = connect(paraplu, 'daarom');
    expect(`${r.lead} ${r.clause}`).toBe('het regent hard, daarom neem ik een paraplu mee');
  });
});

describe('conjunctions generator', () => {
  const exercises = conjunctions.generate(mulberry32(9), 300);

  it('choices are distinct and contain the answer once', () => {
    for (const e of exercises) {
      const choices = e.choices ?? e.asChoice!.choices;
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices.filter((c) => c === e.answer)).toHaveLength(1);
    }
  });

  it('covers all three connectors', () => {
    const skills = new Set(exercises.map((e) => e.skill));
    expect(skills).toEqual(new Set(['conjunctions/want', 'conjunctions/omdat', 'conjunctions/daarom']));
  });
});
