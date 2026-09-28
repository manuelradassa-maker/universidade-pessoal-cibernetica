import { useCallback, useEffect, useState } from 'react';
import { Bot, BookOpen, Compass, Library, ShieldCheck, Sparkles, Target, Users, X } from 'lucide-react';
import type { AppUser } from '../lib/supabase';
import type { ReviewEntry, UserProfile, VitruvianPillar } from '../types';
import {
  applyReviewToState,
  loadLearnerState,
  saveLearnerState,
  withBottleneck,
  type LearnerState,
} from '../lib/learner';
import { VitruvianDashboard } from './VitruvianDashboard';
import { CurriculumPhaseView } from './CurriculumPhaseView';
import { CommunityFeed } from './CommunityFeed';
import { MentorChat } from './MentorChat';
import { ReaderDiagnosticModal } from './ReaderDiagnosticModal';
import { ReviewModal } from './ReviewModal';
import { HandoffModal } from './HandoffModal';
import MasterLibraryView from './MasterLibraryView';
import V8AuditView from './V8AuditView';
import { hydrateLearnerState, persistLearnerState, SYNC_DEBOUNCE_MS } from '../lib/learnerSync';
import { supabase } from '../lib/supabase';
import { buildV8Phase } from '../lib/v8Phase';

type TabId = 'painel' | 'fase' | 'biblioteca' | 'comunidade' | 'auditoria';
type ReviewType = 'semanal' | 'livro' | 'fase';

const TABS: { id: TabId; label: string; icon: typeof Compass }[] = [
  { id: 'painel', label: 'Painel Vitruvian', icon: Compass },
  { id: 'fase', label: 'Fase Atual', icon: Target },
  { id: 'biblioteca', label: 'Biblioteca V8', icon: Library },
  { id: 'comunidade', label: 'Comunidade', icon: Users },
  { id: 'auditoria', label: 'Auditoria', icon: ShieldCheck },
];

const actionClass = 'inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs text-violet-800 transition hover:border-violet-300';
const accentClass = 'inline-flex items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-800';

