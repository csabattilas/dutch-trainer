/**
 * Builds dutch-app/public/data/lexicon.json (+ credits.json) from the raw sources and writes
 * a review report to tools/reports/lexicon-report.md.
 *   node src/build-lexicon.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  AdjectiveEntry,
  CreditsFile,
  LexiconFile,
  NounEntry,
  VerbEntry,
} from '../../dutch-app/src/app/data/format.ts';
import { COURSE_WORDS } from '../../dutch-app/src/app/data/course-words.ts';
import * as hand from '../../dutch-app/src/app/data/lexicon.ts';
import { allocateScores, countDutchWords, type Candidate } from './frequency.ts';
import { readJsonl } from './jsonl.ts';
import { EXCLUDE } from './overrides.ts';
import { OUT_DIR, RAW_DIR } from './paths.ts';
import { SOURCES } from './sources.ts';
import {
  DIMINUTIVE_OF,
  extractAdjective,
  extractNoun,
  extractVerb,
  type Extracted,
  type RawEntry,
} from './wiktextract.ts';

/** A word needs at least this (allocated) count in the Tatoeba sentences to be included. */
const MIN_COUNT = 3;
const LIMITS = { nouns: 4000, adjectives: 1000, verbs: 1500 };
/** Parts of speech that own their word form outright when counting (function words). */
const FUNCTION_POS = new Set(['pron', 'prep', 'det', 'article', 'num', 'conj', 'particle', 'intj', 'postp', 'contraction', 'adv']);
/** Noun drop reasons that make the whole word ambiguous, even if another entry for it is clean. */
const GENDER_DOUBT = ['both de and het', 'unclear gender', 'no gender'];

/** Collects entries per lemma; a lemma whose entries disagree is dropped as ambiguous. */
class Collector<T extends { lemma: string }> {
  readonly entries = new Map<string, T>();
  readonly conflicts = new Set<string>();
  readonly drops = new Map<string, string[]>();
  private readonly sameMeaning: (a: T, b: T) => boolean;
  private readonly poisonReasons: string[];

  // No parameter properties: Node's type stripping only supports erasable TypeScript.
  constructor(sameMeaning: (a: T, b: T) => boolean, poisonReasons: string[] = []) {
    this.sameMeaning = sameMeaning;
    this.poisonReasons = poisonReasons;
  }

  add(word: string, result: Extracted<T>): void {
    if (!result.ok) {
      this.drop(word, result.reason);
      // e.g. raam: the "window" entry is de/het-ambiguous, so a clean rarer "raam" (estimate)
      // must not be taken as the answer for the whole word.
      if (this.poisonReasons.some((p) => result.reason.startsWith(p))) this.conflicts.add(word);
      return;
    }
    const existing = this.entries.get(result.entry.lemma);
    if (!existing) this.entries.set(result.entry.lemma, result.entry);
    else if (!this.sameMeaning(existing, result.entry)) this.conflicts.add(result.entry.lemma);
  }

  drop(word: string, reason: string): void {
    const list = this.drops.get(reason) ?? [];
    list.push(word);
    this.drops.set(reason, list);
  }

  clean(): T[] {
    return [...this.entries.values()].filter((e) => !this.conflicts.has(e.lemma));
  }
}

const lower = (forms: (string | undefined)[]) =>
  forms.filter((f): f is string => !!f).map((f) => f.toLowerCase());

const nounForms = (e: NounEntry) => lower([e.lemma, e.plural, e.diminutive]);
const adjectiveForms = (e: AdjectiveEntry) => lower([e.lemma, e.inflected]);
// Separable verbs: the stem alone ("ruim") isn't evidence for "opruimen".
const verbForms = (e: VerbEntry) =>
  e.separable
    ? lower([e.lemma, e.participle])
    : lower([e.lemma, e.stem, e.third, e.participle, e.past?.singular, e.past?.plural]);

function rankAndCap<T extends { lemma: string; rank?: number; course?: boolean }>(
  entries: T[],
  scoreOf: (e: T) => number,
  limit: number,
  force: Set<string>,
): { kept: T[]; tooRare: number; forced: string[] } {
  const scored = entries
    .map((e) => ({ e, s: scoreOf(e) }))
    .sort((a, b) => b.s - a.s || a.e.lemma.localeCompare(b.e.lemma));
  const common = scored.filter((x) => x.s >= MIN_COUNT).slice(0, limit);
  const included = new Set(common.map((x) => x.e.lemma));
  // Course words are always included, even when rare in the sentence corpus.
  const forced = scored.filter((x) => force.has(x.e.lemma) && !included.has(x.e.lemma));
  const kept = [...common, ...forced]
    .sort((a, b) => b.s - a.s || a.e.lemma.localeCompare(b.e.lemma))
    .map((x, i) => ({ ...x.e, rank: i + 1, ...(force.has(x.e.lemma) ? { course: true } : {}) }));
  return { kept, tooRare: scored.length - common.length - forced.length, forced: forced.map((x) => x.e.lemma) };
}

