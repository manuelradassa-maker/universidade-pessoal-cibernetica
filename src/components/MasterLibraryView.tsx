import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Award, BookOpen, CheckCircle2, ChevronRight, Compass, Filter, Flag, Info, Layers, Library, Route as RouteIcon, Search, Star } from 'lucide-react';
import type { LibraryEntry } from '../types';
import { DEVELOPMENT_PHASES, ESSENTIAL_TIER, MASTER_LIBRARY, OVERLAPPING_BOOKS, UNIQUE_LIBRARY, routeA, routeB, routeC } from '../data/masterLibrary';
import { LIST_LABELS, V8_DOMAINS } from '../data/v8Framework';

/**
 * Catálogo V8. Lê as tipagens reais de LibraryEntry / DevelopmentPhase.
 * A versão anterior, nunca renderizada, adivinhava nomes sobre `unknown` e
 * partida os dados em silêncio: routeA/B/C são funções (tratadas como arrays
 * → três colunas vazias) e os campos chamam-se coreContribution /
 * bestPracticalApplication / criticalWarning / readDepth (a vista procurava
 * contribution / application / warning / depth → tudo aparecia como
 * "Sem contribuição central").
 */

type TabId = 'listas' | 'rotas' | 'fases' | 'essencial';
interface Props {
  activePhaseTitle?: string;
  /**
   * O título da fase prática em execução ("Fase 1: Autodomínio, Arquitetura de
   * Atenção…") não é literalmente igual ao título da fase de desenvolvimento
   * ("Fase 1 — Autodomínio"), por isso a fase activa casa por número.
   */
  activePhaseNumber?: number;
}

/** Uma obra pode constar em mais de uma lista com o mesmo rank: a lista faz parte da chave. */
const keyOf = (b: LibraryEntry) => `${b.list}-${b.rank}-${b.title}`;
const label = (list: LibraryEntry['list']) => LIST_LABELS[list];

