import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { readJsonl } from './jsonl.ts';

test('readJsonl yields parsed lines, skips blanks and counts bad lines', async () => {
  const file = join(mkdtempSync(join(tmpdir(), 'jsonl-')), 'x.jsonl');
  writeFileSync(file, '{"word":"hond"}\n\nnot json\n{"word":"huis"}\n');
  const stats = { lines: 0, bad: 0 };
  const out: unknown[] = [];
  for await (const v of readJsonl(file, stats)) out.push(v);
  assert.deepEqual(out, [{ word: 'hond' }, { word: 'huis' }]);
  assert.deepEqual(stats, { lines: 3, bad: 1 });
});