// ---------------------------------------------------------------------------

const started = Date.now();
const counts = await countDutchWords(join(RAW_DIR, 'tatoeba-nld-eng', 'nld.txt'));
console.log(`Counted ${counts.size} distinct words in Tatoeba sentences`);

const nouns = new Collector<NounEntry>((a, b) => a.gender === b.gender, GENDER_DOUBT);
const adjectives = new Collector<AdjectiveEntry>((a, b) => a.inflected === b.inflected);
const verbs = new Collector<VerbEntry>((a, b) => a.stem === b.stem && a.third === b.third);
const functionWords = new Map<string, Set<string>>(); // word -> parts of speech

const stats = { lines: 0, bad: 0 };
for await (const raw of readJsonl(join(RAW_DIR, 'kaikki.org-dictionary-Dutch.jsonl'), stats)) {
  const e = raw as RawEntry;
  if (e.lang_code && e.lang_code !== 'nl') continue;
  if (e.pos === 'noun') nouns.add(e.word, extractNoun(e));
  else if (e.pos === 'adj') adjectives.add(e.word, extractAdjective(e));
  else if (e.pos === 'verb') verbs.add(e.word, extractVerb(e));
  else if (FUNCTION_POS.has(e.pos) && /^[\p{L}'-]+$/u.test(e.word)) {
    const w = e.word.toLowerCase();
    functionWords.set(w, (functionWords.get(w) ?? new Set()).add(e.pos));
  }
}
console.log(`Read ${stats.lines} entries (${stats.bad} unreadable)`);

// "diminutive of hek" -> "small fence, gate"
for (const e of nouns.clean()) {
  const m = e.gloss.match(DIMINUTIVE_OF);
  if (!m) continue;
  const base = nouns.entries.get(m[1]);
  if (base && !nouns.conflicts.has(base.lemma) && !DIMINUTIVE_OF.test(base.gloss)) {
    e.gloss = `small ${base.gloss}`;
  } else {
    nouns.entries.delete(e.lemma);
    nouns.drop(e.lemma, 'diminutive of an unknown word');
  }
}

// Hand-made exclusions (see overrides.ts).
const applied: string[] = [];
for (const [kind, c] of [
  ['nouns', nouns],
  ['adjectives', adjectives],
  ['verbs', verbs],
] as const) {
  for (const [lemma, reason] of Object.entries(EXCLUDE[kind])) {
    if (!(c as Collector<{ lemma: string }>).entries.delete(lemma)) continue;
    (c as Collector<{ lemma: string }>).drop(lemma, 'excluded by overrides.ts');
    applied.push(`${kind.slice(0, -1)} **${lemma}**: ${reason}`);
  }
}

// Course words (course-words.ts + the hand-typed seed lexicon) are always kept, marked
// `course: true`, and exempt from the rules below.
const force = {
  nouns: new Set([...COURSE_WORDS.nouns, ...hand.nouns.map((x) => x.nl)]),
  adjectives: new Set([...COURSE_WORDS.adjectives, ...hand.adjectives.map((x) => x.base)]),
  verbs: new Set([...COURSE_WORDS.verbs, ...hand.verbs.map((x) => x.inf)]),
};

// waren ("to wander") is really the past tense of zijn; weet is mostly "ik weet".
const otherVerbForms = new Map<string, string>(); // form -> verb it belongs to
for (const e of verbs.clean()) {
  for (const f of [e.stem, e.third, e.past?.singular, e.past?.plural, e.participle]) {
    if (f && f !== e.lemma && !otherVerbForms.has(f)) otherVerbForms.set(f, e.lemma);
  }
}

// A noun spelled like a function word, adjective or verb form (een, niet, bang, was) is usually
// that other word. Counting can't always tell (bang/bange: neither has forms of its own), so keep
// the noun only if its plural actually appears (weken, armen, mannen, werken), and never for
// articles/pronouns/numbers.
const cleanAdjectives = adjectives.clean();
const adjectiveWords = new Set(cleanAdjectives.map((e) => e.lemma.toLowerCase()));
const NEVER_NOUNS = new Set(['article', 'pron', 'num']);
for (const e of nouns.clean()) {
  if (force.nouns.has(e.lemma)) continue;
  const w = e.lemma.toLowerCase();
  const pos = functionWords.get(w);
  const isAdjective = adjectiveWords.has(w);
  const isVerbForm = otherVerbForms.has(w);
  if (!pos && !isAdjective && !isVerbForm) continue;
  const pluralSeen = (counts.get(e.plural?.toLowerCase() ?? '') ?? 0) >= MIN_COUNT;
  const never = pos && [...pos].some((p) => NEVER_NOUNS.has(p));
  if (pluralSeen && !never) continue;
  nouns.entries.delete(e.lemma);
  nouns.drop(
    e.lemma,
    pos
      ? `mainly a function word (${[...pos].join('/')})`
      : isAdjective
        ? 'same spelling as an adjective, plural never used'
        : `same spelling as a form of ${otherVerbForms.get(w)}, plural never used`,
  );
}

// Frequency: split shared forms between all words that have them.
const cleanNouns = nouns.clean();
const candidates: Candidate[] = [
  ...cleanNouns.map((e) => ({ key: `noun:${e.lemma}`, forms: nounForms(e), lemma: e.lemma.toLowerCase() })),
  ...cleanAdjectives.map((e) => ({ key: `adj:${e.lemma}`, forms: adjectiveForms(e), lemma: e.lemma.toLowerCase() })),
  // All verbs compete here; the "form of a more common verb" rule below needs their scores.
  ...verbs.clean().map((e) => ({ key: `verb:${e.lemma}`, forms: verbForms(e), lemma: e.lemma.toLowerCase() })),
  // An adverb that is also an adjective (snel, goed) is the same word: don't let it compete.
  ...[...functionWords.entries()]
    .filter(([w, pos]) => !(pos.size === 1 && pos.has('adv') && adjectiveWords.has(w)))
    .map(([w]) => ({ key: `fn:${w}`, forms: [w], strong: true, lemma: w })),
];
const scores = allocateScores(counts, candidates);

// Drop a verb whose infinitive is a form of a more common verb (waren -> zijn).
const verbScore = (lemma: string) => scores.get(`verb:${lemma}`) ?? 0;
const cleanVerbs = verbs.clean().filter((e) => {
  const owner = otherVerbForms.get(e.lemma);
  if (owner && !force.verbs.has(e.lemma) && verbScore(owner) > verbScore(e.lemma)) {
    verbs.drop(e.lemma, 'mainly a form of a more common verb');
    return false;
  }
  return true;
});

const n = rankAndCap(cleanNouns, (e) => scores.get(`noun:${e.lemma}`) ?? 0, LIMITS.nouns, force.nouns);
const a = rankAndCap(cleanAdjectives, (e) => scores.get(`adj:${e.lemma}`) ?? 0, LIMITS.adjectives, force.adjectives);
const v = rankAndCap(cleanVerbs, (e) => scores.get(`verb:${e.lemma}`) ?? 0, LIMITS.verbs, force.verbs);

const usedSources = ['wiktextract-nl', 'tatoeba-nld-eng'];
const lexicon: LexiconFile = {
  version: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  sources: usedSources,
  nouns: n.kept,
  adjectives: a.kept,
  verbs: v.kept,
};
const credits: CreditsFile = {
  version: 1,
  credits: SOURCES.filter((s) => usedSources.includes(s.id)).map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    licence: s.licence,
    attribution: s.attribution,
  })),
};

