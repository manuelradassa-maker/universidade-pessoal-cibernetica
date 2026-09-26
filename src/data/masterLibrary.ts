import { LibraryEntry, LibraryList } from '../types';
import { BOOKS_PESSOAL } from './library/booksPessoal';
import { BOOKS_NEGOCIOS } from './library/booksNegocios';
import { BOOKS_PENSAMENTO } from './library/booksPensamento';
import { normalizeTitle, runV8Audit } from './v8Framework';

/**
 * BIBLIOTECA MESTRE INTEGRADA (V8 — Step 1: Deduplicate)
 * As três listas mantêm-se separadas para preservar a sua função
 * (desenvolvimento pessoal, negócios, pensamento); a integração aplica
 * deduplicação real por título normalizado.
 */
export const MASTER_LIBRARY: LibraryEntry[] = [
  ...BOOKS_PESSOAL,
  ...BOOKS_NEGOCIOS,
  ...BOOKS_PENSAMENTO
];

const deduplicate = (entries: LibraryEntry[]): LibraryEntry[] => {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = normalizeTitle(entry.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/** Livros únicos da biblioteca integrada (cada obra conta uma só vez). */
export const UNIQUE_LIBRARY: LibraryEntry[] = deduplicate(MASTER_LIBRARY);

/** Obras que aparecem em mais do que uma lista (sobreposição declarada). */
export const OVERLAPPING_BOOKS: { title: string; lists: LibraryList[] }[] = (() => {
  const grouped = new Map<string, LibraryEntry[]>();
  MASTER_LIBRARY.forEach((entry) => {
    const key = normalizeTitle(entry.title);
    grouped.set(key, [...(grouped.get(key) || []), entry]);
  });
  return [...grouped.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      title: group[0].title,
      lists: [...new Set(group.map((g) => g.list))]
    }));
})();

/** Auditoria de conformidade executada sobre os dados reais (nunca estimada). */
export const V8_AUDIT = runV8Audit(MASTER_LIBRARY);

export const booksByList = (list: LibraryList): LibraryEntry[] =>
  MASTER_LIBRARY.filter((b) => b.list === list);

export const booksByStage = (
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
): LibraryEntry[] => MASTER_LIBRARY.filter((b) => b.stage === stage);

export const findBookByTitle = (title: string): LibraryEntry | undefined =>
  MASTER_LIBRARY.find((b) => normalizeTitle(b.title) === normalizeTitle(title));

/**
 * TIER 1 — "O Essencial 30" (V8 Step 6).
 * A promoção exige função de desenvolvimento, nunca fama.
 */
export const ESSENTIAL_TIER: LibraryEntry[] = MASTER_LIBRARY.filter((b) => b.tier === 1);

/* ------------------------------------------------------------------ */
/* Percursos de estudo (V8 Step 8)                                     */
/* ------------------------------------------------------------------ */

/** Route A — 18 livros, equilíbrio entre pessoa, pensamento e negócio. */
export const ROUTE_A_TITLES: string[] = [
  'Atomic Habits',
  'Make It Stick',
  'Deep Work',
  'Thinking, Fast and Slow',
  'How to Win Friends and Influence People',
  'Crucial Conversations',
  'The Psychology of Money',
  'The Mom Test',
  'The Lean Startup',
  'The Personal MBA',
  'Running Lean',
  'Good Strategy Bad Strategy',
  'High Output Management',
  'The Intelligent Investor',
  'Meditations',
  'The Good Life',
  'Thinking in Systems'
];

export const routeA = (): LibraryEntry[] =>
  ROUTE_A_TITLES.map((t) => findBookByTitle(t)).filter(
    (b): b is LibraryEntry => Boolean(b)
  );

/** Route B — Núcleo: Tier 1 e Tier 2 em ordem de estágio. */
export const routeB = (): LibraryEntry[] =>
  [...MASTER_LIBRARY]
    .filter((b) => b.tier === 1 || b.tier === 2)
    .sort((a, b) => a.stage - b.stage || a.rank - b.rank);

/** Route C — Mestria: biblioteca integrada completa, por estágio. */
export const routeC = (): LibraryEntry[] =>
  [...UNIQUE_LIBRARY].sort(
    (a, b) => a.stage - b.stage || a.list.localeCompare(b.list) || a.rank - b.rank
  );

