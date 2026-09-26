import React, { useState } from 'react';
import { UserProfile, ContentFormat, VitruvianPillar } from '../types';
import { Sparkles, Compass, AlertTriangle, BookOpen, Film, Clock, Target, CheckCircle2 } from 'lucide-react';

interface ReaderDiagnosticModalProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile, bottleneckPillar: VitruvianPillar) => void;
}

export const ReaderDiagnosticModal: React.FC<ReaderDiagnosticModalProps> = ({
  user,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [contentPref, setContentPref] = useState<ContentFormat>('livros');
  const [urgentTarget, setUrgentTarget] = useState('');
  const [timeAvailable, setTimeAvailable] = useState<number>(8);
  const [weakPoint, setWeakPoint] = useState('');
  const [activeProject, setActiveProject] = useState('');
  const [selectedBottleneck, setSelectedBottleneck] = useState<VitruvianPillar>('corpo_acao');
  const [vagueWarning, setVagueWarning] = useState('');

  const validateConcreteness = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    if (trimmed.length < 10) return false;
    const vaguePhrases = [
      'quero melhorar',
      'ser melhor',
      'ter sucesso',
      'aprender coisas',
      'evoluir',
      'ganhar dinheiro',
      'ler mais'
    ];
    for (const phrase of vaguePhrases) {
      if (trimmed === phrase) return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setVagueWarning('');

    if (step === 2) {
      if (!urgentTarget.trim()) {
        setVagueWarning('Por favor indique o seu objetivo.');
        return;
      }
      if (!validateConcreteness(urgentTarget)) {
        setVagueWarning(
          'Aviso do Motor Adaptativo: Resposta vaga detetada ("quero melhorar"). Concretize com prazo e ação verificável. Exemplo: "Validar o primeiro serviço pago em 60 dias e manter consistência diária."'
        );
        return;
      }
    }

    if (step === 3) {
      if (!weakPoint.trim()) {
        setVagueWarning('Por favor identifique o seu principal ponto fraco.');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete evaluation
      const updated: UserProfile = {
        ...user,
        learnerData: {
          ...user.learnerData,
          contentPreference: contentPref,
          target90DaysResult: urgentTarget,
          weeklyHoursAvailable: timeAvailable,
          weakPoints: weakPoint,
          activeProject: activeProject || 'Estruturação do Bloco Diário de Foco',
          currentBottleneck: selectedBottleneck,
          currentBottleneckPillar: selectedBottleneck,
        },
        evaluated: true
      };
      onComplete(updated, selectedBottleneck);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl p-6 md:p-8 bg-[#0a0a0f] border-2 border-red-600/50 rounded-2xl shadow-2xl cyber-glow-red overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Progress bar */}
        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300 shadow-sm shadow-red-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                Motor de Mentoria Adaptativa <span className="text-red-500 text-sm font-mono">v8.0</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Diagnóstico de Entrada & Calibração do Perfil do Leitor (Passo {step} de {totalSteps})
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
            Regra: Não Inventar Respostas
          </span>
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* STEP 1: PREFERÊNCIA DE FORMATO (LIVROS VS DOCUMENTÁRIOS/FILMES/SÉRIES) */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400" />
                  Como prefere assimilar conhecimento prático?
                </h3>
                <p className="text-xs text-zinc-400">
                  A Universidade Cibernética adapta-se ao seu estilo real. Se não gostar ou tiver bloqueio com livros extensos, o sistema substitui automaticamente por documentários premiados, séries investigativas e estudos em vídeo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setContentPref('livros')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    contentPref === 'livros'
                      ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-900/30 text-white'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-semibold text-sm">Leitura Tradicional</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Livros canónicos, ensaios e manuais estratégicos.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setContentPref('audiovisual')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    contentPref === 'audiovisual'
                      ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-900/30 text-white'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🎬</div>
                  <div className="font-semibold text-sm">Audiovisual Factual</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Documentários científicos, séries e filmes reais.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setContentPref('misto')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    contentPref === 'misto'
                      ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-900/30 text-white'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold text-sm">Formato Híbrido</div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Capítulos-chave de livros + documentários aplicados.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OBJETIVO URGENTE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-400" />
                  Qual é o seu objetivo mais urgente para os próximos 60–90 dias?
                </label>
                <p className="text-xs text-zinc-400 mb-3">
                  Evite respostas vagas como "quero ser melhor". Especifique uma mudança mensurável (projeto, receita, disciplina, saúde ou rotina).
                </p>
                <textarea
                  rows={4}
                  value={urgentTarget}
                  onChange={(e) => setUrgentTarget(e.target.value)}
                  placeholder="Ex: Quero construir uma rotina matinal inegociável de 90 minutos de foco e validar o meu primeiro cliente pago de serviços nos próximos 60 dias."
                  className="w-full p-3.5 rounded-xl bg-black/70 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-sm outline-none transition-all placeholder-zinc-600"
                />
              </div>

              {vagueWarning && (
                <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-600 text-red-200 text-xs font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{vagueWarning}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PONTO FRACO MAIS CRÍTICO */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Qual é o seu ponto fraco ou bloqueio mais crítico atualmente?
                </label>
                <p className="text-xs text-zinc-400 mb-3">
                  O que é que normalmente sabota os seus planos (procrastinação, falta de energia física, sobrecarga de informação, distração digital ou medo de julgamento)?
                </p>
                <textarea
                  rows={4}
                  value={weakPoint}
                  onChange={(e) => setWeakPoint(e.target.value)}
                  placeholder="Ex: Começo com muito entusiasmo mas perco a consistência após 4 dias, dispersando-me no telemóvel e consumindo vídeos sem executar nada prático."
                  className="w-full p-3.5 rounded-xl bg-black/70 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-sm outline-none transition-all placeholder-zinc-600"
                />
              </div>
            </div>
          )}

          {/* STEP 4: TEMPO SEMANAL DISPONÍVEL */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  Quantas horas realistas por semana pode dedicar ao plano prático?
                </label>
                <p className="text-xs text-zinc-400 mb-4">
                  Seja rigoroso: o currículo V8 rejeita metas irreais que geram culpa ou abandono.
                </p>
                <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <input
                    type="range"
                    min="3"
                    max="25"
                    step="1"
                    value={timeAvailable}
                    onChange={(e) => setTimeAvailable(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="font-mono font-bold text-red-400 text-lg w-20 text-right">
                    {timeAvailable}h / sem
                  </div>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  {timeAvailable <= 5 && 'Ritmo Leve: 30 a 45 minutos por dia (foco em 1 hábito chave).'}
                  {timeAvailable > 5 && timeAvailable <= 12 && 'Ritmo Padrão: 1 a 1h30 por dia (recomendado para a maioria).'}
                  {timeAvailable > 12 && 'Ritmo Intensivo: Scaffolding acelerado com projeto semanal.'}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Tem algum projeto ativo agora? (Opcional)
                </label>
                <input
                  type="text"
                  value={activeProject}
                  onChange={(e) => setActiveProject(e.target.value)}
                  placeholder="Ex: Lançamento de freelance / Estudo para exames / Melhoria física"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-zinc-700 focus:border-red-500 text-white text-sm outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 5: CLASSIFICAÇÃO NO VITRUVIAN SYSTEM (GARGALO ATUAL) */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  Identificação do Pilar Gargalo (Vitruvian System)
                </h3>
                <p className="text-xs text-zinc-400">
                  O V8 Master Prompt nunca recomenda currículos a esmo: a primeira fase deve atacar exatamente o pilar que está a bloquear os restantes. Onde está o seu maior travão?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBottleneck('mente')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedBottleneck === 'mente'
                      ? 'bg-red-950/70 border-red-500 shadow-md text-white'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <span>🧠</span> Mente (Cognitive Interface)
                  </div>
                  <div className="text-xs text-zinc-400">
                    Ansiedade, pensamentos intrusivos, reatividade emocional, dispersão de foco.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBottleneck('corpo_acao')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedBottleneck === 'corpo_acao'
                      ? 'bg-red-950/70 border-red-500 shadow-md text-white'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <span>⚡</span> Corpo & Ação (Camada de Execução)
                  </div>
                  <div className="text-xs text-zinc-400">
                    Procrastinação, sono desregulado, falta de hábitos diários consistentes, baixa energia.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBottleneck('intelecto')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedBottleneck === 'intelecto'
                      ? 'bg-red-950/70 border-red-500 shadow-md text-white'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <span>📚</span> Intelecto (Estrutura de Conhecimento)
                  </div>
                  <div className="text-xs text-zinc-400">
                    Dificuldade de retenção, leitura superficial, falta de modelos mentais de decisão.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBottleneck('proposito')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedBottleneck === 'proposito'
                      ? 'bg-red-950/70 border-red-500 shadow-md text-white'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <span>🎯</span> Propósito (Externalização de Valor)
                  </div>
                  <div className="text-xs text-zinc-400">
                    Sem clareza de carreira, dificuldade em criar ofertas que o mercado pague, indecisão.
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Buttons */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-colors"
            >
              ← Voltar
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-xs font-mono uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-950 flex items-center gap-2"
          >
            {step === totalSteps ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-300" />
                Gerar Plano Personalizado
              </>
            ) : (
              'Continuar Diagnóstico →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
