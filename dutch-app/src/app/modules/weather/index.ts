import { bankModule } from '../../core/bank';

// Starter items written for the app. Replace or extend them with the course doc's weather exercises.
export const weather = bankModule({
  id: 'weather',
  title: 'Het weer (weather)',
  description: 'Het regent, het sneeuwt, het is zonnig. Weather words and how to say them.',
  unit: 'het-weer',
  level: 'A1',
  ruleHint: 'Rain, snow, wind, thunder and frost use "het" + a verb, with no extra "is". Other weather uses "het is" + an adjective.',
  writing: {
    task: "Describe today's weather in one or two sentences.",
    focus: 'weather: "het" + a verb (het regent, het waait) and "het is" + an adjective (het is zonnig)',
  },
  items: [
    { prompt: '☔  Het ___.', answer: 'regent', choices: ['regent', 'sneeuwt', 'waait', 'onweert'], skill: 'het-verb', explanation: 'regenen = to rain: het regent.' },
    { prompt: '❄️  Het ___.', answer: 'sneeuwt', choices: ['sneeuwt', 'regent', 'waait', 'vriest'], skill: 'het-verb', explanation: 'sneeuwen = to snow: het sneeuwt.' },
    { prompt: '💨  Het ___.', answer: 'waait', choices: ['waait', 'regent', 'sneeuwt', 'onweert'], skill: 'het-verb', explanation: 'waaien = to be windy: het waait.' },
    { prompt: '⛈️  Het ___.', answer: 'onweert', choices: ['onweert', 'waait', 'sneeuwt', 'vriest'], skill: 'het-verb', explanation: 'onweren = to thunderstorm: het onweert.' },
    { prompt: '🥶  -5°  Het ___.', answer: 'vriest', choices: ['vriest', 'regent', 'waait'], skill: 'het-verb', explanation: 'vriezen = to freeze: het vriest.' },
    { prompt: '☀️  Het is ___.', answer: 'zonnig', choices: ['zonnig', 'bewolkt', 'mistig'], skill: 'het-is', explanation: 'zonnig = sunny: het is zonnig.' },
    { prompt: '☁️  Het is ___.', answer: 'bewolkt', choices: ['bewolkt', 'zonnig', 'mistig'], skill: 'het-is', explanation: 'bewolkt = cloudy: het is bewolkt.' },
    { prompt: '🌫️  Het is ___.', answer: 'mistig', choices: ['mistig', 'zonnig', 'bewolkt'], skill: 'het-is', explanation: 'mistig = foggy: het is mistig.' },
    { prompt: '"It is raining."', answer: 'het regent', choices: ['het regent', 'het is regen', 'het regenen'], skill: 'het-verb', hint: 'Use the verb regenen, conjugated for "het".', explanation: 'Weather verbs are conjugated with "het": het regent.' },
    { prompt: '"It is snowing."', answer: 'het sneeuwt', choices: ['het sneeuwt', 'het is sneeuw', 'het is sneeuwen'], skill: 'het-verb', hint: 'Use the verb sneeuwen, conjugated for "het".', explanation: 'Weather verbs are conjugated with "het": het sneeuwt.' },
    { prompt: 'Wat voor weer is het?  ☀️ 25°', answer: 'Het is warm en zonnig.', choices: ['Het is warm en zonnig.', 'Het is koud en nat.', 'Het sneeuwt.'], skill: 'describe', explanation: '25 degrees with sun: warm en zonnig.' },
    { prompt: 'Neem een paraplu mee, want het ___.', answer: 'regent', choices: ['regent', 'is zonnig', 'vriest'], skill: 'describe', explanation: 'You take an umbrella because it rains.' },
  ],
});
