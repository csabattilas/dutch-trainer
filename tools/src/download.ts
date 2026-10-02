/**
 * Downloads the raw sources into data-raw/. Skips files that already exist.
 *   node src/download.ts              -> all sources
 *   node src/download.ts tatoeba-nld-eng -> one source
 */
import { execFileSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { RAW_DIR } from './paths.ts';
import { SOURCES, type Source } from './sources.ts';

async function download(source: Source): Promise<void> {
  const target = join(RAW_DIR, source.file);
  if (existsSync(target)) {
    console.log(`✓ ${source.id}: already in data-raw/, skipping`);
    return;
  }
  console.log(`↓ ${source.id}: ${source.url} (~${source.approxSize})`);
  const res = await fetch(source.url);
  if (!res.ok || !res.body) throw new Error(`${source.id}: HTTP ${res.status}`);

  // Write to a temp name first so an interrupted download never looks complete.
  const partial = `${target}.part`;
  let bytes = 0;
  let lastLog = 0;
  const body = Readable.fromWeb(res.body as import('node:stream/web').ReadableStream);
  body.on('data', (chunk: Buffer) => {
    bytes += chunk.length;
    if (bytes - lastLog > 20 * 1024 * 1024) {
      lastLog = bytes;
      console.log(`  ${(bytes / 1024 / 1024).toFixed(0)} MB`);
    }
  });
  await pipeline(body, createWriteStream(partial));
  renameSync(partial, target);
  console.log(`✓ ${source.id}: ${(bytes / 1024 / 1024).toFixed(1)} MB`);

  if (source.unzip) {
    const dir = join(RAW_DIR, source.id);
    mkdirSync(dir, { recursive: true });
    execFileSync('unzip', ['-o', '-q', target, '-d', dir]);
    console.log(`  unzipped into data-raw/${source.id}/`);
  }
}

const wanted = process.argv.slice(2);
const selected = wanted.length ? SOURCES.filter((s) => wanted.includes(s.id)) : SOURCES;
if (wanted.length && selected.length !== wanted.length) {
  console.error(`Unknown source. Known: ${SOURCES.map((s) => s.id).join(', ')}`);
  process.exit(1);
}

mkdirSync(RAW_DIR, { recursive: true });
for (const source of selected) await download(source);
