import type { ExerciseModule } from '../core/types';
import { aanHet } from './aan-het';
import { adjectiveEndings } from './adjective-endings';
import { conjunctions } from './conjunctions';
import { demonstratives } from './demonstratives';
import { emotions } from './emotions';
import { inversion } from './inversion';
import { lekkerLeukGezellig } from './lekker-leuk-gezellig';
import { sentenceOrder } from './sentence-order';
import { separableVerbs } from './separable-verbs';
import { time } from './time';
import { weather } from './weather';

/** To add a module (e.g. verb tenses): create src/modules/<name>/index.ts and list it here. */
export const modules: ExerciseModule[] = [
  // vocabulary & meaning
  emotions,
  weather,
  lekkerLeukGezellig,
  // sentence building
  sentenceOrder,
  inversion,
  conjunctions,
  separableVerbs,
  // grammar rules
  demonstratives,
  adjectiveEndings,
  aanHet,
  time,
];