export default function MasterLibraryView({ activePhaseTitle, activePhaseNumber }: Props) {
  const RA = useMemo(() => routeA(), []);
  const RB = useMemo(() => routeB(), []);
  const RC = useMemo(() => routeC(), []);
  const [tab, setTab] = useState<TabId>('listas');
  const [q, setQ] = useState('');
  const [fL, setFL] = useState('todas');
  const [fS, setFS] = useState('todos');
  const [fT, setFT] = useState('todos');
  const [fD, setFD] = useState('todas');
  const [sel, setSel] = useState<string | null>(null);

  const lists = useMemo(() => Array.from(new Set(MASTER_LIBRARY.map((b) => b.list))).sort(), []);
  const stages = useMemo(() => Array.from(new Set(MASTER_LIBRARY.map((b) => b.stage))).sort((a, b) => a - b), []);
  const tiers = useMemo(() => Array.from(new Set(MASTER_LIBRARY.map((b) => b.tier))).sort((a, b) => a - b), []);
  const depths = useMemo(() => Array.from(new Set(MASTER_LIBRARY.map((b) => b.readDepth))).sort(), []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return MASTER_LIBRARY.filter((b) => {
      if (s && !`${b.title} ${b.author}`.toLowerCase().includes(s)) return false;
      if (fL !== 'todas' && b.list !== fL) return false;
      if (fS !== 'todos' && String(b.stage) !== fS) return false;
      if (fT !== 'todos' && String(b.tier) !== fT) return false;
      if (fD !== 'todas' && b.readDepth !== fD) return false;
      return true;
    });
  }, [q, fL, fS, fT, fD]);

  const selected = useMemo(() => {
    if (!sel) return null;
    return [...MASTER_LIBRARY, ...RA, ...RB, ...RC, ...ESSENTIAL_TIER].find((b) => keyOf(b) === sel) ?? null;
  }, [sel, RA, RB, RC]);

  const pick = (b: LibraryEntry) => { const k = keyOf(b); setSel(k === sel ? null : k); };

  const Row = (b: LibraryEntry) => {
    const act = keyOf(b) === sel;
    return (
      <button key={keyOf(b)} onClick={() => pick(b)} className={`w-full text-left rounded-xl border px-3 py-2.5 flex items-center gap-3 ${act ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}>
        <span className="shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><BookOpen size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{b.title}</span>
          <span className="block truncate text-xs opacity-60">{b.author} · {b.year}</span>
        </span>
        <span className="hidden md:flex gap-1.5 text-[11px] opacity-70">
          <span className="rounded-full border border-white/15 px-2 py-0.5">{label(b.list)}</span>
          <span className="rounded-full border border-white/15 px-2 py-0.5">E{b.stage}</span>
          <span className="rounded-full border border-white/15 px-2 py-0.5">T{b.tier}</span>
          <span className="rounded-full border border-white/15 px-2 py-0.5">{b.readDepth}</span>
        </span>
        <ChevronRight size={15} className="opacity-50" />
      </button>
    );
  };

  const RouteCol = (title: string, desc: string, books: LibraryEntry[], accent: string) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 mb-1"><Compass size={16} className={accent} /><h4 className="font-semibold text-sm">{title}</h4></div>
      <p className="text-xs opacity-60 mb-3">{desc} {books.length} obra(s).</p>
      <div className="space-y-2">{books.length === 0 && <p className="text-xs opacity-50">Sem livros.</p>}{books.map((b) => Row(b))}</div>
    </div>
  );

  const Field = (icon: ReactNode, name: string, value: string, tone?: string) => (
    <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
      <dt className="font-semibold flex items-center gap-1">{icon} {name}</dt>
      <dd className={`opacity-80 mt-0.5 ${tone ?? ''}`}>{value}</dd>
    </div>
  );

  const tabs: { id: TabId; label: string; icon: typeof Library }[] = [
    { id: 'listas', label: 'Listas', icon: Library },
    { id: 'rotas', label: 'Rotas A/B/C', icon: RouteIcon },
    { id: 'fases', label: 'Fases 0-9', icon: Flag },
    { id: 'essencial', label: 'Essencial 30', icon: Star },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-wrap items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center"><Library size={18} className="text-amber-300" /></span>
        <div className="flex-1 min-w-[200px]">
          <h2 className="font-bold">Master Library</h2>
          <p className="text-xs opacity-60">
            {MASTER_LIBRARY.length} registos · {UNIQUE_LIBRARY.length} únicos · {OVERLAPPING_BOOKS.length} sobrepostos
            {activePhaseTitle ? ` · Fase ativa: ${activePhaseTitle}` : ''}
          </p>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="rounded-full bg-white/10 px-2.5 py-1">{DEVELOPMENT_PHASES.length} fases</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">Domínios V8: {V8_DOMAINS.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => { const Ic = t.icon; const ac = tab === t.id; return (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm border ${ac ? 'bg-amber-400 text-black border-amber-400 font-semibold' : 'border-white/15 hover:bg-white/10'}`}>
            <Ic size={14} />{t.label}
          </button>
        ); })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          {tab === 'listas' && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por título ou autor…" className="w-full rounded-xl bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-sm outline-none focus:border-amber-400/60" />
              </div>
              <div className="grid sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-1.5">
                  <Filter size={13} className="opacity-50 shrink-0" />
                  <select value={fL} onChange={(e) => setFL(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todas">Lista: todas</option>{lists.map((l) => <option key={l} value={l}>{label(l)}</option>)}</select>
                </label>
                <label className="rounded-xl border border-white/10 px-2.5 py-1.5">
                  <select value={fS} onChange={(e) => setFS(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todos">Estágio: todos</option>{stages.map((s) => <option key={s} value={String(s)}>Estágio {s}</option>)}</select>
                </label>
                <label className="rounded-xl border border-white/10 px-2.5 py-1.5">
                  <select value={fT} onChange={(e) => setFT(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todos">Tier: todos</option>{tiers.map((t) => <option key={t} value={String(t)}>Tier {t}</option>)}</select>
                </label>
                <label className="rounded-xl border border-white/10 px-2.5 py-1.5">
                  <select value={fD} onChange={(e) => setFD(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todas">Profundidade: todas</option>{depths.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                </label>
              </div>
              <p className="text-[11px] opacity-60">{filtered.length} resultado(s) de {MASTER_LIBRARY.length}.</p>
            </div>
          )}

          {tab === 'listas' && (
            <div className="space-y-2">
              {filtered.map((b) => Row(b))}
              {filtered.length === 0 && <p className="text-sm opacity-60">Sem resultados com estes filtros.</p>}
            </div>
          )}

          {tab === 'rotas' && (
            <div className="grid md:grid-cols-3 gap-3">
              {RouteCol('Rota A — Fundamentos', 'Base mental, foco e hábitos.', RA, 'text-emerald-300')}
              {RouteCol('Rota B — Expansão', 'Relações, criação e mundo.', RB, 'text-sky-300')}
              {RouteCol('Rota C — Maestria', 'Síntese, legado e transmissão.', RC, 'text-amber-300')}
            </div>
          )}
          {tab === 'fases' && (
            <div className="space-y-3">
              {DEVELOPMENT_PHASES.map((p) => {
                const ac = activePhaseNumber === p.id;
                return (
                  <div key={p.id} className={`rounded-2xl border p-4 ${ac ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/[0.03]'}`}>
                    <div className="flex items-center gap-2">
                      <Layers size={14} className={ac ? 'text-amber-300' : 'opacity-60'} />
                      <h4 className="text-sm font-semibold flex-1">{p.title}</h4>
                      {ac && <span className="text-[10px] rounded-full bg-amber-400 text-black px-2 py-0.5 font-bold">ATIVA</span>}
                    </div>
                    <p className="text-xs opacity-70 mt-1">{p.objective}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2 text-[11px] opacity-70">
                      {p.capacities.map((c) => <span key={c} className="rounded-full border border-white/15 px-2 py-0.5">{c}</span>)}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                        <p className="font-semibold">Pré-requisito</p>
                        <p className="opacity-80 mt-0.5">{p.prerequisite}</p>
                      </div>
                      <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                        <p className="font-semibold flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-300" /> Teste comportamental</p>
                        <p className="opacity-80 mt-0.5">{p.behavioralTest}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'essencial' && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4">
              <div className="flex items-center gap-2 mb-1"><Award size={16} className="text-amber-300" /><h4 className="font-semibold text-sm">Essencial 30 ({ESSENTIAL_TIER.length})</h4></div>
              <p className="text-xs opacity-60 mb-3">Núcleo inegociável — tier 1 do catálogo.</p>
              <div className="space-y-2">{ESSENTIAL_TIER.map((b) => Row(b))}</div>
            </div>
          )}


        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-4">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Info size={14} className="opacity-60" /> Registo canónico</h3>
          {!selected && <p className="text-xs opacity-60">Seleciona um livro para ver contribuição, por que entra, aplicação prática, aviso crítico, papel, evidência, tier, estágio e domínio.</p>}
          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-bold leading-snug">{selected.title}</p>
                <p className="text-xs opacity-60">{selected.author} · {selected.year}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-full bg-white/10 px-2 py-0.5">Lista: {label(selected.list)}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5">Estágio: {selected.stage}</span>
                <span className="rounded-full bg-amber-400/20 text-amber-200 px-2 py-0.5">Tier {selected.tier}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5">{selected.readDepth}</span>
              </div>
              <dl className="space-y-2 text-xs">
                {Field(<CheckCircle2 size={12} className="text-emerald-300" />, 'Contribuição central', selected.coreContribution)}
                {Field(<Compass size={12} className="text-sky-300" />, 'Por que entra', selected.whyIncluded)}
                {Field(<BookOpen size={12} className="text-emerald-300" />, 'Aplicação prática', selected.bestPracticalApplication)}
                {Field(<AlertTriangle size={12} className="text-amber-300" />, 'Aviso crítico', selected.criticalWarning, 'text-amber-100/90')}
                {Field(<Layers size={12} className="opacity-50" />, 'Domínio', selected.domain)}
                {Field(<Award size={12} className="opacity-50" />, 'Papel', selected.role)}
                {Field(<Info size={12} className="opacity-50" />, 'Classe de evidência', selected.evidenceClass)}
                {Field(<Star size={12} className="opacity-50" />, 'Extensão, dificuldade e releitura', `${selected.durationOrPages} · nível ${selected.difficulty}/5 · ${selected.rereadValue}`)}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
