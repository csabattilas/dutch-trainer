import { bankModule } from '../../core/bank';

// Starter items written for the app. Replace or extend them with the course doc's emotions exercises.
export const emotions = bankModule({
  id: 'emotions',
  title: 'Emoties (emotions)',
  description: 'Ik ben blij, moe, bang… How you feel and how to say it.',
  unit: 'emoties',
  level: 'A1',
  ruleHint: 'Feelings use "zijn" + an adjective: ik ben blij, hij is moe.',
  writing: {
    task: 'Write how you feel today and why.',
    focus: 'describing feelings with zijn + an adjective (ik ben blij, moe, verdrietig…)',
  },
  items: [
    { prompt: '😊  Ik ben ___.', answer: 'blij', choices: ['blij', 'moe', 'bang', 'boos'], skill: 'vocab', explanation: 'blij = happy/glad.' },
    { prompt: '😢  Ik ben ___.', answer: 'verdrietig', choices: ['verdrietig', 'blij', 'moe', 'boos'], skill: 'vocab', explanation: 'verdrietig = sad.' },
    { prompt: '😨  Ik ben ___.', answer: 'bang', choices: ['bang', 'blij', 'verdrietig', 'moe'], skill: 'vocab', explanation: 'bang = scared.' },
    { prompt: '😴  Ik ben ___.', answer: 'moe', choices: ['moe', 'bang', 'boos', 'blij'], skill: 'vocab', explanation: 'moe = tired.' },
    { prompt: '😠  Ik ben ___.', answer: 'boos', choices: ['boos', 'blij', 'moe', 'bang'], skill: 'vocab', explanation: 'boos = angry.' },
    { prompt: 'Ik heb morgen een examen. Ik ben ___.', answer: 'zenuwachtig', choices: ['zenuwachtig', 'blij', 'moe'], skill: 'context', explanation: 'zenuwachtig = nervous.' },
    { prompt: 'Mijn kat is ziek. Ik ben ___.', answer: 'verdrietig', choices: ['verdrietig', 'blij', 'gelukkig'], skill: 'context', explanation: 'A sick cat makes you sad: verdrietig.' },
    { prompt: 'Ik heb vakantie! Ik ben ___.', answer: 'blij', choices: ['blij', 'verdrietig', 'boos'], skill: 'context', explanation: 'Holiday: blij (gelukkig would also work).' },
    { prompt: '🥰  Ik ben heel ___ met mijn familie.', answer: 'gelukkig', choices: ['gelukkig', 'bang', 'boos', 'moe'], skill: 'vocab', explanation: 'gelukkig = happy (deeply, in life).' },
    { prompt: 'Hoe gaat het met je?', answer: 'Goed, dank je!', choices: ['Goed, dank je!', 'Ik heet Anna.', 'Tot morgen!'], skill: 'greeting', explanation: '"Hoe gaat het?" asks how you are: Goed, dank je!' },
    { prompt: '"How are you?" (informal)', answer: 'Hoe gaat het?', choices: ['Hoe gaat het?', 'Hoe heet je?', 'Waar woon je?'], skill: 'greeting', explanation: 'Hoe gaat het (met je)? = how are you?' },
  ],
});
