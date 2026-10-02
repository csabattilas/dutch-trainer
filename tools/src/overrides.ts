/**
 * Hand-made corrections for cases the automatic rules can't decide. Every entry needs a reason;
 * all applied overrides are listed in the build report. Keep this list short: if a pattern
 * repeats, it should become a rule in build-lexicon.ts instead.
 */
export const EXCLUDE: Record<'nouns' | 'adjectives' | 'verbs', Record<string, string>> = {
  nouns: {
    weet: 'almost always the verb weten (ik weet), not the noun "awareness"',
    kan: 'almost always the verb kunnen (ik kan), not "jug"',
    laat: 'almost always the verb laten or the adjective laat, not "serf"',
  },
  adjectives: {},
  verbs: {
    wijten: 'its past forms (weet, weten) are almost always the verb weten',
  },
};
