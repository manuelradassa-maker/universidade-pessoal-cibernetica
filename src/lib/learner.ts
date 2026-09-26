import type {
  PillarInfo,
  PracticalPhase,
  ReviewEntry,
  UserProfile,
  VitruvianPillar,
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
 */

const STORE_PREFIX = 'upc_learner_v1:';

export interface LearnerState {
  profile: UserProfile;
  pillars: PillarInfo[];
  activeBottleneck: VitruvianPillar;
  phase: PracticalPhase;
  reviews: ReviewEntry[];
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
  reviews: [],
});

/** Lê o estado guardado. Perfis antigos/guardados incompletos recuperam os defaults. */
export const loadLearnerState = (appUser: AppUser): LearnerState => {
  const fallback = defaultLearnerState(appUser);
  if (typeof localStorage === 'undefined') return fallback;
  const raw = localStorage.getItem(learnerStorageKey(appUser.id));
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<LearnerState>;
    const pillars = Array.isArray(parsed.pillars) && parsed.pillars.length
      ? parsed.pillars
      : fallback.pillars;
    return {
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
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch {
    return fallback;
  }
};

export const saveLearnerState = (state: LearnerState): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(learnerStorageKey(state.profile.id), JSON.stringify(state));
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
        score: Math.min(100, pillar.score + 3),
        notes: `Última revisão (${review.type}, ${review.date}): ${review.appliedAction}`,
      }
    : pillar)),
});
