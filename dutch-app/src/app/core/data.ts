import type { CreditsFile } from '../data/format';

/** Generated data files live in public/data/. Relative URLs, so they work under any base href
 *  (e.g. https://<user>.github.io/dutch/). */
export async function loadCredits(): Promise<CreditsFile | null> {
  try {
    const res = await fetch('data/credits.json');
    if (!res.ok) return null;
    const file = (await res.json()) as CreditsFile;
    return file.version === 1 ? file : null;
  } catch {
    return null;
  }
}
