import React, { useState } from 'react';
import { UserProfile, PracticalPhase, PillarInfo } from '../types';
import { RefreshCw, Copy, Check, X, FileText } from 'lucide-react';

interface HandoffModalProps {
  user: UserProfile;
  phase: PracticalPhase;
  pillars: PillarInfo[];
  onClose: () => void;
}

export const HandoffModal: React.FC<HandoffModalProps> = ({
  user,
  phase,
  pillars,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  // Generate standardized V8 Handoff Markdown
  const handoffMarkdown = `# DOCUMENTO DE TRANSFERÊNCIA (HANDOFF) — UNIVERSIDADE PESSOAL CIBERNÉTICA
Data: ${new Date().toISOString()}
Versão do Sistema: Prompt Mestre V8 & Vitruvian System

## 1. PERFIL DO LEITOR ATUAL
- Identidade: ${user.name} (${user.email})
- Preferência de Formato: ${user.learnerData.contentPreference.toUpperCase()} (Livros / Audiovisual)
- Objetivo 90 dias: ${user.learnerData.target90DaysResult}
- Tempo Semanal Disponível: ${user.learnerData.weeklyHoursAvailable} horas/semana
- Ponto Fraco Mais Crítico: ${user.learnerData.weakPoints}
- Projeto em Andamento: ${user.learnerData.activeProject}
- Modo de Sistema: ${user.systemMode.toUpperCase()}

## 2. ESTADO DOS 4 PILARES DO VITRUVIAN SYSTEM
${pillars
  .map(
    (p) =>
      `- ${p.title} (${p.subtitle}): ${p.status.toUpperCase()} | Score Observável: ${p.score}% | Nota: ${p.notes}`
  )
  .join('\n')}

- Gargalo Principal Ativo: ${user.learnerData.currentBottleneckPillar.toUpperCase()}
- Bloqueio atual: ${user.learnerData.currentBottleneck}

## 3. FASE PRÁTICA ATUAL DO V8 MASTER PROMPT
- Fase: ${phase.title}
- Pilar Focado: ${phase.pillar.toUpperCase()}
- Recurso Principal: ${phase.mainResource.title} (${phase.mainResource.creator}) [${phase.mainResource.type}]
- Recurso Opcional: ${phase.optionalResource ? `${phase.optionalResource.title} (${phase.optionalResource.creator})` : 'Nenhum'}
- Projeto no Mundo Real: ${phase.applicationProject.realWorldObjective}
- Entregável: ${phase.applicationProject.deliverable}
- Medição: ${phase.applicationProject.measurementCriteria}
- Adiados: ${phase.deferredResources.join('; ')}

## 4. CRITÉRIOS DE GRADUAÇÃO & PRÓXIMO PONTO DE DECISÃO
- Comportamentais: ${phase.behavioralGraduationCriteria.join('; ')}
- completionCriteria: ${phase.completionCriteria.join('; ')}
- Próximo ponto de decisão: avançar só após cumplir completionCriteria + behavioralGraduationCriteria com revisão de fase.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(handoffMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl p-6 md:p-8 bg-[#0b0b12] border-2 border-red-600/50 rounded-2xl shadow-2xl cyber-glow-red overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950 border border-red-500/50 text-red-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Documento de Transferência (Handoff)
              </h2>
              <p className="text-xs text-zinc-400">
                Protocolo Secção 7 & 8: Permite reiniciar conversa sem perder progresso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-3">
          Se a conversa com a IA começar a ficar desorganizada ou lenta, copia este documento de transferência e cola-o numa nova conversa junto com o Prompt Mestre V8.
        </p>

        <div className="flex-1 overflow-y-auto mb-4 bg-black/70 p-4 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap select-all">
          {handoffMarkdown}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-mono text-zinc-500">
            {copied ? '✅ Copiado para a área de transferência!' : 'Clique abaixo para copiar'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-mono font-semibold shadow-lg shadow-red-950 flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado com Sucesso' : 'Copiar Handoff Markdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
