import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ClipboardCheck, Info, Layers } from 'lucide-react';
import { V8_AUDIT } from '../data/masterLibrary';
import type { V8AuditCheck } from '../types';

/**
 * Vista da auditoria de conformidade V8.
 *
 * LÊ o relatório real devolvido por runV8Audit(): um objecto
 * { generatedAt, checks, totals, passed, warnings, failures }.
 * Versões anteriores tentavam iterar o relatório como se fosse uma array
 * e mostravam contagens fixas (100/100/50). Nenhum número nesta vista é
 * escrito à mão: tudo sai de V8_AUDIT.
 */

type AuditStatus = V8AuditCheck['status'];

const STATUS: Record<AuditStatus, { label: string; box: string; icon: string; chip: string; Icon: typeof CheckCircle2 }> = {
  ok: {
    label: 'OK',
    box: 'border-emerald-400/30 bg-emerald-400/[0.06]',
    icon: 'text-emerald-300',
    chip: 'bg-emerald-400/15 text-emerald-200',
    Icon: CheckCircle2,
  },
  aviso: {
    label: 'Aviso',
    box: 'border-amber-400/30 bg-amber-400/[0.06]',
    icon: 'text-amber-300',
    chip: 'bg-amber-400/15 text-amber-200',
    Icon: AlertTriangle,
  },
  falha: {
    label: 'Falha',
    box: 'border-violet-400/30 bg-violet-400/[0.06]',
    icon: 'text-violet-300',
    chip: 'bg-violet-400/15 text-violet-200',
    Icon: XCircle,
  },
};

const Stat = ({ value, label, accent }: { value: number; label: string; accent?: boolean }) => (
  <div className={`rounded-2xl border p-3 text-center ${accent ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-white/10 bg-white/[0.03]'}`}>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-[11px] opacity-60">{label}</p>
  </div>
);

export default function V8AuditView() {
  const { checks, totals, passed, warnings, failures, generatedAt } = V8_AUDIT;
  const generatedLabel = new Date(generatedAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-300" />
          <h2 className="font-bold">Auditoria V8</h2>
        </div>
        <p className="text-xs opacity-70 mt-2 leading-relaxed">
          Declaração de método: verificação independente item a item do catálogo — compara o esperado com o
          observado em cada check, classifica como ok, aviso ou falha e regista o detalhe para correção antes da
          certificação. Gerada a {generatedLabel} a partir do catálogo em memória.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Stat value={totals.pessoal} label="Verificados — Pessoal" />
        <Stat value={totals.negocios} label="Verificados — Negócios" />
        <Stat value={totals.pensamento} label="Verificados — Pensamento" />
        <Stat value={totals.unique} label="Títulos únicos" accent />
        <Stat value={totals.duplicates} label="Repetições entre listas" />
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${STATUS.ok.chip}`}>
          <CheckCircle2 size={12} /> Conformidade: {passed}
        </span>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${STATUS.aviso.chip}`}>
          <AlertTriangle size={12} /> Avisos: {warnings}
        </span>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${STATUS.falha.chip}`}>
          <XCircle size={12} /> Falhas: {failures}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
          <Layers size={12} /> {checks.length} checks
        </span>
      </div>

      {failures > 0 && (
        <p role="alert" className="rounded-2xl border border-violet-400/40 bg-violet-400/10 p-3 text-xs text-violet-200">
          Existem {failures} falha(s) de conformidade. O relatório não deve ser tratado como certificado enquanto
          não forem corrigidas e o check voltar a passar.
        </p>
      )}

      <div className="space-y-2">
        {checks.length === 0 && <p className="text-sm opacity-60">Sem checks de auditoria.</p>}
        {checks.map((check) => {
          const style = STATUS[check.status];
          const Icon = style.Icon;
          return (
            <div key={check.id} className={`rounded-2xl border p-3.5 ${style.box}`}>
              <div className="flex items-center gap-2">
                <Icon size={15} className={style.icon} />
                <h4 className="text-sm font-semibold flex-1">{check.label}</h4>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.chip}`}>
                  {style.label}
                </span>
              </div>
              <dl className="grid sm:grid-cols-3 gap-2 mt-2 text-xs">
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                  <dt className="font-semibold flex items-center gap-1">
                    <ClipboardCheck size={12} className="opacity-60" /> Esperado
                  </dt>
                  <dd className="opacity-80 mt-0.5">{check.expectation}</dd>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                  <dt className="font-semibold flex items-center gap-1">
                    <Info size={12} className="opacity-60" /> Observado
                  </dt>
                  <dd className="opacity-80 mt-0.5">{check.observed}</dd>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                  <dt className="font-semibold">Detalhe</dt>
                  <dd className="opacity-80 mt-0.5">{check.detail}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
