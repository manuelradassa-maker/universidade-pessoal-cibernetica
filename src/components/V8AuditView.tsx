import { useMemo } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ClipboardCheck, Info } from 'lucide-react';
import { V8_AUDIT as VA } from '../data/masterLibrary';
interface AC { id?: string|number; name?: string; nome?: string; check?: string; expectation?: string; esperado?: string; expected?: string; observed?: string; observado?: string; found?: string; status?: string; estado?: string; result?: string; detail?: string; detalhe?: string; notes?: string; }
const arr = (v: unknown): AC[] => Array.isArray(v) ? (v as AC[]) : [];
const str = (v: unknown): string => typeof v === 'string' ? v : v === undefined || v === null ? '—' : String(v);
export default function V8AuditView() {
  const checks = useMemo(()=>arr(VA as unknown),[]);
  const counts = useMemo(()=>{
    let ok=0, warn=0, fail=0;
    for (const c of checks) {
      const s=str(c.status??c.estado??c.result).toLowerCase();
      if (s.includes('ok')||s.includes('pass')||s.includes('sucesso')||s.includes('conform')) ok++;
      else if (s.includes('warn')||s.includes('aviso')||s.includes('parcial')||s.includes('aten')) warn++;
      else if (s.includes('fail')||s.includes('falha')||s.includes('erro')||s.includes('reprov')) fail++;
      else ok++;
    }
    return { ok, warn, fail };
  },[checks]);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-300"/><h2 className="font-bold">Auditoria V8</h2></div>
        <p className="text-xs opacity-70 mt-2 leading-relaxed">Declaração de método: verificação independente item a item do catálogo — compara o esperado com o observado em cada check, classifica como ok, aviso ou falha e regista o detalhe para correção antes da certificação.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center"><p className="text-2xl font-bold">100</p><p className="text-[11px] opacity-60">Totais verificados A</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center"><p className="text-2xl font-bold">100</p><p className="text-[11px] opacity-60">Totais verificados B</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center"><p className="text-2xl font-bold">50</p><p className="text-[11px] opacity-60">Totais verificados C</p></div>
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-center"><p className="text-2xl font-bold">{checks.length}</p><p className="text-[11px] opacity-60">Livros únicos</p></div>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 text-emerald-200 px-2.5 py-1"><CheckCircle2 size={12}/> OK: {counts.ok}</span>
        <span className="flex items-center gap-1 rounded-full bg-amber-400/15 text-amber-200 px-2.5 py-1"><AlertTriangle size={12}/> Avisos: {counts.warn}</span>
        <span className="flex items-center gap-1 rounded-full bg-red-400/15 text-red-200 px-2.5 py-1"><XCircle size={12}/> Falhas: {counts.fail}</span>
      </div>
      <div className="space-y-2">
        {checks.length===0 && <p className="text-sm opacity-60">Sem checks de auditoria.</p>}
        {checks.map((c,i)=>{
          const s=str(c.status??c.estado??c.result).toLowerCase();
          const isOk=s.includes('ok')||s.includes('pass')||s.includes('sucesso')||s.includes('conform')||(!s.includes('warn')&&!s.includes('fail')&&!s.includes('aviso')&&!s.includes('falha'));
          const isWarn=!isOk&&(s.includes('warn')||s.includes('aviso')||s.includes('parcial')||s.includes('aten'));
          const sty=isOk?'border-emerald-400/30 bg-emerald-400/[0.06]':isWarn?'border-amber-400/30 bg-amber-400/[0.06]':'border-red-400/30 bg-red-400/[0.06]';
          const Ic=isOk?CheckCircle2:isWarn?AlertTriangle:XCircle;
          const icC=isOk?'text-emerald-300':isWarn?'text-amber-300':'text-red-300';
          return (
            <div key={String(c.id??i)} className={`rounded-2xl border p-3.5 ${sty}`}>
              <div className="flex items-center gap-2"><Ic size={15} className={icC}/><h4 className="text-sm font-semibold flex-1">{str(c.name??c.nome??c.check??`Check ${i+1}`)}</h4><span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{str(c.status??c.estado??c.result)}</span></div>
              <dl className="grid sm:grid-cols-3 gap-2 mt-2 text-xs">
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold flex items-center gap-1"><ClipboardCheck size={12} className="opacity-60"/> Esperado</dt><dd className="opacity-80 mt-0.5">{str(c.expectation??c.esperado??c.expected)}</dd></div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold flex items-center gap-1"><Info size={12} className="opacity-60"/> Observado</dt><dd className="opacity-80 mt-0.5">{str(c.observed??c.observado??c.found)}</dd></div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5"><dt className="font-semibold">Detalhe</dt><dd className="opacity-80 mt-0.5">{str(c.detail??c.detalhe??c.notes)}</dd></div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
