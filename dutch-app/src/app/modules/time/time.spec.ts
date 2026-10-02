import { describe, expect, it } from 'vitest';
import { timeInDutch } from './index';

describe('timeInDutch', () => {
  it.each([
    [8, 0, 'acht uur'],
    [9, 10, 'tien over negen'],
    [3, 15, 'kwart over drie'],
    [10, 30, 'half elf'],
    [11, 45, 'kwart voor twaalf'],
    [8, 55, 'vijf voor negen'],
    [12, 30, 'half een'],
    [11, 30, 'half twaalf'],
    [7, 20, 'tien voor half acht'],
    [7, 35, 'vijf over half acht'],
  ])('%i:%i -> het is %s', (h, m, expected) => {
    expect(timeInDutch(h, m).phrase).toBe(expected);
  });
});
