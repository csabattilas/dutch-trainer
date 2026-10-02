import { describe, expect, it } from 'vitest';
import { modules } from '../modules/registry';
import { askUrls, tutorPrompt } from './tutor-prompt';

const task = { task: 'Start with vandaag.', focus: 'inversion: verb second' };

describe('tutorPrompt', () => {
  it('includes the trimmed sentence, the focus and the task', () => {
    const p = tutorPrompt('  vandaag ik werk  ', task);
    expect(p).toContain('"vandaag ik werk"');
    expect(p).toContain('inversion: verb second');
    expect(p).toContain('Start with vandaag.');
  });
});

describe('askUrls', () => {
  it('URL-encodes the prompt so quotes and newlines survive', () => {
    const urls = askUrls('a "b"\nc & d');
    expect(urls.claude).toBe('https://claude.ai/new?q=a%20%22b%22%0Ac%20%26%20d');
    expect(decodeURIComponent(urls.google.split('&q=')[1])).toBe('a "b"\nc & d');
  });
});

describe('modules', () => {
  it('every module has a writing task', () => {
    for (const m of modules) expect(m.writing, m.id).toBeDefined();
  });
});
