import { supabase } from './supabase';
import type { AppUser } from './supabase';
import type { PillarInfo, ReviewEntry, UserProfile, VitruvianPillar } from '../types';
import {
  assembleLearnerState,
  loadLearnerState,
  readLocalSavedAt,
  type LearnerState,
} from './learner';

/**
 * SINCRONIZAÇÃO DO ESTADO DE APRENDIZAGEM (P1)
 * ------------------------------------------------------------------
 * O localStorage continua a ser a fonte do primeiro paint: o painel abre
 * instantaneamente e funciona offline. A tabela `learner_state` é uma
 * melhoria por cima, nunca um requisito.
 *
 * Regras que justificam o desenho:
 * - Toda a falha é engolida. A tabela pode ainda não existir (a migration
 *   é aplicada separadamente), a sessão pode expirar a meio, o RLS pode
 *   recusar, a rede pode cair. Nenhuma destas situações pode rebentar o
 *   painel: o utilizador perde a sincronização, nunca o progresso local.
 * - Nunca se sobrescreve um estado remoto mais recente com um local mais
 *   antigo. Compara-se `saved_at` (relógio do cliente) contra o `savedAt`
 *   local: skew entre dispositivos é possível, perder progresso não.
 * - Só se envia o que mudou depois de um debounce: cada revisão dispara
 *   várias atualizações de React, e escrever na base a cada tecla não é
 *   aceitável.
 */

const TABLE = 'learner_state';
export const SYNC_DEBOUNCE_MS = 1500;

interface LearnerStateRow {
  profile: UserProfile | null;
  pillars: PillarInfo[] | null;
  active_bottleneck: string | null;
  phase: LearnerState['phase'] | null;
  phase_progress: LearnerState['phaseProgress'] | null;
  reviews: ReviewEntry[] | null;
  mentor_messages: LearnerState['mentorMessages'] | null;
  saved_at: string | null;
}

export type HydrationResult =
  | { source: 'remote'; state: LearnerState }
  | { source: 'local'; state: LearnerState }
  | { source: 'unavailable' };

const isPillar = (value: unknown): value is VitruvianPillar =>
  value === 'mente' || value === 'intelecto' || value === 'corpo_acao' || value === 'proposito';

/** Traz o estado da conta para o dispositivo actual. */
export const hydrateLearnerState = async (appUser: AppUser): Promise<HydrationResult> => {
  if (!supabase) return { source: 'unavailable' };
  const local = loadLearnerState(appUser);
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('profile, pillars, active_bottleneck, phase, phase_progress, reviews, mentor_messages, saved_at')
      .eq('user_id', appUser.id)
      .maybeSingle<LearnerStateRow>();

    if (error || !data) return { source: 'local', state: local };

    const localSavedAt = readLocalSavedAt(appUser.id);
    const remoteSavedAt = data.saved_at;
    // Sem carimbo remoto não há como ordenar, e um local mais recente nunca é
    // apagado por um remoto mais velho: manter o local é a escolha segura.
    if (!remoteSavedAt || (localSavedAt && localSavedAt >= remoteSavedAt)) {
      return { source: 'local', state: local };
    }

    return {
      source: 'remote',
      state: assembleLearnerState(appUser, {
        profile: data.profile ?? undefined,
        pillars: Array.isArray(data.pillars) ? data.pillars : undefined,
        activeBottleneck: isPillar(data.active_bottleneck) ? data.active_bottleneck : undefined,
        phase: data.phase ?? undefined,
        phaseProgress: data.phase_progress ?? undefined,
        reviews: Array.isArray(data.reviews) ? data.reviews : undefined,
        mentorMessages: Array.isArray(data.mentor_messages) ? data.mentor_messages : undefined,
      }),
    };
  } catch {
    return { source: 'local', state: local };
  }
};

/** Escreve o estado na conta. Sem retry: o próximo debounce tenta de novo. */
export const persistLearnerState = async (appUser: AppUser, state: LearnerState): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(TABLE).upsert({
      user_id: appUser.id,
      profile: state.profile,
      pillars: state.pillars,
      active_bottleneck: state.activeBottleneck,
      phase: state.phase,
      phase_progress: state.phaseProgress,
      reviews: state.reviews,
      mentor_messages: state.mentorMessages,
      saved_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
};
