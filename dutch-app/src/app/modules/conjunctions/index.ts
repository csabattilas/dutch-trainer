import type { Exercise, ExerciseModule } from '../../core/types';
import { pick, shuffle } from '../../core/util';

type Connector = 'want' | 'omdat' | 'daarom';

interface Clause {
  subj: string;
  verb: string;
  /** Everything after the verb in a normal main clause. Never empty, otherwise
   *  normal and verb-final order would look the same. */
  rest: string;
}

interface Pair {
  main: Clause;
  reason: Clause;
}

// Single-verb clauses only: with two verbs (moet ... werken) Dutch allows both cluster
// orders after omdat, so there would be more than one correct answer.
const PAIRS: Pair[] = [
  { main: { subj: 'ik', verb: 'blijf', rest: 'thuis' }, reason: { subj: 'ik', verb: 'ben', rest: 'moe' } },
  { main: { subj: 'ik', verb: 'eet', rest: 'een boterham' }, reason: { subj: 'ik', verb: 'heb', rest: 'honger' } },
  { main: { subj: 'ik', verb: 'draag', rest: 'een jas' }, reason: { subj: 'het', verb: 'is', rest: 'koud' } },
  { main: { subj: 'ik', verb: 'neem', rest: 'een paraplu mee' }, reason: { subj: 'het', verb: 'regent', rest: 'hard' } },
  { main: { subj: 'wij', verb: 'gaan', rest: 'naar het park' }, reason: { subj: 'het', verb: 'is', rest: 'mooi weer' } },
  { main: { subj: 'ik', verb: 'ben', rest: 'blij' }, reason: { subj: 'ik', verb: 'heb', rest: 'vakantie' } },
  { main: { subj: 'hij', verb: 'is', rest: 'verdrietig' }, reason: { subj: 'zijn kat', verb: 'is', rest: 'ziek' } },
  { main: { subj: 'ik', verb: 'leer', rest: 'Nederlands' }, reason: { subj: 'ik', verb: 'woon', rest: 'in Nederland' } },
  { main: { subj: 'ik', verb: 'ga', rest: 'vroeg naar bed' }, reason: { subj: 'ik', verb: 'werk', rest: 'morgen' } },
  { main: { subj: 'wij', verb: 'blijven', rest: 'binnen' }, reason: { subj: 'het', verb: 'sneeuwt', rest: 'veel' } },
];

const normal = (c: Clause) => `${c.subj} ${c.verb} ${c.rest}`;
const inverted = (c: Clause) => `${c.verb} ${c.subj} ${c.rest}`;
const verbFinal = (c: Clause) => `${c.subj} ${c.rest} ${c.verb}`;

/** The first part (given) and the clause after the connector (what the learner gets right or wrong). */
export function connect(pair: Pair, conn: Connector): { lead: string; clause: string; wrong: string[] } {
  switch (conn) {
    case 'want':
      return {
        lead: `${normal(pair.main)}, want`,
        clause: normal(pair.reason),
        wrong: [verbFinal(pair.reason), inverted(pair.reason)],
      };
    case 'omdat':
      return {
        lead: `${normal(pair.main)}, omdat`,
        clause: verbFinal(pair.reason),
        wrong: [normal(pair.reason), inverted(pair.reason)],
      };
    case 'daarom':
      return {
        lead: `${normal(pair.reason)}, daarom`,
        clause: inverted(pair.main),
        wrong: [normal(pair.main), verbFinal(pair.main)],
      };
  }
}

const RULE: Record<Connector, string> = {
  want: '"want" keeps normal order: subject, then verb.',
  omdat: '"omdat" sends the verb to the end of its clause.',
  daarom: '"daarom" takes the first position, so the verb comes straight after it (inversion).',
};

export const conjunctions: ExerciseModule = {
  id: 'conjunctions',
  title: 'want / omdat / daarom',
  description: 'Same reason, three word orders: normal, verb at the end, inversion.',
  units: ['zinsbouw'],
  writing: {
    task: 'Give a reason for something you do, using want, omdat or daarom.',
    focus: 'word order after want (normal order), omdat (verb at the end) and daarom (inversion)',
  },
  generate(rng, count) {
    const out: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const pair = pick(rng, PAIRS);
      const conn = pick(rng, ['want', 'omdat', 'daarom'] as Connector[]);
      const { lead, clause, wrong } = connect(pair, conn);
      const verb = conn === 'daarom' ? pair.main.verb : pair.reason.verb;
      const base = {
        skill: `conjunctions/${conn}`,
        module: 'conjunctions',
        unit: 'zinsbouw',
        level: 'A2' as const,
        hints: [RULE[conn], `The verb in that part is "${verb}".`],
        explanation: `${RULE[conn]} So: ${lead} ${clause}.`,
      };
      if (rng() < 0.5) {
        const answer = `${lead} ${clause}`;
        out.push({
          ...base,
          prompt: 'Which sentence is correct?',
          answer,
          choices: shuffle(rng, [answer, ...wrong.map((w) => `${lead} ${w}`)]),
        });
      } else {
        out.push({
          ...base,
          prompt: `Finish the sentence: "${lead} …"`,
          answer: clause,
          tiles: shuffle(rng, clause.split(' ')),
          asChoice: { prompt: `How does it continue? "${lead} …"`, choices: shuffle(rng, [clause, ...wrong]) },
        });
      }
    }
    return out;
  },
};

export { PAIRS };
