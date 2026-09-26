import { PillarInfo, PracticalPhase, LearnerProfileData } from '../types';
import { CANONICAL_RESOURCES } from './curriculumData';

export const INITIAL_LEARNER_DATA: LearnerProfileData = {
  targetPerson: 'Eu próprio',
  ageOrMaturity: 'Jovem Adulto (18-25 anos)',
  countryContext: 'Portugal / Brasil',
  primaryLanguage: 'Português',
  currentRoleAndStage: 'Estudante e aspirante a construtor de projetos de alto valor',
  desiredIdentity: 'Um indivíduo disciplinado, emocionalmente estável, com raciocínio crítico rigoroso e capacidade de execução no mercado real.',
  topLongTermOutcomes: '1. Autodomínio físico e mental\n2. Independência económica através de competências reais\n3. Sabedoria prática e clareza de pensamento',
  primaryLongTermGoal: 'Construir um ecossistema sustentável de valor e manter clareza cognitiva.',
  urgentCurrentProblem: 'Inconsistência na execução diária e vulnerabilidade à dispersão digital.',
  target90DaysResult: 'Estabelecer bloco matinal de 90 minutos de trabalho focado e validar primeira entrega real.',
  activeProject: 'Protocolo de Execução Diária Inquebrável',
  evidenceProgressMade: 'Tentativas de rotina matinal com interrupções frequentes.',
  capabilities: {
    selfDiscipline: 2,
    focus: 2,
    habitConsistency: 1,
    emotionalRegulation: 2,
    physicalEnergy: 3,
    learningAbility: 3,
    criticalThinking: 2,
    salesAndOffers: 1,
    businessStrategy: 1
  },
  completedBooks: 'Nenhum livro técnico concluído com anotação ativa recente.',
  dislikedOrAbandoned: 'Livros de autoajuda vazia e promessas de sucesso sem evidência.',
  contentPreference: 'livros',
  weeklyHoursAvailable: 8,
  learningPreferencesNotes: 'Prefere materiais com exemplos reais, modelos mentais claros e aplicação imediata.',
  repeatedMistakeOrDistraction: 'Consumir tutoriais e vídeos sem produzir um entregável concreto.',
  currentBottleneckPillar: 'corpo_acao',
  currentBottleneck: 'Inconsistencia diaria e vulnerabilidade a distracao digital',
  weakPoints: 'Procrastinacao, dispersao de atencao, ausencia de sistema de registo',
  applicationEnvironment: 'Projetos pessoais, estudo formal e rotinas diarias'
};

export const INITIAL_PILLARS: PillarInfo[] = [
  {
    id: 'mente',
    title: 'Mente',
    subtitle: 'Cognitive Interface',
    emoji: '🧠',
    description: 'Pensamento racional, autoconsciência e separação rigorosa entre facto objetivo e interpretação subjetiva.',
    status: 'nao_avaliado_ainda',
    score: 50,
    notes: 'Aguardando diagnóstico conversacional inicial.',
    invisibleModules: [
      'Deteção de inferências automáticas',
      'Reconhecimento de padrões e loops reativos',
      'Verificação de proporcionalidade (emoção vs. realidade)',
      'Geração de alternativas racionais'
    ]
  },
  {
    id: 'intelecto',
    title: 'Intelecto',
    subtitle: 'Estrutura de Conhecimento',
    emoji: '📚',
    description: 'Organização dinâmica do saber: leitura ativa, modelos mentais, repetição espaçada e retenção factual.',
    status: 'nao_avaliado_ainda',
    score: 50,
    notes: 'Aguardando diagnóstico conversacional inicial.',
    invisibleModules: [
      'Leitura Inspecional e Sintópica',
      'Modelos Mentais Multidisciplinares',
      'Pensamento Probabilístico e Calibração'
    ]
  },
  {
    id: 'corpo_acao',
    title: 'Corpo & Ação',
    subtitle: 'Camada de Execução',
    emoji: '⚡',
    description: 'Disciplina física, regulação do sono, hábitos inegociáveis e métricas quantitativas com evidência observável.',
    status: 'gargalo_atual',
    score: 35,
    notes: 'Gargalo prioritário identificado no Perfil do Leitor V8: vulnerabilidade a distrações e falta de consistência diária observável.',
    invisibleModules: [
      'Higiene Circadiana & Sono Otimizado',
      'Regra dos 2 Minutos & Habit Stacking',
      'Aferição por Evidência Real (não sentimentos)'
    ]
  },
  {
    id: 'proposito',
    title: 'Propósito',
    subtitle: 'Externalização de Valor',
    emoji: '🎯',
    description: 'Direção existencial, projetos com entrega real no mundo, criação de valor económico e espírito de serviço.',
    status: 'nao_avaliado_ainda',
    score: 50,
    notes: 'Aguardando consolidação do autodomínio prático.',
    invisibleModules: [
      'Equação de Criação de Valor Real',
      'Validação de Oferta & Mercado',
      'Filosofia de Serviço e Legado'
    ]
  }
];