mkdirSync(OUT_DIR, { recursive: true });
const lexiconJson = JSON.stringify(lexicon);
writeFileSync(join(OUT_DIR, 'lexicon.json'), lexiconJson);
writeFileSync(join(OUT_DIR, 'credits.json'), JSON.stringify(credits, null, 2));

// --- Course words that couldn't be included ---------------------------------------------------
const missingCourse: string[] = [];
for (const [kind, kept, c] of [
  ['noun', n.kept, nouns],
  ['adjective', a.kept, adjectives],
  ['verb', v.kept, verbs],
] as const) {
  const keptLemmas = new Set(kept.map((e) => e.lemma));
  const set = kind === 'noun' ? force.nouns : kind === 'adjective' ? force.adjectives : force.verbs;
  for (const w of set) {
    if (keptLemmas.has(w)) continue;
    const reason =
      [...(c as Collector<{ lemma: string }>).drops.entries()].find(([, ws]) => ws.includes(w))?.[0] ??
      ((c as Collector<{ lemma: string }>).conflicts.has(w) ? 'ambiguous in Wiktionary' : 'not in Wiktionary');
    missingCourse.push(`${kind} **${w}**: ${reason}`);
  }
}

// --- Cross-check the hand-typed seed lexicon against Wiktionary -----------------------------
const mismatches: string[] = [];
for (const h of hand.nouns) {
  const w = nouns.entries.get(h.nl);
  if (nouns.conflicts.has(h.nl)) mismatches.push(`noun **${h.nl}**: ambiguous in Wiktionary (de/het or conflicting entries)`);
  else if (!w) mismatches.push(`noun **${h.nl}**: not found in Wiktionary data (or dropped)`);
  else if (w.gender !== h.gender) mismatches.push(`noun **${h.nl}**: app says ${h.gender}, Wiktionary says ${w.gender}`);
}
for (const h of hand.adjectives) {
  const w = adjectives.entries.get(h.base);
  if (!w) mismatches.push(`adjective **${h.base}**: not found`);
  else if (w.inflected !== h.inflected) mismatches.push(`adjective **${h.base}**: app says ${h.inflected}, Wiktionary says ${w.inflected}`);
}
for (const h of hand.verbs) {
  const w = verbs.entries.get(h.inf);
  if (!w) mismatches.push(`verb **${h.inf}**: not found`);
  else if (w.stem !== h.stem || w.third !== h.third)
    mismatches.push(`verb **${h.inf}**: app says ${h.stem}/${h.third}, Wiktionary says ${w.stem}/${w.third}`);
}

