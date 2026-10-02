/** What the learner should write and which rule the tutor should focus on. */
export interface WritingTask {
  /** Shown to the learner, e.g. "Write a sentence that starts with vandaag or morgen." */
  task: string;
  /** Told to the AI tutor, e.g. "inversion: after a fronted time word the verb comes second". */
  focus: string;
}

/** Prompt for an AI tutor. Kept separate from the UI so a built-in AI integration
 *  can reuse it later instead of the open-in-a-new-tab links. */
export function tutorPrompt(sentence: string, t: WritingTask): string {
  return [
    "I'm learning Dutch (level A1–A2).",
    `I'm practising: ${t.focus}.`,
    `Task: ${t.task}`,
    `My answer: "${sentence.trim()}"`,
    '',
    'Please:',
    '1. Say whether it is correct.',
    '2. If not, give the corrected version.',
    '3. Explain each mistake in simple English and name the grammar rule.',
    '4. Keep it short.',
  ].join('\n');
}

/** Prefilled links. These query parameters are not official APIs and may change;
 *  "Copy prompt" is the fallback that always works. */
export function askUrls(prompt: string): { claude: string; google: string } {
  const q = encodeURIComponent(prompt);
  return {
    claude: `https://claude.ai/new?q=${q}`,
    google: `https://www.google.com/search?udm=50&q=${q}`,
  };
}