export interface DevelopmentPhase {
  id: number;
  title: string;
  objective: string;
  capacities: string[];
  prerequisite: string;
  behavioralTest: string;
}

export const DEVELOPMENT_PHASES: DevelopmentPhase[] = [
  {
    id: 0,
    title: 'Fase 0 — Orientação e linha de base',
    objective: 'Estabelecer objetivos, capacidades atuais, restrições e sistema de leitura.',
    capacities: ['autodiagnóstico', 'planeamento realista'],
    prerequisite: 'Nenhum.',
    behavioralTest: 'Perfil do leitor preenchido com evidência e primeira fase agendada.'
  },
  {
    id: 1,
    title: 'Fase 1 — Autodomínio',
    objective: 'Construir agência, hábitos, saúde, foco e regulação emocional.',
    capacities: ['atenção', 'hábitos', 'sono', 'regulação emocional'],
    prerequisite: 'Fase 0 concluída.',
    behavioralTest: 'Rotina observável mantida com registo de evidência.'
  },
  {
    id: 2,
    title: 'Fase 2 — Aprendizagem e raciocínio',
    objective: 'Desenvolver leitura, lógica, literacia científica e autocorreção.',
    capacities: ['aprendizagem', 'lógica', 'estatística básica', 'humildade intelectual'],
    prerequisite: 'Consistência mínima da Fase 1.',
    behavioralTest: 'Explica um modelo sem notas e identifica um enviesamento próprio.'
  },
  {
    id: 3,
    title: 'Fase 3 — Comunicação e relações',
    objective: 'Desenvolver empatia, expressão, escuta, limites, negociação e conflito.',
    capacities: ['comunicação', 'conflito', 'limites', 'negociação'],
    prerequisite: 'Raciocínio claro o suficiente para não escalar conflitos.',
    behavioralTest: 'Resolve uma conversa difícil com acordo concreto.'
  },
  {
    id: 4,
    title: 'Fase 4 — Criação de valor',
    objective: 'Identificar problemas reais, construir competência útil e servir necessidades.',
    capacities: ['seleção de problema', 'competência técnica', 'venda inicial'],
    prerequisite: 'Capacidade de falar com pessoas reais sobre problemas reais.',
    behavioralTest: 'Entrevistas feitas e primeira oferta apresentada a um cliente real.'
  },
  {
    id: 5,
    title: 'Fase 5 — Fundamentos de empreendedorismo',
    objective: 'Dominar mercados, clientes, ofertas, vendas, marketing e entrega.',
    capacities: ['descoberta de cliente', 'oferta', 'aquisição', 'entrega'],
    prerequisite: 'Problema validado por evidência de terceiros.',
    behavioralTest: 'Primeira receita registada com custo e margem conhecidos.'
  },
  {
    id: 6,
    title: 'Fase 6 — Construção de um negócio real',
    objective: 'Finanças, operações, gestão, sistemas e execução repetível.',
    capacities: ['controlo financeiro', 'processos', 'gestão de equipa'],
    prerequisite: 'Oferta que já vende de forma repetida.',
    behavioralTest: 'Processo documentado, contas fechadas e margem positiva.'
  },
  {
    id: 7,
    title: 'Fase 7 — Sistemas, estratégia e liderança',
    objective: 'Incentivos, concorrência, organização e pensamento de longo prazo.',
    capacities: ['estratégia', 'sistemas', 'liderança', 'governança'],
    prerequisite: 'Negócio operacional com dados fiáveis.',
    behavioralTest: 'Decisão estratégica documentada com trade-offs explícitos.'
  },
  {
    id: 8,
    title: 'Fase 8 — Propriedade e alocação de capital',
    objective: 'Investimento, aquisições, risco e mordomia de recursos.',
    capacities: ['alocação de capital', 'avaliação', 'risco'],
    prerequisite: 'Capacidade demonstrada de gerar e preservar caixa.',
    behavioralTest: 'Análise de investimento escrita com margem de segurança.'
  },
  {
    id: 9,
    title: 'Fase 9 — Filosofia, sentido e sabedoria',
    objective: 'Integrar ética, mortalidade, serviço, propósito e legado.',
    capacities: ['ética', 'sabedoria prática', 'serviço', 'legado'],
    prerequisite: 'Responsabilidade real já exercida.',
    behavioralTest: 'Código ético escrito e aplicado numa decisão com custo pessoal.'
  }
];


