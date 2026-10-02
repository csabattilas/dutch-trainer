import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

/** Lowercase words, keeping apostrophes and hyphens inside words ("zo'n", "e-mail"). */
export function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .split(/[^\p{L}'-]+/u)
    .map((t) => t.replace(/^['-]+|['-]+$/g, ''))
    .filter(Boolean);
}

export interface Candidate {
  key: string;
  /** Lowercase surface forms that count as evidence for this word. */
  forms: string[];
  /** Function words (pronouns, prepositions, adverbs…): they own their form outright. */
  strong?: boolean;
  /** Dictionary form. A word keeps at least LEMMA_SHARE of its own headword's count. */
  lemma?: string;
}

/** "werk" is the noun's headword but only an inflected form of werken: the noun must not lose it all. */
const LEMMA_SHARE = 0.25;

/**
 * Splits each form's count between all candidates that share it, in proportion to each
 * candidate's independent evidence: counts of forms only it has (strong candidates use
 * their full count). "niet" goes to the adverb, not the noun "niet" (staple); "weet" goes
 * to weten (which also has wist, wisten…), not the noun "weet"; "huis" stays with the noun.
 * One round only: repeating it feeds a word's share back into itself and lets it grow.
 * When neither word has evidence of its own (bang/bange), it can't decide: the build has
 * explicit rules for those cases.
 */
export function allocateScores(counts: Map<string, number>, candidates: Candidate[]): Map<string, number> {
  const owners = new Map<string, Candidate[]>();
  for (const c of candidates) {
    for (const f of new Set(c.forms)) {
      const list = owners.get(f) ?? [];
      list.push(c);
      owners.set(f, list);
    }
  }

  const evidence = new Map<Candidate, number>();
  for (const c of candidates) {
    let ev = 0;
    for (const f of new Set(c.forms)) {
      if (c.strong || owners.get(f)!.length === 1) ev += counts.get(f) ?? 0;
    }
    evidence.set(c, ev);
  }

  // Small smoothing so candidates with no evidence at all still split evenly between themselves.
  const SMOOTH = 0.1;
  // The headword floor only applies when the other words merely inflect into this form
  // (werk for werken), not when it's their headword too (waar, goed).
  const lemmaOwners = (f: string) => owners.get(f)!.filter((o) => o.lemma === f).length;
  const weight = (c: Candidate, f: string) =>
    (f === c.lemma && lemmaOwners(f) === 1
      ? Math.max(evidence.get(c)!, LEMMA_SHARE * (counts.get(f) ?? 0))
      : evidence.get(c)!) + SMOOTH;

  const scores = new Map<string, number>();
  for (const c of candidates) {
    let score = 0;
    for (const f of new Set(c.forms)) {
      const total = owners.get(f)!.reduce((n, o) => n + weight(o, f), 0);
      score += ((counts.get(f) ?? 0) * weight(c, f)) / total;
    }
    scores.set(c.key, (scores.get(c.key) ?? 0) + score);
  }
  return scores;
}

/** Word counts over the Dutch side of the ManyThings/Tatoeba file
 *  (tab-separated: English, Dutch, attribution). Used as a frequency measure:
 *  common words in everyday sentences are mostly the easy ones. */
export async function countDutchWords(path: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const rl = createInterface({ input: createReadStream(path, 'utf8'), crlfDelay: Infinity });
  for await (const line of rl) {
    const dutch = line.split('\t')[1];
    if (!dutch) continue;
    for (const word of tokenize(dutch)) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}
