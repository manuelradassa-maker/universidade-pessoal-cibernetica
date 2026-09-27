import type {
  PillarInfo,
  PracticalPhase,
  ReviewEntry,
  UserProfile,
  VitruvianPillar,
  ChatMessage,
} from '../types';
import {
  INITIAL_LEARNER_DATA,
  INITIAL_PHASE_EXECUTION,
  INITIAL_PILLARS,
} from '../data/defaultState';
import type { AppRole, AppUser } from './supabase';

/**
 * PONTE AppUser <-> UserProfile
 * ------------------------------------------------------------------
 * O painel de gestão autentica contas como `AppUser` (id, username,
 * role) no Supabase. O motor de aprendizagem (Mentora, Vitruvian,
 * Fase V8, Comunidade) trabalha com `UserProfile` e histórico local.
 *
 * Este módulo é o único sítio onde os dois mundos se encontram.
 * O progresso fica em `localStorage`, separado por conta, e cada
 * chave começa com o id real do utilizador autenticado — nunca há
 * dados partilhados entre contas no mesmo dispositivo.
 *
 * LIMITAÇÃO CONHECIDA (deliberada nesta fase): o estado vive no
 * browser. Mudar de dispositivo não transporta o progresso. A
 * migração para uma tabela `learner_state` no Supabase é o passo
 * seguinte e não exige alterações a este contrato.
 *
 * ACTUALIZAÇÃO (P1): o estado também vive na tabela `learner_state` e é
 * sincronizado por `hydrateLearnerState`/`queueLearnerPersist`
 * (`src/lib/learnerSync.ts`). O contrato acima mantém-se: o localStorage
 * é sempre a fonte do primeiro paint e a rede é uma melhoria por cima,
 * nunca um requisito — qualquer falha de rede, de RLS ou a tabela ainda
 * não aplicada faz a sincronização desligar-se em silêncio.
 */

const STORE_PREFIX = 'upc_learner_v1:';

export interface LearnerState {
  profile: UserProfile;
  pillars: PillarInfo[];
  activeBottleneck: VitruvianPillar;
  phase: PracticalPhase;
  phaseProgress: { activeWeek: number; completedTasks: Record<string, boolean> };
  reviews: ReviewEntry[];
  mentorMessages: ChatMessage[];
}

const ROLE_AVATAR: Record<AppRole, string> = {
  admin: '🛡️',
  partner: '🏛️',
  student: '🎓',
};

export const learnerStorageKey = (userId: string): string => `${STORE_PREFIX}${userId}`;

/** Constrói o perfil base a partir da conta autenticada. Nada é inventado: */
export const profileFromAppUser = (appUser: AppUser): UserProfile => ({
  id: appUser.id,
  name: appUser.username,
  email: `${appUser.username}@universidade.local`,
  avatar: ROLE_AVATAR[appUser.role] ?? '🎓',
  avatarType: 'emoji',
  learnerData: { ...INITIAL_LEARNER_DATA },
  evaluated: false,
  systemMode: 'normal',
  createdAt: new Date().toISOString(),
});

export const defaultLearnerState = (appUser: AppUser): LearnerState => ({
  profile: profileFromAppUser(appUser),
  pillars: INITIAL_PILLARS.map((pillar) => ({ ...pillar })),
  activeBottleneck: INITIAL_LEARNER_DATA.currentBottleneckPillar,
  phase: INITIAL_PHASE_EXECUTION,
  phaseProgress: { activeWeek: 1, completedTasks: {} },
  reviews: [],
  mentorMessages: [],
});

