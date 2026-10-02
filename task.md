# Tasks

Roadmap for Dutch Trainer. Order matters: each step builds on the one before.

**Approach: a pre-generated question bank, not on-the-fly generation.** A build tool writes
thousands of questions per module to files; every question has a fixed ID and a status
(`ok` / `needs-review` / `hidden`); the CMS corrects those files; the app only picks and
schedules. This makes every question correctable, reviewable and testable.

**Languages:**
- App: Angular / TypeScript. Only loads, picks, schedules and shows questions.
- Step 1, rule-based questions (the bulk): TypeScript tool, reusing the existing rules and tests.
- Step 2, real sentences: Python + spaCy (Dutch model) to find and check Tatoeba sentences
  that truly match a topic (word types, verb position, separable verbs). Gives a few thousand
  natural sentences; spaCy analyses sentences, it doesn't invent questions.
- Both write the same JSON question format (shared JSON Schema) into the same bank.
- Build speed is not a concern: tools run once per data update on the Mac, not in the app.

## 1. Question bank from rules + the word list

Goal: `tools/src/build-questions.ts` writes `public/data/questions/<module>.json` using
`public/data/lexicon.json` (~2,000 nouns, ~700 adjectives, ~1,300 verbs).

- [ ] Move the rule generators where the tool can run them (shared code, used at build time)
- [ ] Enumerate exhaustively instead of randomly: every noun × near/far (demonstratives),
      nouns × adjectives × article contexts (adjective endings), adverbs × verbs × subjects
      (inversion), all clock times, … with a sensible cap per module
- [ ] Fixed ID per question from its ingredients (rule + words), stable across rebuilds
- [ ] Status per question: rule-generated starts `ok` (correct by construction)
- [ ] Validate every question at build time: answer in choices exactly once, no duplicates,
      hints don't leak the answer; report counts per module + a random sample to spot-check
- [ ] Prefer course words (`course: true`) and common words (low `rank`)
- [ ] App: load a module's file when practising it (lazy), pick from it with the SRS;
      remove runtime generation
- [ ] Tap-to-translate: tap a word in a question to see its meaning, gender, plural

## 2. Harvest real sentences from Tatoeba into the same bank

Goal: natural, human-written sentences as exercises, with English translations, added to
the module files. Wrong options are generated from the real sentence by applying a known
mistake.

Matching sentences found in the 85k Dutch–English pairs:

| Topic | Sentences | Exercise |
|---|---|---|
| Inversion (vandaag/morgen/daarom… + verb + subject) | ~570 | pick/build the right order |
| omdat / want / daarom | ~130 / ~20 / ~30 | word order in the second clause |
| aan het + infinitive | ~530 | blank out or build |
| Clock times | ~430 | blank out the time phrase |
| Feelings / weather words | ~1,300 / ~390 | blank out the word |
| leuk / lekker | ~525 / ~100 | blank out the word |

- [ ] Check the licence of the spaCy Dutch model before using it
- [ ] Python tool (`tools/harvest/`) with spaCy: per-topic matchers using part-of-speech
      tags and sentence structure (e.g. is "die" a demonstrative or a relative pronoun?),
      cross-checked against the lexicon
- [ ] Fixed ID per item = Tatoeba sentence id + topic; status starts `needs-review`
- [ ] Keep Tatoeba attribution per sentence; update the credits text ("example sentences")
- [ ] Review report like the lexicon one: counts, examples, what was rejected and why
- [ ] Show the English translation as a hint or a "translate this" exercise

## 3. Corrections "CMS" (no backend: git is the database)

Goal: review and fix the question bank from the app, without a server.

- [ ] `content/corrections.json` in the repo: per question ID → status (ok / hidden) or a
      fixed answer / choices / explanation. `build-questions` applies it on every rebuild,
      so corrections survive regeneration
- [ ] Review screen (dev mode only): ⚑ reports + `needs-review` questions in batches;
      mark OK / hide / fix → downloads an updated `corrections.json`
- [ ] Commit the file (or hand it to Claude) → rebuild + deploy publishes the correction
- [ ] Nobody reviews 20,000 questions by hand: rule-generated ones are trusted and
      spot-checked, harvested ones reviewed in batches, ⚑ reports catch the rest
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
