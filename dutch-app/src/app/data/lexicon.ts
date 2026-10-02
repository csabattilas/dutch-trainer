export interface Noun {
  nl: string;
  en: string;
  gender: 'de' | 'het';
}

export interface Adjective {
  base: string;
  /** Form with the -e ending (spelling changes included, e.g. groot -> grote). */
  inflected: string;
  en: string;
}

// Phase 0 seed. Phase 1 replaces this with data filtered from NT2Lex + Wiktextract.
export const nouns: Noun[] = [
  { nl: 'kat', en: 'cat', gender: 'de' },
  { nl: 'hond', en: 'dog', gender: 'de' },
  { nl: 'tafel', en: 'table', gender: 'de' },
  { nl: 'stoel', en: 'chair', gender: 'de' },
  { nl: 'auto', en: 'car', gender: 'de' },
  { nl: 'fiets', en: 'bicycle', gender: 'de' },
  { nl: 'tas', en: 'bag', gender: 'de' },
  { nl: 'school', en: 'school', gender: 'de' },
  { nl: 'paard', en: 'horse', gender: 'het' },
  { nl: 'huis', en: 'house', gender: 'het' },
  { nl: 'boek', en: 'book', gender: 'het' },
  { nl: 'raam', en: 'window', gender: 'het' },
  { nl: 'brood', en: 'bread', gender: 'het' },
  { nl: 'hekje', en: 'little fence', gender: 'het' },
  { nl: 'kind', en: 'child', gender: 'het' },
];

export const adjectives: Adjective[] = [
  { base: 'groen', inflected: 'groene', en: 'green' },
  { base: 'groot', inflected: 'grote', en: 'big' },
  { base: 'klein', inflected: 'kleine', en: 'small' },
  { base: 'mooi', inflected: 'mooie', en: 'beautiful' },
  { base: 'oud', inflected: 'oude', en: 'old' },
  { base: 'nieuw', inflected: 'nieuwe', en: 'new' },
  { base: 'duur', inflected: 'dure', en: 'expensive' },
];

export interface Verb {
  inf: string;
  /** ik-form (stem). */
  stem: string;
  /** hij/zij/jij-form when the verb comes after the subject. */
  third: string;
  /** What follows the verb in a practice sentence ("" if nothing). */
  rest: string;
  /** Rest makes sense after a fronted place adverb (hier, thuis, daar). */
  placeSafe: boolean;
}

// Regular present-tense verbs only. Irregular ones (zijn, hebben, gaan...) get their own module.
export const verbs: Verb[] = [
  { inf: 'werken', stem: 'werk', third: 'werkt', rest: 'hard', placeSafe: true },
  { inf: 'eten', stem: 'eet', third: 'eet', rest: 'een boterham', placeSafe: true },
  { inf: 'drinken', stem: 'drink', third: 'drinkt', rest: 'koffie', placeSafe: true },
  { inf: 'lezen', stem: 'lees', third: 'leest', rest: 'een boek', placeSafe: true },
  { inf: 'slapen', stem: 'slaap', third: 'slaapt', rest: 'lang', placeSafe: true },
  { inf: 'kopen', stem: 'koop', third: 'koopt', rest: 'brood', placeSafe: false },
  { inf: 'lopen', stem: 'loop', third: 'loopt', rest: 'snel', placeSafe: false },
  { inf: 'wonen', stem: 'woon', third: 'woont', rest: 'in Utrecht', placeSafe: false },
];