export const INITIAL_PHASE_EXECUTION: PracticalPhase = {
  id: 'v8-fase-1-autodominio',
  phaseNumber: 1,
  title: 'Fase 1: Autodomínio, Arquitetura de Atenção e Fundamentos de Ação',
  durationWeeks: 4,
  pillar: 'corpo_acao',
  stage: 1,
  objective: 'Construir a base inegociável de agência pessoal, regular o sono e a atenção, e converter intenções abstratas em 90 minutos de execução focada por dia.',
  whyItComesNow: 'O V8 Master Prompt e o Vitruvian System estabelecem como pré-requisito absoluto o autodomínio (Stage 1) antes de qualquer empreendimento, estratégia avançada ou estudo filosófico profundo. Sem consistência observável diária, qualquer outra leitura torna-se mero entretenimento passivo.',
  whatIsDeliberatelyPostponed: [
    'The 48 Laws of Power (Robert Greene) — Adiado para fases posteriores de estratégia institucional.',
    'Principles (Ray Dalio) — Adiado até o autodomínio diário e a disciplina básica estarem demonstrados em factos.',
    'Advanced Marketing & Persuasion — Adiado até haver capacidade comprovada de entrega e criação de valor.'
  ],
  mainResource: CANONICAL_RESOURCES.find((r) => r.title === 'Atomic Habits')!,
  optionalResource: CANONICAL_RESOURCES.find((r) => r.title === 'Free Solo'),
  chaptersToReadOrEpisodes: 'Capítulos 1 a 13 (As Quatro Leis da Mudança de Comportamento)',
  weeklyReadingTarget: '3 a 4 capítulos por semana com anotação seletiva e aplicação imediata',
  applicationProject: {
    realWorldObjective: 'Instalação do Bloco de Ouro Diário (90 minutos sem ecrãs secundários)',
    deliverable: 'Diário de Bordo de 21 dias consecutivos com registo exato de início, fim e entregável tangível concluído a cada sessão.',
    measurementCriteria: 'Taxa de aderência mínima de 80% nos 21 dias (mínimo 17 sessões de 90m realizadas sem quebra de foco).',
    evidenceProofRequired: 'Fotografia das páginas do diário físico ou captura de ecrã do relatório de atividade com carimbo temporal.'
  },
  weeklyPlan: [
    {
      week: 1,
      focus: 'Auditoria de Hábitos e Eliminação de Atritos Ambientais',
      actions: [
        'Registar todas as ações diárias sem interrupções para mapear gatilhos de distração.',
        'Eliminar os 2 maiores atritos físicos para o hábito do Bloco de Ouro.',
        'Ler Capítulos 1 a 4 de Atomic Habits (ou assistir ao documentário Free Solo).'
      ],
      measurableMetric: '3 dias seguidos de mapeamento de tempo concluídos.'
    },
    {
      week: 2,
      focus: 'Instalação da Regra dos 2 Minutos e Quarentena Matinal',
      actions: [
        'Executar o Bloco de Ouro logo pela manhã com telemóvel desligado noutra divisão.',
        'Registar horário exato de início num diário de bordo.',
        'Ler Capítulos 5 a 8.'
      ],
      measurableMetric: 'Mínimo de 5 blocos matinais ininterruptos de 90m validados.'
    },
    {
      week: 3,
      focus: 'Engenharia de Recompensas e Ajuste de Dificuldade',
      actions: [
        'Organizar espaço físico de trabalho: apenas o material do projeto ativo visível.',
        'Estabelecer gatilho imediato pós-sessão de foco.',
        'Ler Capítulos 9 a 13.'
      ],
      measurableMetric: 'Taxa de conclusão superior a 80% nos 7 dias da semana.'
    },
    {
      week: 4,
      focus: 'Consolidação, Teste de Feynman e Revisão de Fim de Fase',
      actions: [
        'Completar a leitura e teste de explicação sem notas.',
        'Submeter a Revisão de Fim de Fase na aplicação com evidências factuais.',
        'Preparar os dados para autorizar a transição para a Fase 2 (Mente/Intelecto).'
      ],
      measurableMetric: 'Documento de Revisão da Fase 1 submetido à Mentora IA.'
    }
  ],
  assessment: {
    comprehensionQuestion: 'De acordo com a evidência de James Clear, por que razão as metas falham quando não estão ancoradas em sistemas e identidade?',
    retrievalQuestion: 'Quais são as quatro leis da mudança de comportamento e como se aplica a sua inversão para quebrar um mau hábito?',
    decisionJournalPrompt: 'Identifica uma situação concreta desta semana em que sentiste o impulso de procrastinar. Que atrito ambiental podes instalar para impedir essa falha no futuro?',
    counterargumentExercise: 'Analise criticamente: Em que circunstâncias uma obsessão rígida com micro-hábitos pode impedir a tomada de riscos estratégicos maiores?'
  },
  behavioralGraduationCriteria: [
    'Mínimo de 17 blocos de 90 minutos de foco registados e validados por evidência.',
    'Redução observável do tempo de distração digital comprovada por métricas.',
    'Capacidade demonstrada de explicar os modelos de hábitos sem consulta a notas.',
    'Revisão semanal submetida sem omissões.'
  ],
  completionCriteria: [
    'Mínimo de 17 blocos de 90 minutos de foco registados e validados por evidência.',
    'Redução observável do tempo de distração digital comprovada por métricas.',
    'Capacidade demonstrada de explicar os modelos de hábitos sem consulta a notas.',
    'Revisão semanal submetida sem omissões.'
  ],
  deferredResources: [
    'The 48 Laws of Power (Robert Greene) — adiado por risco de distorção sem base de poder real.',
    'Principles (Ray Dalio) — adiado até o autodomínio diário estar demonstrado em factos.',
    'Marketing e persuasão avançada — adiados até haver capacidade comprovada de entrega.'
  ],
  realWorldProject: {
    title: 'Bloco de Ouro Diário (90 minutos sem ecrãs secundários)',
    description: 'Instalar e manter um bloco matinal diário de foco profundo com registo auditável.',
    deliverable: 'Diário de Bordo de 21 dias com registo de início, fim e entregável por sessão.',
    measurement: 'Aderência mínima de 80% nos 21 dias (mínimo 17 sessões sem quebra de foco).',
    evidenceRequired: 'Fotografia do diário físico ou captura de ecrã com carimbo temporal.'
  }
};

// 100% de publicações reais — nada falso, gerado diretamente da base do utilizador e pares conectados

// Mantido por compatibilidade temporaria; o feed usa a loja real em data/community.ts
export const INITIAL_COMMUNITY_POSTS: never[] = [];
