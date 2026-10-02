import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

/** Streams a JSON-lines file one parsed object at a time, so a 244 MB file never sits in memory.
 *  Lines that aren't valid JSON are counted in `stats.bad` instead of stopping the build. */
export async function* readJsonl(
  path: string,
  stats: { lines: number; bad: number } = { lines: 0, bad: 0 },
): AsyncGenerator<unknown> {
  const rl = createInterface({ input: createReadStream(path, 'utf8'), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    stats.lines++;
    try {
      yield JSON.parse(line);
    } catch {
      stats.bad++;
    }
  }
}
