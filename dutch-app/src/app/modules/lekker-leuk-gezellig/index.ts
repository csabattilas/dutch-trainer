import { bankModule } from '../../core/bank';

// Starter items written for the app. Replace or extend them with the course doc's exercises.
// leuk and gezellig overlap a lot ("een leuke/gezellige avond"), so items about atmosphere
// leave "leuk" out of the choices instead of marking a correct answer wrong.
export const lekkerLeukGezellig = bankModule({
  id: 'lekker-leuk-gezellig',
  title: 'lekker / leuk / gezellig',
  description: 'Tastes good, is fun, or feels cosy? Choosing the right word.',
  unit: 'lekker-leuk-gezellig',
  level: 'A1',
  ruleHint: 'lekker = tastes or feels good (food, sleep, weather). leuk = fun, nice (films, ideas, people). gezellig = cosy, warm, sociable atmosphere.',
  writing: {
    task: 'Write two sentences: one with lekker, one with leuk or gezellig.',
    focus: 'choosing lekker (tastes/feels good), leuk (fun/nice) or gezellig (cosy, sociable), including the -e ending before nouns',
  },
  items: [
    { prompt: 'Het eten is ___.', answer: 'lekker', choices: ['lekker', 'leuk', 'gezellig'], skill: 'lekker', explanation: 'Food that tastes good is lekker.' },
    { prompt: 'Deze koffie is ___.', answer: 'lekker', choices: ['lekker', 'leuk', 'gezellig'], skill: 'lekker', explanation: 'Drinks that taste good are lekker.' },
    { prompt: 'Wat een ___ taart!', answer: 'lekkere', choices: ['lekkere', 'leuke', 'gezellige'], skill: 'lekker', hint: 'taart is a de-word, so the adjective gets -e.', explanation: 'A cake that tastes good: een lekkere taart.' },
    { prompt: 'Op zaterdag slaap ik ___ lang uit.', answer: 'lekker', choices: ['lekker', 'leuk', 'gezellig'], skill: 'lekker', explanation: 'lekker also means "nicely, comfortably": lekker lang uitslapen.' },
    { prompt: 'Zon en 22 graden: het is ___ weer.', answer: 'lekker', choices: ['lekker', 'gezellig'], skill: 'lekker', explanation: 'Pleasant weather is lekker weer.' },
    { prompt: 'Wat een ___ film!', answer: 'leuke', choices: ['leuke', 'lekkere', 'gezellige'], skill: 'leuk', hint: 'film is a de-word, so the adjective gets -e.', explanation: 'A fun film: een leuke film.' },
    { prompt: 'Ik vind Nederlands leren heel ___.', answer: 'leuk', choices: ['leuk', 'lekker', 'gezellig'], skill: 'leuk', explanation: 'Something you enjoy doing is leuk.' },
    { prompt: 'Een ___ idee!', answer: 'leuk', choices: ['leuk', 'lekker', 'gezellig'], skill: 'leuk', hint: 'idee is a het-word with "een", so no -e.', explanation: 'A nice idea: een leuk idee.' },
    { prompt: 'Wat ___ dat je er bent!', answer: 'leuk', choices: ['leuk', 'lekker'], skill: 'leuk', explanation: '"Wat leuk!" = how nice!' },
    { prompt: 'Kaarsjes, muziek en goede vrienden: het is hier echt ___.', answer: 'gezellig', choices: ['gezellig', 'lekker'], skill: 'gezellig', explanation: 'A warm, cosy atmosphere is gezellig.' },
    { prompt: 'Kerst met de familie is altijd ___.', answer: 'gezellig', choices: ['gezellig', 'lekker'], skill: 'gezellig', explanation: 'Time together with family is gezellig.' },
    { prompt: 'We hadden een ___ avond met vrienden.', answer: 'gezellige', choices: ['gezellige', 'lekkere'], skill: 'gezellig', explanation: 'An evening with friends: een gezellige avond (een leuke avond is also fine).' },
  ],
});
