import { useEffect, useState } from 'react';
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

type TabId = 'painel' | 'fase' | 'biblioteca' | 'comunidade' | 'auditoria';
type ReviewType = 'semanal' | 'livro' | 'fase';

const TABS: { id: TabId; label: string; icon: typeof Compass }[] = [
  { id: 'painel', label: 'Painel Vitruvian', icon: Compass },
  { id: 'fase', label: 'Fase Atual', icon: Target },
  { id: 'biblioteca', label: 'Biblioteca V8', icon: Library },
  { id: 'comunidade', label: 'Comunidade', icon: Users },
  { id: 'auditoria', label: 'Auditoria', icon: ShieldCheck },
];

const actionClass = 'inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 transition hover:border-red-500';
const accentClass = 'inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600';

export function LearnerJourney({ user }: { user: AppUser }) {
  const [state, setState] = useState<LearnerState>(() => loadLearnerState(user));
  const [tab, setTab] = useState<TabId>('painel');
  const [reviewType, setReviewType] = useState<ReviewType | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);

  useEffect(() => { saveLearnerState(state); }, [state]);

  const { profile, pillars, activeBottleneck, phase } = state;

  const chooseBottleneck = (pillar: VitruvianPillar) => setState((prev) => ({
    ...prev,
    activeBottleneck: pillar,
    pillars: withBottleneck(prev.pillars, pillar),
  }));

  const setSystemMode = (mode: UserProfile['systemMode']) => setState((prev) => ({
    ...prev,
    profile: { ...prev.profile, systemMode: mode },
  }));

  const completeDiagnostic = (updated: UserProfile, bottleneck: VitruvianPillar) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...updated,
        id: prev.profile.id,
        name: prev.profile.name,
        avatar: prev.profile.avatar,
        avatarType: prev.profile.avatarType,
        createdAt: prev.profile.createdAt,
      },
      activeBottleneck: bottleneck,
      pillars: withBottleneck(prev.pillars, bottleneck),
    }));
    setShowDiagnostic(false);
    setTab('painel');
  };

  const submitReview = (review: ReviewEntry) => {
    setState((prev) => applyReviewToState(prev, review));
    setReviewType(null);
  };

  const mentor = <MentorChat user={profile} activeBottleneck={activeBottleneck} onUpdateUserMode={setSystemMode} onGenerateHandoff={() => setShowHandoff(true)} />;

  return <div className="space-y-6">
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
      <div>
        <p className="font-mono text-xs uppercase text-red-400">Minha jornada</p>
        <h2 className="text-lg font-semibold">{profile.avatar} {profile.name}</h2>
        <p className="text-xs text-zinc-500">{profile.evaluated ? 'Perfil de leitor avaliado' : 'Diagnóstico do leitor por concluir'} · {state.reviews.length} {state.reviews.length === 1 ? 'revisão' : 'revisões'} registadas</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={actionClass} onClick={() => setShowDiagnostic(true)}><Sparkles size={14} /> {profile.evaluated ? 'Refazer diagnóstico' : 'Iniciar diagnóstico'}</button>
        <button className={actionClass} onClick={() => setReviewType('semanal')}><BookOpen size={14} /> Revisão semanal</button>
        <button className={actionClass} onClick={() => setShowHandoff(true)}><Compass size={14} /> Handoff</button>
        <button className={`${actionClass} xl:hidden`} onClick={() => setMentorOpen(true)}><Bot size={14} /> Mentora</button>
      </div>
    </section>

    {profile.systemMode === 'modo_a_baixa_energia' && <p className="rounded-lg border border-amber-700 bg-amber-950/60 p-3 text-sm text-amber-200">Modo A ativo: output reduzido ao essencial. Escolhe uma única ação física de 10 minutos para hoje.</p>}
    {profile.systemMode === 'modo_b_falha_critica' && <p className="rounded-lg border border-red-700 bg-red-950/70 p-3 text-sm text-red-200">Modo B ativo: o currículo está em pausa. Procura apoio humano imediato — a tua integridade vem antes de qualquer objetivo.</p>}

    <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
      {TABS.map((entry) => <button key={entry.id} onClick={() => setTab(entry.id)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${tab === entry.id ? 'bg-red-700 text-white' : 'border border-zinc-800 text-zinc-400 hover:text-white'}`}><entry.icon size={15} /> {entry.label}</button>)}
    </nav>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        {tab === 'painel' && <VitruvianDashboard pillars={pillars} activeBottleneck={activeBottleneck} onSelectPillar={chooseBottleneck} />}
        {tab === 'fase' && <CurriculumPhaseView phase={phase} user={profile} onOpenReview={(type) => setReviewType(type)} />}
        {tab === 'biblioteca' && <MasterLibraryView activePhaseTitle={phase.title} activePhaseNumber={phase.phaseNumber} />}
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

    {showDiagnostic && <ReaderDiagnosticModal user={profile} onComplete={completeDiagnostic} />}
    {reviewType && <ReviewModal type={reviewType} activeBottleneck={activeBottleneck} onClose={() => setReviewType(null)} onSubmit={submitReview} />}
    {showHandoff && <HandoffModal user={profile} phase={phase} pillars={pillars} onClose={() => setShowHandoff(false)} />}
  </div>;
}

export default LearnerJourney;
