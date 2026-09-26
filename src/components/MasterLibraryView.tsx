import { useMemo, useState } from 'react';
import type { JSX } from 'react';
import { BookOpen, Search, Layers, Route as RouteIcon, Flag, Star, ChevronRight, Library, Filter, AlertTriangle, CheckCircle2, Info, Award, Compass } from 'lucide-react';
import { MASTER_LIBRARY as MR, UNIQUE_LIBRARY as UR, OVERLAPPING_BOOKS as OR, ESSENTIAL_TIER as ER, routeA as rA, routeB as rB, routeC as rC, DEVELOPMENT_PHASES as PH } from '../data/masterLibrary';
import { LIST_LABELS as LL, V8_DOMAINS as VD } from '../data/v8Framework';
interface CB { id?: string|number; title?: string; titulo?: string; author?: string; autor?: string; list?: string; lista?: string; stage?: string|number; estagio?: string|number; fase?: string|number; tier?: string|number; depth?: string; profundidade?: string; domain?: string; dominio?: string; contribution?: string; contribuicao?: string; application?: string; aplicacao?: string; warning?: string; aviso?: string; role?: string; papel?: string; evidence?: string; evidencia?: string; }
interface DP { title?: string; titulo?: string; name?: string; range?: string; description?: string; descricao?: string; }
type TabId = 'listas'|'rotas'|'fases'|'essencial';
interface Props { activePhaseTitle?: string; }
const arrB = (v: unknown): CB[] => Array.isArray(v) ? (v as CB[]) : [];
const arrS = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
const recS = (v: unknown): Record<string,string> => {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o: Record<string,string> = {};
    for (const [k,v2] of Object.entries(v as Record<string,unknown>)) if (typeof v2 === 'string') o[k]=v2; else if (typeof v2 === 'number') o[k]=String(v2);
    return o;
  } return {};
};
const T = (b: CB): string => b.title ?? b.titulo ?? 'Sem título';
const A = (b: CB): string => b.author ?? b.autor ?? 'Autor desconhecido';
const L = (b: CB): string => b.list ?? b.lista ?? '—';
const S = (b: CB): string => String(b.stage ?? b.estagio ?? b.fase ?? '—');
const TR = (b: CB): string => String(b.tier ?? '—');
const DPf = (b: CB): string => b.depth ?? b.profundidade ?? '—';
const DM = (b: CB): string => b.domain ?? b.dominio ?? '—';
const F = (a: string|undefined, c: string|undefined): string => a ?? c ?? '—';
const K = (b: CB, i: number): string => b.id !== undefined ? String(b.id) : `${T(b)}-${A(b)}-${i}`;

