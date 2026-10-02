import { describe, expect, it } from 'vitest';
import { emotions } from '../modules/emotions';
import { lekkerLeukGezellig } from '../modules/lekker-leuk-gezellig';
import { weather } from '../modules/weather';

describe.each([weather, emotions, lekkerLeukGezellig])('bank $id', (bank) => {
  it('every item has distinct choices with the answer exactly once', () => {
    for (const item of bank.items) {
      expect(new Set(item.choices).size, item.prompt).toBe(item.choices.length);
      expect(item.choices.filter((c) => c === item.answer), item.prompt).toHaveLength(1);
    }
  });

  it('no hint gives away the answer', () => {
    for (const item of bank.items) {
      if (item.hint) expect(item.hint.toLowerCase()).not.toContain(item.answer.toLowerCase());
    }
  });
});
