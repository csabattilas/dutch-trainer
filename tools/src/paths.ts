import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(TOOLS_DIR, '..');

/** Downloaded source files. Large, never committed, safe to delete after a build. */
export const RAW_DIR = join(ROOT, 'data-raw');

/** Generated files the app loads. Small, committed with the app. */
export const OUT_DIR = join(ROOT, 'dutch-app', 'public', 'data');