export default function MasterLibraryView({ activePhaseTitle }: Props) {
  const MASTER = useMemo(()=>arrB(MR as unknown),[]);
  const UNIQUE = useMemo(()=>arrB(UR as unknown),[]);
  const OVER = useMemo(()=>arrB(OR as unknown),[]);
  const ESS = useMemo(()=>arrB(ER as unknown),[]);
  const RA = useMemo(()=>arrB(rA as unknown),[]);
  const RB = useMemo(()=>arrB(rB as unknown),[]);
  const RC = useMemo(()=>arrB(rC as unknown),[]);
  const PHASES = useMemo(()=> (Array.isArray(PH) ? (PH as DP[]) : []),[]);
  const LABELS = useMemo(()=>recS(LL as unknown),[]);
  const DOMS = useMemo(()=>{ const a=arrS(VD as unknown); return a.length?a:Object.values(recS(VD as unknown)); },[]);
  const [tab,setTab]=useState<TabId>('listas');
  const [q,setQ]=useState('');
  const [fL,setFL]=useState('todas'); const [fS,setFS]=useState('todos');
  const [fT,setFT]=useState('todos'); const [fD,setFD]=useState('todas');
  const [sel,setSel]=useState<string|null>(null);
  const lists=useMemo(()=>Array.from(new Set(MASTER.map(L))).sort(),[MASTER]);
  const stages=useMemo(()=>Array.from(new Set(MASTER.map(S))).sort(),[MASTER]);
  const tiers=useMemo(()=>Array.from(new Set(MASTER.map(TR))).sort(),[MASTER]);
  const depths=useMemo(()=>Array.from(new Set(MASTER.map(DPf))).filter(d=>d!=='—').sort(),[MASTER]);
  const filtered=useMemo(()=>{
    const s=q.trim().toLowerCase();
    return MASTER.filter(b=>{
      if(s && !`${T(b)} ${A(b)}`.toLowerCase().includes(s)) return false;
      if(fL!=='todas'&&L(b)!==fL) return false;
      if(fS!=='todos'&&S(b)!==fS) return false;
      if(fT!=='todos'&&TR(b)!==fT) return false;
      if(fD!=='todas'&&DPf(b)!==fD) return false;
      return true;
    });
  },[MASTER,q,fL,fS,fT,fD]);
  const selected: CB|null = useMemo(()=>{ if(!sel) return null; return [...MASTER,...ESS].find((b,i)=>K(b,i)===sel) ?? null; },[sel,MASTER,ESS]);
  const lbl=(k:string):string=>LABELS[k]??k;
  const tabs:{id:TabId;label:string;icon:typeof Library}[]=[{id:'listas',label:'Listas',icon:Library},{id:'rotas',label:'Rotas A/B/C',icon:RouteIcon},{id:'fases',label:'Fases 0-9',icon:Flag},{id:'essencial',label:'Essencial 30',icon:Star}];
  function row(b:CB,i:number): JSX.Element {
    const k=K(b,i); const act=k===sel;
    return (
      <button key={k} onClick={()=>setSel(act?null:k)} className={`w-full text-left rounded-xl border px-3 py-2.5 flex items-center gap-3 ${act?'border-amber-400 bg-amber-400/10':'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}>
        <span className="shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><BookOpen size={16}/></span>
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{T(b)}</span><span className="block truncate text-xs opacity-60">{A(b)}</span></span>
        <span className="hidden md:flex gap-1.5 text-[11px] opacity-70"><span className="rounded-full border border-white/15 px-2 py-0.5">{L(b)}</span><span className="rounded-full border border-white/15 px-2 py-0.5">E{S(b)}</span><span className="rounded-full border border-white/15 px-2 py-0.5">T{TR(b)}</span></span>
        <ChevronRight size={15} className="opacity-50"/>
      </button>
    );
  }
  function routeCol(title:string,desc:string,books:CB[],accent:string): JSX.Element {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-1"><Compass size={16} className={accent}/><h4 className="font-semibold text-sm">{title}</h4></div>
        <p className="text-xs opacity-60 mb-3">{desc}</p>
        <div className="space-y-2">{books.length===0 && <p className="text-xs opacity-50">Sem livros.</p>}{books.map((b,i)=>row(b,i))}</div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-wrap items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center"><Library size={18} className="text-amber-300"/></span>
        <div className="flex-1 min-w-[200px]"><h2 className="font-bold">Master Library</h2>
        <p className="text-xs opacity-60">{MASTER.length} registos · {UNIQUE.length} únicos · {OVER.length} sobrepostos{activePhaseTitle?` · Fase: ${activePhaseTitle}`:''}</p></div>
        <div className="flex gap-2 text-[11px]"><span className="rounded-full bg-white/10 px-2.5 py-1">Fases 0-9</span><span className="rounded-full bg-white/10 px-2.5 py-1">V8: {DOMS.length}</span></div>
      </div>
      <div className="flex flex-wrap gap-2">{tabs.map(t=>{const Ic=t.icon;const ac=tab===t.id;return(<button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm border ${ac?'bg-amber-400 text-black border-amber-400 font-semibold':'border-white/15 hover:bg-white/10'}`}><Ic size={14}/>{t.label}</button>);})}</div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar por título ou autor…" className="w-full rounded-xl bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-sm outline-none focus:border-amber-400/60"/></div>
            <div className="grid sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-1.5"><Filter size={13} className="opacity-50 shrink-0"/><select value={fL} onChange={e=>setFL(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todas">Lista: todas</option>{lists.map(l=><option key={l} value={l}>{lbl(l)}</option>)}</select></label>
              <label className="rounded-xl border border-white/10 px-2.5 py-1.5"><select value={fS} onChange={e=>setFS(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todos">Estágio: todos</option>{stages.map(s=><option key={s} value={s}>Estágio {s}</option>)}</select></label>
              <label className="rounded-xl border border-white/10 px-2.5 py-1.5"><select value={fT} onChange={e=>setFT(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todos">Tier: todos</option>{tiers.map(t=><option key={t} value={t}>Tier {t}</option>)}</select></label>
              <label className="rounded-xl border border-white/10 px-2.5 py-1.5"><select value={fD} onChange={e=>setFD(e.target.value)} className="bg-transparent w-full outline-none text-xs"><option value="todas">Profundidade: todas</option>{depths.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
            </div>
            <p className="text-[11px] opacity-60">{filtered.length} resultado(s).</p>
          </div>
          {tab==='listas' && (<div className="space-y-2">{filtered.map((b,i)=>row(b,i))}{filtered.length===0 && <p className="text-sm opacity-60">Sem resultados.</p>}</div>)}
          {tab==='rotas' && (<div className="grid md:grid-cols-3 gap-3">{routeCol('Rota A — Fundamentos','Base mental, foco e hábitos.',RA,'text-emerald-300')}{routeCol('Rota B — Expansão','Relações, criação e mundo.',RB,'text-sky-300')}{routeCol('Rota C — Maestria','Síntese, legado e transmissão.',RC,'text-amber-300')}</div>)}
          {tab==='fases' && (<div className="space-y-3">{PHASES.length===0 && <p className="text-sm opacity-60">Fases não definidas.</p>}{PHASES.map((p,i)=>{const t=p.title??p.titulo??p.name??`Fase ${i}`;const ac=activePhaseTitle!==undefined&&t===activePhaseTitle;return(<div key={`${t}-${i}`} className={`rounded-2xl border p-4 ${ac?'border-amber-400 bg-amber-400/10':'border-white/10 bg-white/[0.03]'}`}><div className="flex items-center gap-2"><Layers size={14} className={ac?'text-amber-300':'opacity-60'}/><h4 className="text-sm font-semibold">{t}</h4>{ac && <span className="text-[10px] rounded-full bg-amber-400 text-black px-2 py-0.5 font-bold">ATIVA</span>}</div>{(p.description??p.descricao??p.range)&&<p className="text-xs opacity-60 mt-1">{p.description??p.descricao??p.range}</p>}</div>);})}</div>)}
          {tab==='essencial' && (<div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4"><div className="flex items-center gap-2 mb-1"><Award size={16} className="text-amber-300"/><h4 className="font-semibold text-sm">Essencial 30 ({ESS.length})</h4></div><p className="text-xs opacity-60 mb-3">Núcleo inegociável.</p><div className="space-y-2">{ESS.map((b,i)=>(<div key={K(b,i)} className="flex items-center gap-2"><span className="shrink-0 w-6 h-6 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">{i+1}</span><div className="flex-1">{row(b,i)}</div></div>))}</div></div>)}
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-4">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Info size={14} className="opacity-60"/> Registo canónico</h3>
          {!selected && <p className="text-xs opacity-60">Seleciona um livro para ver contribuição, aplicação, aviso, papel, evidência, tier, estágio e domínio.</p>}
          {selected && (
            <div className="space-y-3 text-sm">
              <div><p className="font-bold leading-snug">{T(selected)}</p><p className="text-xs opacity-60">{A(selected)}</p></div>
              <div className="flex flex-wrap gap-1.5 text-[11px]"><span className="rounded-full bg-white/10 px-2 py-0.5">Lista: {lbl(L(selected))}</span><span className="rounded-full bg-white/10 px-2 py-0.5">Estágio: {S(selected)}</span><span className="rounded-full bg-amber-400/20 text-amber-200 px-2 py-0.5">Tier: {TR(selected)}</span><span className="rounded-full bg-white/10 px-2 py-0.5">Domínio: {DM(selected)}</span><span className="rounded-full bg-white/10 px-2 py-0.5">Profundidade: {DPf(selected)}</span></div>
              <dl className="space-y-2 text-xs">
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-300"/> Contribuição</dt><dd className="opacity-80 mt-0.5">{F(selected.contribution,selected.contribuicao)}</dd></div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold flex items-center gap-1"><Compass size={12} className="text-sky-300"/> Aplicação</dt><dd className="opacity-80 mt-0.5">{F(selected.application,selected.aplicacao)}</dd></div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold flex items-center gap-1"><AlertTriangle size={12} className="text-amber-300"/> Aviso</dt><dd className="opacity-80 mt-0.5">{F(selected.warning,selected.aviso)}</dd></div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold">Papel</dt><dd className="opacity-80 mt-0.5">{F(selected.role,selected.papel)}</dd></div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold">Evidência</dt><dd className="opacity-80 mt-0.5">{F(selected.evidence,selected.evidencia)}</dd></div>
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
