import React, { useState } from 'react';
import { ReviewEntry, VitruvianPillar } from '../types';
import { CheckSquare, X, Send } from 'lucide-react';

interface ReviewModalProps {
  type: 'semanal' | 'livro' | 'fase';
  activeBottleneck: VitruvianPillar;
  onClose: () => void;
  onSubmit: (review: ReviewEntry) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  type,
  activeBottleneck,
  onClose,
  onSubmit
}) => {
  const [chapters, setChapters] = useState('');
  const [keyIdeas, setKeyIdeas] = useState('');
  const [appliedAction, setAppliedAction] = useState('');
  const [resultObtained, setResultObtained] = useState('');
  const [difficulties, setDifficulties] = useState('');
  const [avoided, setAvoided] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [adjustments, setAdjustments] = useState('');
  const [explain, setExplain] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyIdeas.trim() || !appliedAction.trim() || !resultObtained.trim()) {
      setError('Por favor preencha as ideias retidas, o que foi aplicado e o resultado obtido.');
      return;
    }

    const newReview: ReviewEntry = {
      id: 'rev_' + Date.now(),
      type: type,
      date: new Date().toLocaleDateString('pt-PT'),
      completedChaptersOrEpisodes: chapters.trim(),
      timeSpent: timeSpent.trim(),
      keyIdeas: keyIdeas.trim(),
      appliedAction: appliedAction.trim(),
      resultObtained: resultObtained.trim(),
      difficulties: difficulties.trim(),
      avoided: avoided.trim(),
      adjustmentsNeeded: adjustments.trim(),
      canExplainWithoutNotes: explain,
      pillarUpdated: activeBottleneck
    };

    onSubmit(newReview);
  };

  const getTitle = () => {
    switch (type) {
      case 'semanal':
        return 'Revisão Semanal de Execução';
      case 'livro':
        return 'Revisão de Fim de Livro / Documentário';
      case 'fase':
        return 'Revisão de Fim de Fase & Recalibração do Perfil';
    }
  };

  const getSub = () => {
    switch (type) {
      case 'semanal':
        return 'Protocolo Secção 7: Páginas/episódios concluídos, aplicação real, tempo gasto e ajustes necessários.';
      case 'livro':
        return 'Protocolo Secção 7: Tese central, 3 ideias mais fortes, teste de explicação sem notas e mudanças comportamentais.';
      case 'fase':
        return 'Protocolo Secção 7: Evidências reais de progresso, bloqueio atual e autorização da próxima fase.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl p-6 md:p-8 bg-[#0d0d14] border-2 border-violet-600/50 rounded-2xl shadow-2xl cyber-glow-red overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-950 border border-violet-500/50 text-violet-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">{getTitle()}</h2>
              <p className="text-xs text-zinc-400">{getSub()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-violet-950/80 border border-violet-600 text-violet-200 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              Capítulos / Páginas / Episódios Concluídos:
            </label>
            <input
              type="text"
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
              placeholder="Ex: Capítulos 1 a 4 (páginas 1 a 92) ou Episódio 1 e 2"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-zinc-700 text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              Principais ideias retidas / Tese Central:
            </label>
            <textarea
              rows={3}
              value={keyIdeas}
              onChange={(e) => setKeyIdeas(e.target.value)}
              placeholder="O que é que realmente mudou a tua perceção? Sintetiza sem olhar para as notas."
              className="w-full p-3 rounded-lg bg-black/60 border border-zinc-700 text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                O que foi aplicado na prática?
              </label>
              <textarea
                rows={3}
                value={appliedAction}
                onChange={(e) => setAppliedAction(e.target.value)}
                placeholder="Ex: Instalei o bloco de 90m das 7h às 8h30 sem telefone."
                className="w-full p-3 rounded-lg bg-black/60 border border-zinc-700 text-white text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Resultado Observável Obtido:
              </label>
              <textarea
                rows={3}
                value={resultObtained}
                onChange={(e) => setResultObtained(e.target.value)}
                placeholder="Ex: Concluí o esboço de código e tive 0 interrupções."
                className="w-full p-3 rounded-lg bg-black/60 border border-zinc-700 text-white text-xs outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
              O que foi difícil?
              </label>
              <textarea
                rows={2}
                value={difficulties}
                onChange={(e) => setDifficulties(e.target.value)}
                placeholder="Ex: Vontade de checar notificações nos primeiros 15 minutos."
                className="w-full p-3 rounded-lg bg-black/60 border border-zinc-700 text-white text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                O que foi evitado ou adiado?
              </label>
              <textarea
                rows={2}
                value={avoided}
                onChange={(e) => setAvoided(e.target.value)}
                placeholder="Descreve uma ação concreta que evitaste ou adiastes."
                className="w-full p-3 rounded-lg bg-black/60 border border-zinc-700 text-white text-xs outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <label className="block text-xs font-mono text-zinc-300">Ajuste necessário para o próximo ciclo:
            <textarea rows={2} value={adjustments} onChange={(e) => setAdjustments(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/60 p-3 text-xs text-white outline-none focus:border-violet-500" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-mono text-zinc-300">Tempo gasto (se conhecido)
              <input value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/60 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500" placeholder="Ex.: 2 h 30 min" />
            </label>
            <label className="flex items-center gap-2 self-end rounded-lg border border-zinc-800 p-3 text-xs text-zinc-300">
              <input type="checkbox" checked={explain} onChange={(e) => setExplain(e.target.checked)} className="accent-violet-600" />
              Consigo explicar as ideias sem consultar notas
            </label>
          </div>

          <div className="p-3 rounded-xl bg-black/70 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <strong>Registo transparente:</strong> esta revisão é uma declaração tua. A pontuação dos pilares não aumenta sem um critério observável definido.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-xs font-mono font-semibold shadow-lg shadow-violet-950 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submeter & Atualizar Pilares
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
