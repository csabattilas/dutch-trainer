/**
 * Renders the app icons from dutch-app/public/favicon.svg.
 *   node src/build-icons.ts
 * Uses macOS Quick Look (qlmanage) to rasterise the SVG, so it needs a Mac; no packages.
 * Maskable icons and the Apple touch icon use a full-bleed square, because Android and iOS
 * apply their own rounded mask.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, renameSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OUT_DIR } from './paths.ts';

const PUBLIC_DIR = join(OUT_DIR, '..');
const svg = readFileSync(join(PUBLIC_DIR, 'favicon.svg'), 'utf8');
const fullBleed = svg.replace(/rx="\d+"/, 'rx="0"');
if (fullBleed === svg) throw new Error('favicon.svg: expected a rounded tile (rx="...") to square off');

const tmp = mkdtempSync(join(tmpdir(), 'icons-'));
writeFileSync(join(tmp, 'rounded.svg'), svg);
writeFileSync(join(tmp, 'square.svg'), fullBleed);

const outputs: [source: string, size: number, target: string][] = [
  ['rounded', 192, 'icons/icon-192.png'],
  ['rounded', 512, 'icons/icon-512.png'],
  ['square', 192, 'icons/icon-maskable-192.png'],
  ['square', 512, 'icons/icon-maskable-512.png'],
  ['square', 180, 'apple-touch-icon.png'],
];

mkdirSync(join(PUBLIC_DIR, 'icons'), { recursive: true });
for (const [source, size, target] of outputs) {
  execFileSync('qlmanage', ['-t', '-s', String(size), '-o', tmp, join(tmp, `${source}.svg`)], { stdio: 'ignore' });
  renameSync(join(tmp, `${source}.svg.png`), join(PUBLIC_DIR, target));
  console.log(`✓ ${target} (${size}px)`);
}