// --- Report ------------------------------------------------------------------------------------
function dropSection(
  title: string,
  c: Collector<{ lemma: string }>,
  r: { kept: unknown[]; tooRare: number; forced: string[] },
): string {
  const rows = [...c.drops.entries()]
    .sort((x, y) => y[1].length - x[1].length)
    .map(([reason, words]) => `| ${reason} | ${words.length} | ${words.slice(0, 8).join(', ')} |`);
  return [
    `### ${title}: ${r.kept.length} kept`,
    '',
    `- Too rare in Tatoeba (< ${MIN_COUNT}): ${r.tooRare}`,
    `- Included because they're course words: ${r.forced.length ? r.forced.join(', ') : 'none needed'}`,
    `- Ambiguous (conflicting or de/het-doubtful entries): ${c.conflicts.size} (${[...c.conflicts].slice(0, 8).join(', ')})`,
    '',
    '| Dropped because | Count | Examples |',
    '|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

const sample = <T extends { lemma: string }>(list: T[], fmt: (e: T) => string) =>
  list.slice(0, 30).map(fmt).join(', ');

const report = [
  '# Lexicon build report',
  '',
  `Generated ${lexicon.generatedAt}. Output: \`public/data/lexicon.json\` (${(lexiconJson.length / 1024).toFixed(0)} KB).`,
  '',
  '## Hand-typed words vs Wiktionary',
  '',
  mismatches.length ? mismatches.map((m) => `- ${m}`).join('\n') : 'All hand-typed nouns, adjectives and verbs agree with Wiktionary. ✅',
  '',
  '## Course words not in the lexicon',
  '',
  missingCourse.length ? missingCourse.map((m) => `- ${m}`).join('\n') : 'All course words included. ✅',
  '',
  '## Hand-made overrides applied',
  '',
  applied.length ? applied.map((x) => `- ${x}`).join('\n') : 'None.',
  '',
  '## What was kept and dropped',
  '',
  'Ranking is approximate: it comes from word counts in ~85k Tatoeba sentences, split between',
  'words that share a spelling. Good enough to separate common from rare words, not an exact order.',
  '',
  dropSection('Nouns', nouns, n),
  dropSection('Adjectives', adjectives, a),
  dropSection('Verbs', verbs, v),
  '## Most common entries (spot-check these)',
  '',
  `**Nouns:** ${sample(n.kept, (e) => `${e.gender} ${e.lemma} (${e.gloss})`)}`,
  '',
  `**Adjectives:** ${sample(a.kept, (e) => `${e.lemma}/${e.inflected}`)}`,
  '',
  `**Verbs:** ${sample(v.kept, (e) => `${e.lemma}: ${e.stem}/${e.third}${e.separable ? ` (sep. ${e.separable.particle})` : ''}`)}`,
  '',
  `**Separable verbs:** ${sample(v.kept.filter((e) => e.separable), (e) => `${e.lemma} (${e.stem} … ${e.separable!.particle})`)}`,
  '',
].join('\n');

const reportDir = join(RAW_DIR, '..', 'tools', 'reports');
mkdirSync(reportDir, { recursive: true });
writeFileSync(join(reportDir, 'lexicon-report.md'), report);

console.log(
  `Kept ${n.kept.length} nouns, ${a.kept.length} adjectives, ${v.kept.length} verbs ` +
    `-> lexicon.json ${(lexiconJson.length / 1024).toFixed(0)} KB (${((Date.now() - started) / 1000).toFixed(0)} s)`,
);
console.log(
  mismatches.length
    ? `⚠ ${mismatches.length} hand-typed word(s) disagree, see tools/reports/lexicon-report.md`
    : '✓ Hand-typed words agree with Wiktionary',
);
