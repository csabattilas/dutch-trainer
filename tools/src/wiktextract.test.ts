import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanGloss, extractAdjective, extractNoun, extractVerb, type RawEntry } from './wiktextract.ts';

// Fixtures are trimmed copies of real kaikki.org entries (enwiktionary dump 2026-09-02).

const hond: RawEntry = {
  word: 'hond',
  pos: 'noun',
  head_templates: [{ name: 'nl-noun', args: { 1: 'm', 2: '-en', 3: '+' } }],
  forms: [
    { form: 'honden', tags: ['plural'] },
    { form: 'hondje', tags: ['diminutive', 'neuter'] },
  ],
  senses: [{ glosses: ['dog (Canis lupus familiaris)'], tags: ['masculine'] }],
};

const huis: RawEntry = {
  word: 'huis',
  pos: 'noun',
  head_templates: [{ name: 'nl-noun', args: { 1: 'n', 2: '-zen', 3: '+' } }],
  forms: [
    { form: 'huizen', tags: ['plural'] },
    { form: 'huisje', tags: ['diminutive', 'neuter'] },
  ],
  senses: [{ glosses: ['a house, home; residence'], tags: ['neuter'] }],
};

const hekje: RawEntry = {
  word: 'hekje',
  pos: 'noun',
  head_templates: [{ name: 'nl-noun-dim', args: {} }],
  forms: [{ form: 'hekjes', tags: ['plural'] }],
  senses: [{ glosses: ['diminutive of hek'], tags: ['diminutive', 'form-of', 'neuter'] }],
};

const werkenPlural: RawEntry = {
  word: 'werken',
  pos: 'noun',
  head_templates: [{ name: 'head', args: { 1: 'nl', 2: 'noun form' } }],
  senses: [{ glosses: ['plural of werk'], tags: ['form-of', 'plural'] }],
};

const groot: RawEntry = {
  word: 'groot',
  pos: 'adj',
  head_templates: [{ name: 'nl-adj', args: { 1: 'groter' } }],
  forms: [
    { form: 'groter', tags: ['comparative'] },
    { form: 'groot', tags: ['adverbial', 'positive', 'predicative'], source: 'declension' },
    { form: 'grote', tags: ['feminine', 'indefinite', 'masculine', 'positive', 'singular'], source: 'declension' },
    { form: 'grotere', tags: ['comparative', 'feminine', 'indefinite', 'masculine', 'singular'], source: 'declension' },
  ],
  senses: [{ glosses: ['big, large, great'] }],
};

const conj = (form: string, ...tags: string[]) => ({ form, tags, source: 'conjugation' });

const werken: RawEntry = {
  word: 'werken',
  pos: 'verb',
  head_templates: [{ name: 'nl-verb', args: {} }],
  forms: [
    conj('weak', 'table-tags'),
    conj('werk', 'first-person', 'present', 'singular'),
    conj('werkte', 'first-person', 'past', 'singular'),
    conj('werkt', 'formal', 'present', 'second-person', 'singular'),
    conj('werkt', 'present', 'singular', 'third-person'),
    conj('werkten', 'past', 'plural'),
    conj('werkend', 'participle', 'present'),
    conj('gewerkt', 'participle', 'past'),
  ],
  senses: [{ glosses: ['to work, labour'], tags: ['intransitive'] }],
};

const opruimen: RawEntry = {
  word: 'opruimen',
  pos: 'verb',
  head_templates: [{ name: 'nl-verb', args: {} }],
  forms: [
    conj('separable weak', 'table-tags'),
    conj('ruim op', 'first-person', 'main-clause', 'present', 'singular'),
    conj('opruim', 'first-person', 'present', 'singular', 'subordinate-clause'),
    conj('ruimde op', 'first-person', 'main-clause', 'past', 'singular'),
    conj('ruimt op', 'main-clause', 'present', 'singular', 'third-person'),
    conj('opruimt', 'present', 'singular', 'subordinate-clause', 'third-person'),
    conj('opgeruimd', 'main-clause', 'participle', 'past'),
  ],
  senses: [{ glosses: ['to clean (something) up,'], tags: ['transitive'] }],
};

test('cleanGloss removes parentheses, extra senses and trailing punctuation', () => {
  assert.equal(cleanGloss('dog (Canis lupus familiaris)'), 'dog');
  assert.equal(cleanGloss('a house, home; residence'), 'a house, home');
  assert.equal(cleanGloss('to clean (something) up,'), 'to clean up');
});

test('nouns: de/het, plural and diminutive', () => {
  assert.deepEqual(extractNoun(hond), {
    ok: true,
    entry: { lemma: 'hond', gender: 'de', plural: 'honden', diminutive: 'hondje', gloss: 'dog' },
  });
  assert.deepEqual(extractNoun(huis), {
    ok: true,
    entry: { lemma: 'huis', gender: 'het', plural: 'huizen', diminutive: 'huisje', gloss: 'a house, home' },
  });
});

test('diminutives are het and keep "diminutive of X" for the build to resolve', () => {
  assert.deepEqual(extractNoun(hekje), {
    ok: true,
    entry: { lemma: 'hekje', gender: 'het', plural: 'hekjes', diminutive: undefined, gloss: 'diminutive of hek' },
  });
});

test('plural form entries are skipped', () => {
  assert.equal(extractNoun(werkenPlural).ok, false);
});

test('nouns that can be both de and het are dropped', () => {
  const both = { ...hond, head_templates: [{ name: 'nl-noun', args: { 1: 'm,n' } }] };
  assert.deepEqual(extractNoun(both), { ok: false, reason: 'both de and het' });
});

test('mfbysense counts as de; plural-only and unknown are dropped', () => {
  const g = (v: string) => extractNoun({ ...hond, head_templates: [{ name: 'nl-noun', args: { 1: v } }] });
  assert.equal(g('mfbysense').ok && g('mfbysense').entry.gender, 'de');
  assert.equal(g('f,m').ok, true);
  assert.equal(g('p').ok, false);
  assert.equal(g('?').ok, false);
  assert.deepEqual(extractNoun({ ...hond, head_templates: [{ name: 'nl-noun', args: {} }] }), {
    ok: false,
    reason: 'no gender',
  });
});

test('adjectives: -e form from the declension table', () => {
  assert.deepEqual(extractAdjective(groot), {
    ok: true,
    entry: { lemma: 'groot', inflected: 'grote', gloss: 'big, large, great' },
  });
});

test('regular verb: present, past and participle, ignoring formal variants', () => {
  assert.deepEqual(extractVerb(werken), {
    ok: true,
    entry: {
      lemma: 'werken',
      stem: 'werk',
      third: 'werkt',
      gloss: 'to work, labour',
      separable: undefined,
      past: { singular: 'werkte', plural: 'werkten' },
      participle: 'gewerkt',
    },
  });
});

test('separable verb: split main-clause forms into stem + particle', () => {
  const r = extractVerb(opruimen);
  assert.ok(r.ok);
  assert.equal(r.entry.stem, 'ruim');
  assert.equal(r.entry.third, 'ruimt');
  assert.deepEqual(r.entry.separable, { particle: 'op', root: 'ruimen' });
  assert.deepEqual(r.entry.past, { singular: 'ruimde op', plural: undefined });
  assert.equal(r.entry.participle, 'opgeruimd');
  assert.equal(r.entry.gloss, 'to clean up');
});
