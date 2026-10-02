/**
 * Data contract between the build tools (dutch/tools) and the app.
 * The tools write files in this shape to public/data/; the app only ever reads them.
 * The app owns this file; the tools import it as types only.
 * Bump `version` on any breaking change so stale files are detected.
 */

export interface LexiconFile {
  version: 1;
  /** ISO date the file was generated. */
  generatedAt: string;
  /** Source ids, matching CreditsFile entries. */
  sources: string[];
  nouns: NounEntry[];
  adjectives: AdjectiveEntry[];
  verbs: VerbEntry[];
}

export interface NounEntry {
  lemma: string;
  gender: 'de' | 'het';
  plural?: string;
  diminutive?: string;
  /** Short English meaning for tap-to-translate. */
  gloss: string;
  /** Frequency rank: 1 = most common. Lower = easier. */
  rank?: number;
  /** In the course word list (course-words.ts): exercises can prefer these. */
  course?: boolean;
}

export interface AdjectiveEntry {
  lemma: string;
  /** Form with -e, spelling changes included (groot -> grote). */
  inflected: string;
  gloss: string;
  rank?: number;
  course?: boolean;
}

export interface VerbEntry {
  /** Infinitive. */
  lemma: string;
  /** ik-form. */
  stem: string;
  /** hij/zij-form (and jij before the verb). */
  third: string;
  gloss: string;
  /** For separable verbs like opruimen: { particle: 'op', root: 'ruimen' }. */
  separable?: { particle: string; root: string };
  /** Simple past, main-clause form (separable verbs keep the particle: "ruimde op"). */
  past?: { singular: string; plural?: string };
  /** Past participle: gewerkt, opgeruimd. */
  participle?: string;
  rank?: number;
  course?: boolean;
}

export interface CreditsFile {
  version: 1;
  credits: { id: string; name: string; url: string; licence: string; attribution: string }[];
}
