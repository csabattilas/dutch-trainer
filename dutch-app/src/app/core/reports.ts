import type { Exercise } from './types';

/** A question the learner flagged as possibly wrong, kept on this device until exported. */
export interface FlaggedQuestion {
  /** ISO timestamp. */
  at: string;
  module: string;
  skill: string;
  prompt: string;
  choices?: string[];
  tiles?: string[];
  answer: string;
  explanation: string;
  /** What the learner answered, if they had answered. */
  given?: string;
  note?: string;
}

const KEY = 'dutch-trainer/reports/v1';

export function flag(e: Exercise, given: string | undefined, note: string): FlaggedQuestion {
  return {
    at: new Date().toISOString(),
    module: e.module,
    skill: e.skill,
    prompt: e.prompt,
    choices: e.choices,
    tiles: e.tiles,
    answer: e.answer,
    explanation: e.explanation,
    given: given || undefined,
    note: note.trim() || undefined,
  };
}

export function loadReports(): FlaggedQuestion[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FlaggedQuestion[]) : [];
  } catch {
    return [];
  }
}

export function saveReports(reports: FlaggedQuestion[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(reports));
  } catch {
    // Storage unavailable: reports only live until the page is closed.
  }
}

/** Readable text to paste into a chat or an issue. */
export function reportsToText(reports: FlaggedQuestion[]): string {
  const items = reports.map((r, i) =>
    [
      `### ${i + 1}. ${r.module} (${r.skill})`,
      `- Question: ${r.prompt}`,
      r.choices ? `- Choices: ${r.choices.join(' | ')}` : null,
      r.tiles ? `- Words: ${r.tiles.join(' | ')}` : null,
      `- App's answer: ${r.answer}`,
      r.given ? `- My answer: ${r.given}` : null,
      `- App's explanation: ${r.explanation}`,
      r.note ? `- **My note: ${r.note}**` : null,
      `- Reported: ${r.at.slice(0, 16).replace('T', ' ')}`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
  return [`# Dutch Trainer: ${reports.length} reported question(s)`, '', ...items.flatMap((x) => [x, ''])].join('\n');
}
