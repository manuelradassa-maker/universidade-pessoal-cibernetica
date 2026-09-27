/**
 * UNIVERSIDADE PESSOAL CIBERNÉTICA — Modelo de domínio canónico (V8)
 * ------------------------------------------------------------------
 * Este ficheiro é a única fonte de verdade dos tipos. Nenhum componente
 * deve usar campos que não existam aqui (rigor de contrato TypeScript,
 * exigido pela "FINAL QUALITY-CONTROL AUDIT" do Prompt Mestre V8).
 */

/** Os 4 pilares do Vitruvian System (organiza QUEM está a aprender). */
export type VitruvianPillar = 'mente' | 'intelecto' | 'corpo_acao' | 'proposito';

export type PillarStatus = 'forca' | 'gargalo_atual' | 'nao_avaliado_ainda';

export interface PillarInfo {
  id: VitruvianPillar;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  status: PillarStatus;
  score: number; // 0 a 100 — nível observável, nunca autorreportado
  notes: string;
  invisibleModules?: string[];
}

/* ------------------------------------------------------------------ */
/* V8 — Estágios, domínios, profundidade de leitura e evidência        */
/* ------------------------------------------------------------------ */

/** Stages 1–8 do V8 Master Prompt ("DEVELOPMENTAL-STAGE MODEL"). */
export type V8StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface V8Stage {
  id: V8StageId;
  title: string;
  focuses: string[];
  prerequisite: string;
}

/** Profundidade de leitura — V8 Secção 11 (Motor Adaptativo). */
export type ReadDepth =
  | 'Master'
  | 'Study'
  | 'Read'
  | 'Selective'
  | 'Reference'
  | 'Summary Sufficient'
  | 'Defer'
  | 'Skip';

/** Papel funcional de cada livro — V8 Secção 10 (Motor Adaptativo). */
export type BookRole =
  | 'Fundação'
  | 'Corretivo'
  | 'Ferramenta'
  | 'Estudo de Caso'
  | 'Contraponto'
  | 'Síntese'
  | 'Referência'
  | 'Exploração';

/** Classificação epistémica — V8 "REQUIRED CRITICAL ANALYSIS". */
export type EvidenceClass =
  | 'Suportado por fontes'
  | 'Inferência razoável'
  | 'Julgamento editorial'
  | 'Dependente de contexto'
  | 'Ideia contestada';

/** As três listas mestre do Prompt V8. */
export type LibraryList = 'pessoal' | 'negocios' | 'pensamento';

/** Os 4 níveis da biblioteca integrada — V8 Secção 6 (Step 6). */
export type LibraryTier = 1 | 2 | 3 | 4;

/**
 * Registo canónico de livro: contém todos os campos exigidos pela secção
 * "CANONICAL BOOK RECORD" do Prompt Mestre V8.
 */
export interface LibraryEntry {
  rank: number; // rank dentro da lista (1–100 / 1–50)
  list: LibraryList;
  title: string;
  author: string;
  year: number;
  domain: string;
  stage: V8StageId;
  difficulty: 1 | 2 | 3 | 4 | 5;
  durationOrPages: string;
  coreContribution: string;
  whyIncluded: string;
  whatItDevelops: string;
  bestPracticalApplication: string;
  criticalWarning: string;
  readDepth: ReadDepth;
  role: BookRole;
  evidenceClass: EvidenceClass;
  tier: LibraryTier;
  rereadValue: 'Alto' | 'Médio' | 'Baixo';
}

/** Verificação individual da auditoria automática de conformidade V8. */
export interface V8AuditCheck {
  id: string;
  label: string;
  expectation: string;
  observed: string;
  status: 'ok' | 'aviso' | 'falha';
  detail: string;
}

export interface V8AuditReport {
  generatedAt: string;
  checks: V8AuditCheck[];
  totals: {
    pessoal: number;
    negocios: number;
    pensamento: number;
    unique: number;
    duplicates: number;
  };
  passed: number;
  warnings: number;
  failures: number;
}

/* ------------------------------------------------------------------ */
/* Perfil do Leitor (V8 — componente 3 do sistema)                     */
/* ------------------------------------------------------------------ */

export type ContentFormat = 'livros' | 'audiovisual' | 'misto';

export interface LearnerProfileData {
  // 1. Identidade e contexto
  targetPerson: string;
  ageOrMaturity: string;
  countryContext: string;
  primaryLanguage: string;
  currentRoleAndStage: string;

  // 2. Direção de longo prazo
  desiredIdentity: string;
  topLongTermOutcomes: string;
  primaryLongTermGoal: string;

  // 3. Prioridade 90 dias
  urgentCurrentProblem: string;
  target90DaysResult: string;
  activeProject: string;
  evidenceProgressMade: string;

  // 4. Capacidades atuais (0–5, validadas por evidência)
  capabilities: {
    selfDiscipline: number;
    focus: number;
    habitConsistency: number;
    emotionalRegulation: number;
    physicalEnergy: number;
    learningAbility: number;
    criticalThinking: number;
    salesAndOffers: number;
    businessStrategy: number;
  };

