import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { allocateScores, countDutchWords, tokenize } from './frequency.ts';

test('a function word keeps its form; a verb using it as a stem gets almost nothing', () => {
  const counts = new Map([
    ['niet', 1000],
    ['nieten', 2],
  ]);
  const s = allocateScores(counts, [
    { key: 'adv:niet', forms: ['niet'], strong: true, lemma: 'niet' },
    { key: 'verb:nieten', forms: ['nieten', 'niet'], lemma: 'nieten' },
  ]);
  assert.ok(s.get('adv:niet')! > 990);
  assert.ok(s.get('verb:nieten')! < 10, `verb nieten should be rare, got ${s.get('verb:nieten')}`);
});

test('no headword floor when the form is another word\'s headword too (waar, goed)', () => {
  const counts = new Map([['waar', 800]]);
  const s = allocateScores(counts, [
    { key: 'fn:waar', forms: ['waar'], strong: true, lemma: 'waar' },
    { key: 'noun:waar', forms: ['waar', 'waren'], lemma: 'waar' },
  ]);
  assert.ok(s.get('noun:waar')! < 10, `noun waar should get almost nothing, got ${s.get('noun:waar')}`);
});

test('a shared inflected form goes to the word with its own evidence (huis vs huizen)', () => {
  const counts = new Map([
    ['huis', 300],
    ['huizen', 20],
    ['huisje', 5],
  ]);
  const s = allocateScores(counts, [
    { key: 'noun:huis', forms: ['huis', 'huizen', 'huisje'], lemma: 'huis' },
    { key: 'verb:huizen', forms: ['huizen', 'huis', 'huist'], lemma: 'huizen' },
  ]);
  assert.ok(s.get('noun:huis')! > 250, `noun huis should keep most of its count, got ${s.get('noun:huis')}`);
  assert.ok(s.get('verb:huizen')! < 60);
});

test('a word keeps at least a quarter of its own headword (werk vs werken)', () => {
  const counts = new Map([
    ['werk', 400],
    ['werken', 250],
    ['werkt', 150],
    ['werkte', 50],
  ]);
  const s = allocateScores(counts, [
    { key: 'noun:werk', forms: ['werk', 'werken', 'werkje'], lemma: 'werk' },
    { key: 'verb:werken', forms: ['werken', 'werk', 'werkt', 'werkte'], lemma: 'werken' },
  ]);
  assert.ok(s.get('noun:werk')! >= 100, `noun werk should keep a fair share, got ${s.get('noun:werk')}`);
  assert.ok(s.get('verb:werken')! > s.get('noun:werk')!);
});

test('tokenize lowercases and keeps word-internal apostrophes and hyphens', () => {
  assert.deepEqual(tokenize('Zo’n e-mail, toch? Ik ga!'), ["zo'n", 'e-mail', 'toch', 'ik', 'ga']);
});

test('countDutchWords counts only the Dutch column', async () => {
  const file = join(mkdtempSync(join(tmpdir(), 'freq-')), 'nld.txt');
  writeFileSync(file, 'I go.\tIk ga.\tCC-BY\nGo!\tGa!\tCC-BY\n');
  const counts = await countDutchWords(file);
  assert.equal(counts.get('ga'), 2);
  assert.equal(counts.get('ik'), 1);
  assert.equal(counts.get('go'), undefined);
});
