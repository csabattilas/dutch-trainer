/**
 * Turns Wiktextract (kaikki.org) entries into lexicon entries. Pure functions: each returns
 * either an entry or the reason it was dropped. Anything uncertain is dropped, never guessed.
 */
import type { AdjectiveEntry, NounEntry, VerbEntry } from '../../dutch-app/src/app/data/format.ts';

export interface RawForm {
  form: string;
  tags?: string[];
  source?: string;
}

export interface RawEntry {
  word: string;
  pos: string;
  lang_code?: string;
  head_templates?: { name: string; args?: Record<string, string>; expansion?: string }[];
  forms?: RawForm[];
  senses?: { glosses?: string[]; tags?: string[] }[];
}

export type Extracted<T> = { ok: true; entry: T } | { ok: false; reason: string };

const ok = <T>(entry: T): Extracted<T> => ({ ok: true, entry });
const fail = <T>(reason: string): Extracted<T> => ({ ok: false, reason });

/** Senses we never use as the main meaning. */
const SKIP_SENSE_TAGS = ['form-of', 'alt-of', 'archaic', 'obsolete', 'dated'];
/** Regional, formal or old variants of a form: we want the standard one. */
const VARIANT_TAGS = ['formal', 'archaic', 'Flanders', 'colloquial', 'majestic', 'subjunctive', 'dated', 'obsolete'];

const GENDER: Record<string, 'de' | 'het'> = { m: 'de', f: 'de', c: 'de', n: 'het' };

/** "dog (Canis lupus familiaris)" -> "dog"; "a house, home; residence" -> "a house, home". */
export function cleanGloss(gloss: string): string {
  return gloss
    .replace(/\s*\([^)]*\)/g, '')
    .split(';')[0]
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')
    .replace(/[\s,:.]+$/, '');
}

export function mainGloss(e: RawEntry): string | null {
  for (const sense of e.senses ?? []) {
    if ((sense.tags ?? []).some((t) => SKIP_SENSE_TAGS.includes(t))) continue;
    const first = sense.glosses?.[0];
    const cleaned = first ? cleanGloss(first) : '';
    if (cleaned) return cleaned;
  }
  return null;
}

export const DIMINUTIVE_OF = /^diminutive of ([\p{L}-]+)$/u;

function diminutiveOf(e: RawEntry): string | null {
  for (const sense of e.senses ?? []) {
    const g = sense.glosses?.[0];
    if (g && DIMINUTIVE_OF.test(g)) return g;
  }
  return null;
}

function findForm(e: RawEntry, required: string[], forbidden: string[] = []): string | undefined {
  const banned = [...VARIANT_TAGS, ...forbidden];
  return e.forms?.find((f) => {
    const tags = f.tags ?? [];
    return required.every((r) => tags.includes(r)) && !banned.some((b) => tags.includes(b));
  })?.form;
}

function isSingleWord(word: string): boolean {
  return /^[\p{L}'-]+$/u.test(word);
}

export function extractNoun(e: RawEntry): Extracted<NounEntry> {
  // Inflected forms (plurals etc.) use the generic "head" template and are skipped here.
  const head = e.head_templates?.find((h) => h.name === 'nl-noun' || h.name === 'nl-noun-dim');
  if (!head) return fail('not a lemma noun');
  if (!isSingleWord(e.word)) return fail('multi-word');

  let genders: Set<'de' | 'het'>;
  if (head.name === 'nl-noun-dim') {
    genders = new Set(['het']); // diminutives are always het
  } else {
    const raw = Object.entries(head.args ?? {})
      .filter(([k]) => k === '1' || /^g\d*$/.test(k))
      .map(([, v]) => v)
      .join(',');
    const letters =
      raw === 'mfbysense'
        ? ['m', 'f']
        : raw
            .split(/[^a-z]+/)
            .filter(Boolean)
            .flatMap((p) => (p === 'mf' ? ['m', 'f'] : [p]));
    if (!letters.length) return fail('no gender');
    if (letters.some((l) => !(l in GENDER))) return fail(`unclear gender "${raw}"`);
    genders = new Set(letters.map((l) => GENDER[l]));
  }
  if (genders.size > 1) return fail('both de and het');

  // Diminutives often only say "diminutive of hek"; the build resolves that to "small <meaning of hek>".
  const gloss = mainGloss(e) ?? diminutiveOf(e);
  if (!gloss) return fail('no usable meaning');
  return ok({
    lemma: e.word,
    gender: [...genders][0],
    plural: findForm(e, ['plural']),
    diminutive: findForm(e, ['diminutive']),
    gloss,
  });
}

export function extractAdjective(e: RawEntry): Extracted<AdjectiveEntry> {
  if (!e.head_templates?.some((h) => h.name === 'nl-adj')) return fail('not a lemma adjective');
  if (!isSingleWord(e.word)) return fail('multi-word');
  const inflected = findForm(e, ['indefinite', 'masculine', 'positive', 'singular']);
  if (!inflected) return fail('no -e form (indeclinable)');
  const gloss = mainGloss(e);
  if (!gloss) return fail('no usable meaning');
  return ok({ lemma: e.word, inflected, gloss });
}

export function extractVerb(e: RawEntry): Extracted<VerbEntry> {
  if (!e.head_templates?.some((h) => h.name === 'nl-verb')) return fail('not a lemma verb');
  if (!isSingleWord(e.word)) return fail('multi-word');

  const table = e.forms?.find((f) => f.tags?.includes('table-tags'))?.form ?? '';
  const separable = table.split(' ').includes('separable');
  // Separable verbs list both orders; we want the main-clause one ("ruim op").
  const clause = separable ? ['main-clause'] : [];
  const notSub = ['subordinate-clause'];

  const stemFull = findForm(e, ['first-person', 'present', 'singular', ...clause], notSub);
  const thirdFull = findForm(e, ['present', 'singular', 'third-person', ...clause], notSub);
  if (!stemFull || !thirdFull) return fail('missing present forms');

  let stem = stemFull;
  let third = thirdFull;
  let sep: VerbEntry['separable'];
  if (separable) {
    const [s, particle, ...extra] = stemFull.split(' ');
    const [t, particle2] = thirdFull.split(' ');
    if (!particle || extra.length || particle2 !== particle || !e.word.startsWith(particle)) {
      return fail('unexpected separable forms');
    }
    stem = s;
    third = t;
    sep = { particle, root: e.word.slice(particle.length) };
  } else if (stemFull.includes(' ') || thirdFull.includes(' ')) {
    return fail('unexpected multi-word forms');
  }

  const gloss = mainGloss(e);
  if (!gloss) return fail('no usable meaning');

  const pastSingular = findForm(e, ['first-person', 'past', 'singular', ...clause], notSub);
  const pastPlural = findForm(e, ['past', 'plural', ...clause], notSub);
  const participle = findForm(e, ['participle', 'past', ...clause]);

  return ok({
    lemma: e.word,
    stem,
    third,
    gloss,
    separable: sep,
    past: pastSingular ? { singular: pastSingular, plural: pastPlural } : undefined,
    participle,
  });
}
