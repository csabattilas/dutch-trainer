# Tasks

Roadmap for Dutch Trainer. Order matters: each step builds on the one before.

## 1. Connect the word list to the app

Goal: modules draw words from `public/data/lexicon.json` (~2,000 nouns, ~700 adjectives,
~1,300 verbs) instead of the small hand-typed lists, so they produce hundreds of questions.

- [ ] Load `lexicon.json` at startup; keep the hand-typed seed as a fallback while it loads
      or if it fails (offline first visit)
- [ ] Pass the lexicon to modules: `generate(rng, count, ctx)` with `ctx.lexicon`
- [ ] Demonstratives: all nouns with confirmed de/het (29 unique questions → thousands)
- [ ] Adjective endings: lexicon nouns × adjectives with their -e form
- [ ] Prefer course words (`course: true`) and common words (low `rank`) when picking
- [ ] Stable question IDs for generated questions (rule + words), needed by step 3
- [ ] Tap-to-translate: tap a word in a question to see its meaning, gender, plural
- [ ] Measure: every module can fill 50 unique questions (test), except bank modules

## 2. Harvest real sentences from Tatoeba (Phase 2)

Goal: natural, human-written sentences as exercises, with English translations.
Wrong options are generated from the real sentence by applying a known mistake.

Matching sentences found in the 85k Dutch–English pairs:

| Topic | Sentences | Exercise |
|---|---|---|
| Inversion (vandaag/morgen/daarom… + verb + subject) | ~570 | pick/build the right order |
| omdat / want / daarom | ~130 / ~20 / ~30 | word order in the second clause |
| aan het + infinitive | ~530 | blank out or build |
| Clock times | ~430 | blank out the time phrase |
| Feelings / weather words | ~1,300 / ~390 | blank out the word |
| leuk / lekker | ~525 / ~100 | blank out the word |

- [ ] `tools/src/build-sentences.ts`: pattern matchers per topic, checked against the
      lexicon (e.g. is the word after "die" really a noun?), output `public/data/sentences.json`
- [ ] Stable ID per item = Tatoeba sentence id + topic
- [ ] Keep Tatoeba attribution per sentence; update the credits text ("example sentences")
- [ ] Review report like the lexicon one: counts, examples, what was rejected and why
- [ ] Modules use harvested sentences alongside generated ones
- [ ] Show the English translation as a hint or a "translate this" exercise

## 3. Corrections "CMS" (no backend: git is the database)

Goal: fix or hide wrong questions for good, from the app, without a server.

- [ ] `content/corrections.json` in the repo: per question ID → hide, or fix answer /
      choices / explanation; applied when the app loads
- [ ] Review screen (dev mode only): lists ⚑ reports and newly harvested sentences;
      mark OK / hide / fix → downloads an updated `corrections.json`
- [ ] Commit the file (or hand it to Claude) → deploy publishes the correction
- [ ] Harvested sentences can start as "unreviewed" and only go live once approved
- [ ] Recurring mistakes in one rule become a code fix + a test, not many corrections

## Also on the list

- [ ] Real PWA: manifest, service worker (offline), tulip PNG icons, "new version" banner
- [ ] Bank content from the course docs: weather, emotions, lekker/leuk/gezellig
      (gezellig is in only 2 Tatoeba sentences: needs course material or reviewed LLM drafts)
- [ ] "i vs ie" module: need the course exercises to know what it covers
- [ ] Verb tenses module (lexicon already has past tense and participles)
- [ ] Shared grammar toolkit (`core/grammar/`): conjugation, adjective ending, word order,
      used by all modules; golden tests from course sentences
- [ ] Unit filter on the menu ("this week's lesson") once modules are tagged by lesson
- [ ] Built-in AI sentence checker (Phase 3): small serverless proxy holding the API key;
      today the Write screen opens Claude/Google in a new tab instead
- [ ] Diminutive meanings: "small X" glosses are approximate (e.g. hekje = small fence, gate)

## Done

- [x] 11 modules: demonstratives, adjective endings, time, inversion, separable verbs,
      want/omdat/daarom, sentence order, aan het, weather, emotions, lekker/leuk/gezellig
- [x] Spaced repetition per rule, hints, second chance, auto-advance, settings
- [x] Write screen with AI tutor links
- [x] Word list pipeline (Wiktionary + Tatoeba frequencies) with review report
- [x] ⚑ Report button, reports saved on device, copy/download
- [x] Privacy, credits & disclaimer; published at https://csabattilas.github.io/dutch-trainer/
- [x] Sessions mix rules and avoid repeated questions
