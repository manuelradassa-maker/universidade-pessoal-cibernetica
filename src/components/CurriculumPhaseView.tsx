import React, { useState } from 'react';
import { PracticalPhase, UserProfile, CurriculumResource } from '../types';
import { BookOpen, Film, Target, Calendar, CheckSquare, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

const roleLine = (r: CurriculumResource): string => `${r.role} · ${r.evidenceClass} · stage ${r.stage} · ${r.readDepth}`;

interface CurriculumPhaseViewProps {
  phase: PracticalPhase;
  user: UserProfile;
  onOpenReview: (type: 'semanal' | 'livro' | 'fase') => void;
}

export const CurriculumPhaseView: React.FC<CurriculumPhaseViewProps> = ({
  phase,
  user,
  onOpenReview
}) => {
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <div className="space-y-8">
      {/* V8 Master Prompt Rule Banner */}
      <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-950 border border-red-600 text-red-400">
            <Sparkles className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-red-400">
              Protocolo V8 — Entrega Restrita por Fases
            </div>
            <div className="text-sm font-semibold text-white">
              1 recurso principal + máx. 1 opcional + 1 projeto real de aplicação (4 a 8 semanas)
            </div>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
          ⚠️ Regra: Nunca gerar currículo completo de uma vez
        </div>
      </div>

      {/* Main Phase Header */}
      <div className="bg-[#0f0f16] border border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-red-950/80 text-red-400 border border-red-600/50 uppercase tracking-wider">
            {phase.pillar.toUpperCase().replace('_', ' & ')} • FASE EM EXECUÇÃO
          </span>
          <span className="text-xs font-mono text-zinc-400">
            Duração estimada: {phase.durationWeeks} semanas • Stage {phase.stage}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-white mb-2">
          {phase.title}
        </h2>
        <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
          O objetivo desta fase não é terminar leituras nem acumular páginas lidas, mas mudar
          compreensão, decisões práticas, consistência diária e resultados mensuráveis no mundo
          real.
        </p>
      </div>

      {/* Prescribed Resources (Adaptive based on content preference) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Resource Card */}
        <div className="bg-[#12121a] border-2 border-red-600/50 rounded-2xl p-6 cyber-glow-red flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-red-950 text-red-400 border border-red-500 uppercase tracking-wider flex items-center gap-1.5">
                {phase.mainResource.type === 'livro' ? <BookOpen className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                Prescrição Principal
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Profundidade: <strong className="text-red-300">{phase.mainResource.readDepth}</strong> · {roleLine(phase.mainResource)}
              </span>
            </div>

            <h3 className="text-xl font-bold font-display text-white mb-1">
              {phase.mainResource.title}
            </h3>
            <div className="text-sm font-medium text-red-400 mb-4">
              {phase.mainResource.creator} ({phase.mainResource.year}) • {phase.mainResource.durationOrPages}
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                <span className="font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                  Contribuição Central:
                </span>
                {phase.mainResource.coreContribution}
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                <span className="font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                  Melhor Aplicação Prática:
                </span>
                {phase.mainResource.bestPracticalApplication}
              </div>

              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-300">
                <span className="font-mono text-red-400 block mb-1 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Alerta Crítico / Distorção:
                </span>
                {phase.mainResource.criticalWarning}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => onOpenReview('livro')}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-600/60 text-red-200 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2"
            >
              Concluir Estudo & Fazer Revisão do Recurso
            </button>
          </div>
        </div>

        {/* Optional Complementary Resource or Alternative */}
        {phase.optionalResource ? (
          <div className="bg-[#12121a] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-red-400" />
                  Complemento Audiovisual Opcional
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {phase.optionalResource ? roleLine(phase.optionalResource) : ''}
                </span>
              </div>

              <h3 className="text-lg font-bold font-display text-white mb-1">
                {phase.optionalResource.title}
              </h3>
              <div className="text-sm font-medium text-zinc-400 mb-4">
                {phase.optionalResource.creator} ({phase.optionalResource.year}) • {phase.optionalResource.durationOrPages}
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                  <span className="font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                    Por que foi selecionado:
                  </span>
                  {phase.optionalResource.whyIncluded}
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                  <span className="font-mono text-zinc-500 block mb-1 uppercase tracking-wider">
                    Aplicação Observável:
                  </span>
                  {phase.optionalResource.bestPracticalApplication}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
              <div className="text-[11px] text-zinc-500 font-mono">
                Consumir apenas se não sobrecarregar o plano prático semanal.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#12121a] border border-zinc-800 rounded-2xl p-6 flex items-center justify-center text-center text-zinc-500 text-xs font-mono">
            Sem recurso complementar para esta fase para evitar sobrecarga cognitiva.
          </div>
        )}
      </div>

      {/* Real-World Project & Application */}
      <div className="bg-gradient-to-r from-red-950/30 via-[#101017] to-black border-2 border-red-600/40 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-950 border border-red-500 text-red-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-red-400">
            Exigência Não Negociável — applicationProject
            </div>
            <h3 className="text-xl font-bold font-display text-white">
            Projeto no Mundo Real: {phase.applicationProject.realWorldObjective}
            </h3>
          </div>
        </div>

        <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
          {phase.applicationProject.deliverable}
        </p>

        <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Entregável Concreto & Verificável:
            </span>
            <span className="text-xs font-semibold text-red-300">
              {phase.applicationProject.measurementCriteria}
            </span>
          </div>
          <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 whitespace-nowrap">
            Validação: {phase.applicationProject.evidenceProofRequired}
          </span>
        </div>
      </div>

      {/* Weekly Plan & Scaffolding */}
      <div className="bg-[#0f0f16] border border-zinc-800 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Plano de Execução Semanal
            </h3>
            <p className="text-xs text-zinc-400">
              Selecione a semana ativa para inspecionar os blocos operacionais
            </p>
          </div>

          <div className="flex items-center gap-2">
            {phase.weeklyPlan.map((wp) => (
              <button
                key={wp.week}
                onClick={() => setActiveWeek(wp.week)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeWeek === wp.week
                    ? 'bg-red-600 text-white shadow-md shadow-red-900'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Semana {wp.week}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Week Details */}
        {phase.weeklyPlan
          .filter((wp) => wp.week === activeWeek)
          .map((wp) => (
            <div key={wp.week} className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                <span className="text-[11px] font-mono text-red-400 uppercase tracking-wider block">
                  Foco da Semana {wp.week}:
                </span>
                <span className="text-base font-semibold text-white">{wp.focus}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                  Ações de Execução Diária:
                </span>
                {wp.actions.map((act, idx) => {
                  const taskId = `w${wp.week}_task_${idx}`;
                  const isDone = !!completedTasks[taskId];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTask(taskId)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-zinc-400 line-through'
                          : 'bg-[#12121a] border-zinc-800 hover:border-zinc-700 text-zinc-200'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-500 text-black'
                            : 'border-zinc-600 bg-zinc-900'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <span className="text-xs leading-relaxed">{act}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Métrica Mensurável da Semana:</span>
                <span className="text-red-400 font-semibold">{wp.measurableMetric}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onOpenReview('semanal')}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-red-600 text-white text-xs font-mono transition-all flex items-center gap-2"
                >
                  Submeter Revisão da Semana {wp.week} →
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="bg-[#0f0f16] border border-zinc-800 rounded-2xl p-6">
        <p className="text-xs text-zinc-300">DJ: {phase.assessment.decisionJournalPrompt}</p>
        <p className="text-xs text-zinc-300">CA: {phase.assessment.counterargumentExercise}</p>
      </div>
      {phase.deferredResources && phase.deferredResources.length > 0 && (
        <div className="p-5 rounded-2xl bg-black/50 border border-zinc-800">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>⏳</span> Livros e Conteúdos Deliberadamente Adiados (Para Evitar Precocidade)
          </div>
          <p className="text-xs text-zinc-400 mb-3">
            O V8 Master Prompt protege contra precocidade:
          </p>
          <ul className="space-y-1.5">
            {phase.deferredResources.map((item, idx) => (
              <li key={idx} className="text-xs text-zinc-300 flex items-center gap-2 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