export function LearnerJourney({ user }: { user: AppUser }) {
  const [state, setState] = useState<LearnerState>(() => loadLearnerState(user));
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'local' | 'syncing' | 'synced'>('local');
  const [tab, setTab] = useState<TabId>('painel');
  const [reviewType, setReviewType] = useState<ReviewType | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(() => !loadLearnerState(user).profile.evaluated);
  const [showHandoff, setShowHandoff] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void hydrateLearnerState(user).then((result) => {
      if (!active) return;
      if (result.source === 'remote') {
        setState(result.state);
        setShowDiagnostic(!result.state.profile.evaluated);
      }
      setSyncStatus(supabase ? 'syncing' : 'local');
      setHydrated(true);
    });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    saveLearnerState(state);
    if (!supabase) return;
    let active = true;
    const timer = window.setTimeout(() => {
      void persistLearnerState(user, state).then((saved) => {
        if (active) setSyncStatus(saved ? 'synced' : 'local');
      });
    }, SYNC_DEBOUNCE_MS);
    return () => { active = false; window.clearTimeout(timer); };
  }, [state, hydrated, user]);

  const { profile, pillars, activeBottleneck, phase } = state;

  const chooseBottleneck = (pillar: VitruvianPillar) => setState((prev) => ({
    ...prev,
    activeBottleneck: pillar,
    pillars: withBottleneck(prev.pillars, pillar),
  }));

  const saveIntakeDraft = useCallback((v8Intake: Record<string, string>) => setState((previous) => ({ ...previous, profile: { ...previous.profile, v8Intake } })), []);

  const setSystemMode = (mode: UserProfile['systemMode']) => setState((prev) => ({
    ...prev,
    profile: { ...prev.profile, systemMode: mode },
  }));

  const completeDiagnostic = (updated: UserProfile, bottleneck: VitruvianPillar) => {
    const profile = {
      ...updated,
      id: state.profile.id,
      name: state.profile.name,
      avatar: state.profile.avatar,
      avatarType: state.profile.avatarType,
      createdAt: state.profile.createdAt,
    };
    setState((prev) => ({
      ...prev,
      profile,
      activeBottleneck: bottleneck,
      pillars: withBottleneck(prev.pillars, bottleneck),
      phase: buildV8Phase(profile, bottleneck),
      phaseProgress: { activeWeek: 1, completedTasks: {} },
    }));
    setShowDiagnostic(false);
    setTab('painel');
  };

  const submitReview = (review: ReviewEntry) => {
    setState((prev) => applyReviewToState(prev, review));
    setReviewType(null);
  };

  const mentor = <MentorChat user={profile} activeBottleneck={activeBottleneck} messages={state.mentorMessages} onMessagesChange={(mentorMessages) => setState((previous) => ({ ...previous, mentorMessages }))} onUpdateUserMode={setSystemMode} onGenerateHandoff={() => setShowHandoff(true)} />;

  return <div className="space-y-6">
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-violet-700">Minha jornada</p>
        <h2 className="text-lg font-semibold">{profile.avatar} {profile.name}</h2>
        <p className="text-xs text-zinc-500">{profile.evaluated ? 'Perfil de leitor avaliado' : 'Diagnóstico do leitor por concluir'} · {state.reviews.length} {state.reviews.length === 1 ? 'revisão' : 'revisões'} registadas</p>
        <span className="mt-1 inline-block text-[11px] text-zinc-500">{syncStatus === 'synced' ? 'Sincronizado' : syncStatus === 'syncing' ? 'A sincronizar' : 'Guardado neste dispositivo'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={actionClass} onClick={() => setShowDiagnostic(true)}><Sparkles size={14} /> {profile.evaluated ? 'Refazer diagnóstico' : 'Iniciar diagnóstico'}</button>
        <button className={actionClass} disabled={!profile.evaluated} onClick={() => setReviewType('semanal')}><BookOpen size={14} /> Revisão semanal</button>
        <button className={actionClass} onClick={() => setShowHandoff(true)}><Compass size={14} /> Handoff</button>
        <button className={`${actionClass} xl:hidden`} onClick={() => setMentorOpen(true)}><Bot size={14} /> Mentora</button>
      </div>
    </section>

    {profile.systemMode === 'modo_a_baixa_energia' && <p className="rounded-lg border border-amber-700 bg-amber-950/60 p-3 text-sm text-amber-200">Modo A ativo: output reduzido ao essencial. Escolhe uma única ação física de 10 minutos para hoje.</p>}
    {profile.systemMode === 'modo_b_falha_critica' && <p className="rounded-lg border border-violet-700 bg-violet-950/70 p-3 text-sm text-violet-200">Modo B ativo: o currículo está em pausa. Procura apoio humano imediato — a tua integridade vem antes de qualquer objetivo.</p>}

    {!profile.evaluated && <section className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-sm text-amber-100">Completa o diagnostico V8 antes de ver uma fase personalizada ou registar progresso.</section>}

    <nav className="flex flex-wrap gap-2 border-b border-violet-100 pb-3">
      {TABS.map((entry) => <button key={entry.id} onClick={() => setTab(entry.id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${tab === entry.id ? 'bg-violet-700 text-white' : 'border border-violet-100 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-800'}`}><entry.icon size={15} /> {entry.label}</button>)}
    </nav>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        {tab === 'painel' && <VitruvianDashboard pillars={pillars} activeBottleneck={activeBottleneck} onSelectPillar={profile.evaluated ? chooseBottleneck : undefined} />}
        {tab === 'fase' && (profile.evaluated ? <CurriculumPhaseView phase={phase} progress={state.phaseProgress} onProgressChange={(phaseProgress) => setState((previous) => ({ ...previous, phaseProgress }))} onOpenReview={(type) => setReviewType(type)} /> : <p className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">Completa o diagnostico V8 para ver a fase pratica.</p>)}
        {tab === 'biblioteca' && (profile.evaluated ? <MasterLibraryView activePhaseTitle={phase.title} activePhaseNumber={phase.phaseNumber} /> : <p className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">Completa o diagnostico V8 antes de consultar a biblioteca.</p>)}
        {tab === 'comunidade' && <CommunityFeed user={profile} />}
        {tab === 'auditoria' && <V8AuditView />}
      </div>
      <aside className="hidden xl:block">{mentor}</aside>
    </div>

    {mentorOpen && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 xl:hidden">
      <div className="w-full max-w-md">
        <button className={accentClass} onClick={() => setMentorOpen(false)}><X size={14} /> Fechar mentora</button>
        <div className="mt-3">{mentor}</div>
      </div>
    </div>}

    {showDiagnostic && <ReaderDiagnosticModal user={profile} onComplete={completeDiagnostic} onDraftChange={saveIntakeDraft} onClose={profile.evaluated ? () => setShowDiagnostic(false) : undefined} />}
    {reviewType && <ReviewModal type={reviewType} activeBottleneck={activeBottleneck} onClose={() => setReviewType(null)} onSubmit={submitReview} />}
    {showHandoff && <HandoffModal user={profile} phase={phase} pillars={pillars} onClose={() => setShowHandoff(false)} />}
  </div>;
}

export default LearnerJourney;