  // 5. Histórico de leitura e preferências
  completedBooks: string;
  dislikedOrAbandoned: string;
  contentPreference: ContentFormat;
  weeklyHoursAvailable: number;
  learningPreferencesNotes: string;

  // 6. Padrões, bloqueios e ambiente de aplicação
  repeatedMistakeOrDistraction: string;
  currentBottleneckPillar: VitruvianPillar;
  currentBottleneck: string;
  weakPoints: string;
  applicationEnvironment: string;
}

/** Tipo de identidade visual: foto real carregada ou emoji escolhido. */
export type AvatarType = 'image' | 'emoji';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  /** Foto de perfil (dataURL) ou emoji. */
  avatar: string;
  avatarType: 'image' | 'emoji';
  learnerData: LearnerProfileData;
  /** Respostas integrais aos 13 blocos do LEARNER PROFILE INPUT do V8. */
  v8Intake?: Record<string, string>;
  evaluated: boolean;
  systemMode: 'normal' | 'modo_a_baixa_energia' | 'modo_b_falha_critica';
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Recurso curado (prescrição ativa da fase prática)                   */
/* ------------------------------------------------------------------ */

export interface CurriculumResource {
  id: string;
  title: string;
  creator: string;
  type: 'livro' | 'documentario' | 'serie' | 'filme';
  year: number;
  pillar: VitruvianPillar;
  list: LibraryList;
  stage: V8StageId;
  domain: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado';
  durationOrPages: string;
  coreContribution: string;
  whyIncluded: string;
  whatItDevelops: string;
  bestPracticalApplication: string;
  criticalWarning: string;
  readDepth: ReadDepth;
  role: BookRole;
  evidenceClass: EvidenceClass;
}

/* ------------------------------------------------------------------ */
/* Fase prática (V8 — entrega restrita por fases)                      */
/* ------------------------------------------------------------------ */

export interface PracticalPhase {
  id: string;
  phaseNumber: number;
  title: string;
  durationWeeks: number;
  pillar: VitruvianPillar;
  stage: V8StageId;
  objective: string;
  whyItComesNow: string;
  whatIsDeliberatelyPostponed: string[];
  /** Livros adiados de propósito, com motivo (proteção contra precocidade). */
  deferredResources: string[];
  mainResource: CurriculumResource;
  optionalResource?: CurriculumResource;
  chaptersToReadOrEpisodes: string;
  weeklyReadingTarget: string;
  realWorldProject: {
    title: string;
    description: string;
    deliverable: string;
    measurement: string;
    evidenceRequired: string;
  };
  applicationProject: {
    realWorldObjective: string;
    deliverable: string;
    measurementCriteria: string;
    evidenceProofRequired: string;
  };
  weeklyPlan: {
    week: number;
    focus: string;
    actions: string[];
    measurableMetric: string;
  }[];
  assessment: {
    comprehensionQuestion: string;
    retrievalQuestion: string;
    decisionJournalPrompt: string;
    counterargumentExercise: string;
  };
  behavioralGraduationCriteria: string[];
  /** Alias canónico usado pelo Handoff. */
  completionCriteria: string[];
}

/* ------------------------------------------------------------------ */
/* Revisões — V8 Secção 19 (semanal / livro / fase)                    */
/* ------------------------------------------------------------------ */

export interface ReviewEntry {
  id: string;
  type: 'semanal' | 'livro' | 'fase';
  date: string;
  completedChaptersOrEpisodes: string;
  timeSpent: string;
  keyIdeas: string;
  appliedAction: string;
  resultObtained: string;
  difficulties: string;
  avoided: string;
  adjustmentsNeeded: string;
  canExplainWithoutNotes: boolean;
  pillarUpdated: VitruvianPillar;
}

/* ------------------------------------------------------------------ */
/* Mentora IA                                                          */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  timestamp: string;
  text: string;
  suggestedAction?: string;
  isModeA?: boolean;
  isModeB?: boolean;
}

/* ------------------------------------------------------------------ */
/* Comunidade & Pares — apenas dados reais, nunca fabricados           */
/* ------------------------------------------------------------------ */

export interface PeerAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarType: 'image' | 'emoji';
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorAvatarType: 'image' | 'emoji';
  authorEmail: string;
  text: string;
  timestamp: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar: string;
  authorAvatarType: 'image' | 'emoji';
  authorEmail: string;
  pillar: VitruvianPillar;
  title: string;
  content: string;
  evidenceType: 'resultado' | 'projeto' | 'habito' | 'reflexao';
  evidenceProof: string;
  likes: number;
  likedBy: string[]; // IDs de contas reais que validaram
  comments: CommunityComment[];
  timestamp: string;
  createdAt: string;
}

export interface CommunityStore {
  posts: CommunityPost[];
  peers: PeerAccount[];
}