/** Monta um estado completo a partir de dados parciais, locais ou remotos. */
export const mergeLearnerState = (appUser: AppUser, parsed: Partial<LearnerState>): LearnerState => {
  const fallback = defaultLearnerState(appUser);
  const pillars = Array.isArray(parsed.pillars) && parsed.pillars.length
    ? parsed.pillars
    : fallback.pillars;
  const merged: LearnerState = {
    profile: {
      ...fallback.profile,
      ...(parsed.profile ?? {}),
      learnerData: { ...fallback.profile.learnerData, ...(parsed.profile?.learnerData ?? {}) },
      id: appUser.id,
      name: appUser.username,
    },
    pillars,
    activeBottleneck: parsed.activeBottleneck ?? fallback.activeBottleneck,
    phase: parsed.phase ?? fallback.phase,
    phaseProgress: parsed.phaseProgress ?? fallback.phaseProgress,
    reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    mentorMessages: Array.isArray(parsed.mentorMessages) ? parsed.mentorMessages : [],
  };
  const oldSeed = !merged.profile.evaluated && merged.reviews.length === 0
    && merged.profile.learnerData.activeProject === 'Protocolo de Execução Diária Inquebrável'
    && merged.profile.learnerData.target90DaysResult.startsWith('Estabelecer bloco matinal de 90 minutos');
  if (!oldSeed) return merged;
  return {
    ...merged,
    profile: { ...merged.profile, learnerData: { ...INITIAL_LEARNER_DATA } },
    pillars: INITIAL_PILLARS.map((pillar) => ({ ...pillar })),
    activeBottleneck: INITIAL_LEARNER_DATA.currentBottleneckPillar,
    phase: INITIAL_PHASE_EXECUTION,
    phaseProgress: { activeWeek: 1, completedTasks: {} },
  };
};

/** Public alias used by the remote-state hydration boundary. */
export const assembleLearnerState = mergeLearnerState;

/** Lê o estado guardado. Perfis antigos/guardados incompletos recuperam os defaults. */
export const loadLearnerState = (appUser: AppUser): LearnerState => {
  if (typeof localStorage === 'undefined') return defaultLearnerState(appUser);
  let raw: string | null;
  try { raw = localStorage.getItem(learnerStorageKey(appUser.id)); } catch { return defaultLearnerState(appUser); }
  if (!raw) return defaultLearnerState(appUser);
  try {
    return mergeLearnerState(appUser, JSON.parse(raw) as Partial<LearnerState>);
  } catch {
    return defaultLearnerState(appUser);
  }
};

/** Carimbo da última escrita local: decide local vs remoto sem depender do relógio do servidor. */
export const readLocalSavedAt = (userId: string): string | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(learnerStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: unknown };
    return typeof parsed.savedAt === 'string' ? parsed.savedAt : null;
  } catch {
    return null;
  }
};

export const saveLearnerState = (state: LearnerState): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      learnerStorageKey(state.profile.id),
      JSON.stringify({ ...state, savedAt: new Date().toISOString() }),
    );
  } catch {
    // Quota cheia ou modo privado: o progresso do browser não pode rebentar a UI.
  }
};

/** Marca o gargalo escolhido como prioritário; o anterior volta a "fase futura". */
export const withBottleneck = (
  pillars: PillarInfo[],
  bottleneck: VitruvianPillar,
): PillarInfo[] => pillars.map((pillar) => {
  if (pillar.id === bottleneck) return { ...pillar, status: 'gargalo_atual' };
  if (pillar.status === 'gargalo_atual') return { ...pillar, status: 'nao_avaliado_ainda' };
  return pillar;
});

/**
 * Aplica uma revisão ao pilar correspondente.
 * O reforço é determinístico (+3, teto 100) e só conta revisões
 * submetidas com evidência: nenhum ponto nasce de estimativa.
 */
export const applyReviewToState = (state: LearnerState, review: ReviewEntry): LearnerState => ({
  ...state,
  reviews: [review, ...state.reviews],
  pillars: state.pillars.map((pillar) => (pillar.id === review.pillarUpdated
    ? {
        ...pillar,
        notes: `Registo declarado pelo utilizador (${review.type}, ${review.date}): ${review.resultObtained}`,
      }
    : pillar)),
});
