import { CurriculumResource, LibraryEntry, VitruvianPillar } from '../types';
import { findBookByTitle } from './masterLibrary';

/**
 * PRESCRIÇÕES CURADAS (recursos de fase)
 * ------------------------------------------------------------------
 * Aplicação prática do V8 (Step 1 — Deduplicate): os livros prescritos NÃO
 * são duplicados aqui. O registo canónico vive na biblioteca mestre e esta
 * camada acrescenta apenas o que é específico da prescrição (pilar do
 * Vitruvian System e formato do recurso).
 */

type PillarLink = { title: string; pillar: VitruvianPillar; type: CurriculumResource['type'] };

const DIFFICULTY_LABEL: Record<number, CurriculumResource['difficulty']> = {
  1: 'Iniciante',
  2: 'Iniciante',
  3: 'Intermédio',
  4: 'Avançado',
  5: 'Avançado'
};

const fromLibrary = (link: PillarLink): CurriculumResource | undefined => {
  const entry: LibraryEntry | undefined = findBookByTitle(link.title);
  if (!entry) return undefined;
  return {
    id: `res-${entry.list}-${entry.rank}`,
    title: entry.title,
    creator: entry.author,
    type: link.type,
    year: entry.year,
    pillar: link.pillar,
    list: entry.list,
    stage: entry.stage,
    domain: entry.domain,
    difficulty: DIFFICULTY_LABEL[entry.difficulty],
    durationOrPages: entry.durationOrPages,
    coreContribution: entry.coreContribution,
    whyIncluded: entry.whyIncluded,
    whatItDevelops: entry.whatItDevelops,
    bestPracticalApplication: entry.bestPracticalApplication,
    criticalWarning: entry.criticalWarning,
    readDepth: entry.readDepth,
    role: entry.role,
    evidenceClass: entry.evidenceClass
  };
};

const LIBRARY_PRESCRIPTIONS: PillarLink[] = [
  { title: 'Atomic Habits', pillar: 'corpo_acao', type: 'livro' },
  { title: 'Deep Work', pillar: 'corpo_acao', type: 'livro' },
  { title: 'Make It Stick', pillar: 'intelecto', type: 'livro' },
  { title: 'Thinking, Fast and Slow', pillar: 'mente', type: 'livro' },
  { title: 'Superforecasting', pillar: 'mente', type: 'livro' },
  { title: 'The Mom Test', pillar: 'proposito', type: 'livro' },
  { title: 'The Personal MBA', pillar: 'proposito', type: 'livro' },
  { title: '$100M Offers', pillar: 'proposito', type: 'livro' },
  { title: 'Meditations', pillar: 'proposito', type: 'livro' },
  { title: 'Thinking in Systems', pillar: 'intelecto', type: 'livro' }
];

/**
 * Recursos audiovisuais curados. Não existem na lista de livros (não são
 * livros) e por isso têm registo canónico completo explícito.
 */
const DOCUMENTARY_PRESCRIPTIONS: CurriculumResource[] = [
  {
    id: 'doc-social-dilemma',
    title: 'The Social Dilemma',
    creator: 'Jeff Orlowski',
    type: 'documentario',
    year: 2020,
    pillar: 'mente',
    list: 'pessoal',
    stage: 1,
    domain: 'Atenção',
    difficulty: 'Iniciante',
    durationOrPages: '1h 34m',
    coreContribution:
      'Exame da economia da atenção e da engenharia comportamental aplicada a interfaces digitais.',
    whyIncluded:
      'Dá evidência direta de engenheiros de produto sobre como as interfaces exploram vulnerabilidades humanas.',
    whatItDevelops: 'Consciência dos incentivos que competem pela sua atenção.',
    bestPracticalApplication:
      'Eliminar notificações não essenciais e fixar uma quarentena digital matinal de 90 minutos.',
    criticalWarning:
      'Algumas cenas são dramatizações ficcionadas; separar encenação de testemunho factual.',
    readDepth: 'Study',
    role: 'Corretivo',
    evidenceClass: 'Suportado por fontes'
  },
  {
    id: 'doc-free-solo',
    title: 'Free Solo',
    creator: 'Elizabeth Chai Vasarhelyi & Jimmy Chin',
    type: 'documentario',
    year: 2018,
    pillar: 'corpo_acao',
    list: 'pessoal',
    stage: 1,
    domain: 'Atenção',
    difficulty: 'Iniciante',
    durationOrPages: '1h 40m',
    coreContribution:
      'Preparação obsessiva e execução sem margem de erro em escalada livre de 900 metros.',
    whyIncluded:
      'Mostra protocolo, repetição e gestão de medo em ambiente onde o erro é terminal.',
    whatItDevelops: 'Disciplina de preparação e concentração sob risco.',
    bestPracticalApplication:
      'Escolher uma competência crítica e praticá-la por etapas com verificação antes de executar.',
    criticalWarning:
      'Romantiza risco extremo e custo familiar; não é modelo de vida, é modelo de preparação.',
    readDepth: 'Read',
    role: 'Estudo de Caso',
    evidenceClass: 'Julgamento editorial'
  },
  {
    id: 'doc-jiro',
    title: 'Jiro Dreams of Sushi',
    creator: 'David Gelb',
    type: 'documentario',
    year: 2011,
    pillar: 'proposito',
    list: 'pessoal',
    stage: 8,
    domain: 'Propósito',
    difficulty: 'Iniciante',
    durationOrPages: '1h 21m',
    coreContribution:
      'Dedicação ao ofício até à maestria pela repetição diária durante décadas.',
    whyIncluded:
      'Contraste direto com a cultura de atalhos e de consumo rápido.',
    whatItDevelops: 'Paciência de longo prazo e respeito pelo detalhe.',
    bestPracticalApplication:
      'Identificar a competência central que entrega o seu valor e praticá-la diariamente com atenção ao detalhe.',
    criticalWarning:
      'Retrata sacrifício familiar elevado; exige reflexão crítica sobre equilíbrio de vida.',
    readDepth: 'Read',
    role: 'Estudo de Caso',
    evidenceClass: 'Julgamento editorial'
  }
];

export const CANONICAL_RESOURCES: CurriculumResource[] = [
  ...LIBRARY_PRESCRIPTIONS.map(fromLibrary).filter(
    (r): r is CurriculumResource => Boolean(r)
  ),
  ...DOCUMENTARY_PRESCRIPTIONS
];

export const resourcesByPillar = (pillar: VitruvianPillar): CurriculumResource[] =>
  CANONICAL_RESOURCES.filter((r) => r.pillar === pillar);
