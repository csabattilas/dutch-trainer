/** Every external data source: where it comes from, its licence and the credit the app must show. */
export interface Source {
  id: string;
  name: string;
  /** Direct download URL. */
  url: string;
  /** File name inside data-raw/. */
  file: string;
  /** Approximate size, shown before downloading. */
  approxSize: string;
  licence: string;
  attribution: string;
  /** Unzip into data-raw/<id>/ after downloading. */
  unzip?: boolean;
}

export const SOURCES: Source[] = [
  {
    id: 'wiktextract-nl',
    name: 'Wiktionary (via Wiktextract / kaikki.org)',
    url: 'https://kaikki.org/dictionary/Dutch/kaikki.org-dictionary-Dutch.jsonl',
    file: 'kaikki.org-dictionary-Dutch.jsonl',
    approxSize: '244 MB',
    licence: 'CC BY-SA (Wiktionary content)',
    attribution:
      'Word data from Wiktionary (https://en.wiktionary.org), extracted with Wiktextract by Tatu Ylonen (https://kaikki.org).',
  },
  {
    id: 'tatoeba-nld-eng',
    name: 'Tatoeba (via ManyThings.org)',
    url: 'https://www.manythings.org/anki/nld-eng.zip',
    file: 'nld-eng.zip',
    approxSize: 'a few MB',
    licence: 'CC BY 2.0 FR',
    // Update when example sentences are shown in the app (Phase 2).
    attribution: 'Word frequencies computed from Tatoeba sentences (https://tatoeba.org), released under CC BY 2.0 FR.',
    unzip: true,
  },
];
