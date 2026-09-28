import React from 'react';
import { PillarInfo, VitruvianPillar } from '../types';
import { Shield, Brain, BookOpen, Flame, Compass, AlertCircle, ArrowUpRight } from 'lucide-react';

interface VitruvianDashboardProps {
  pillars: PillarInfo[];
  activeBottleneck: VitruvianPillar;
  onSelectPillar?: (pillar: VitruvianPillar) => void;
}

export const VitruvianDashboard: React.FC<VitruvianDashboardProps> = ({
  pillars,
  activeBottleneck,
  onSelectPillar
}) => {
  const getPillarIcon = (id: VitruvianPillar) => {
    switch (id) {
      case 'mente':
        return <Brain className="w-5 h-5 text-violet-400" />;
      case 'intelecto':
        return <BookOpen className="w-5 h-5 text-violet-400" />;
      case 'corpo_acao':
        return <Flame className="w-5 h-5 text-violet-500 animate-pulse" />;
      case 'proposito':
        return <Compass className="w-5 h-5 text-violet-400" />;
    }
  };

  const getStatusBadge = (status: PillarInfo['status']) => {
    switch (status) {
      case 'forca':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
            Força Consolidada
          </span>
        );
      case 'gargalo_atual':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-violet-950/90 text-violet-300 border border-violet-500 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Gargalo Principal Ativo
          </span>
        );
      case 'nao_avaliado_ainda':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-zinc-900 text-zinc-400 border border-zinc-700">
            Por avaliar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Vitruvian Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#0d0d14] to-black border border-violet-900/40 p-6 md:p-8 cyber-glass">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-600/50 text-violet-400 text-xs font-mono uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Arquitetura Conceitual dos 4 Pilares
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-wide">
              Vitruvian System Dashboard
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              O Vitruvian System organiza quem está a aprender. O progresso é avaliado por evidências observáveis no mundo real e nunca por estados emocionais autorreportados.
            </p>
          </div>

          {/* Active Bottleneck summary badge */}
          <div className="p-4 rounded-xl bg-black/80 border border-violet-600/60 shadow-lg cyber-glow-red flex items-center gap-4">
            <div className="p-3 rounded-lg bg-violet-950 border border-violet-600 text-violet-400">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Foco do V8 Master Prompt
              </div>
              <div className="text-base font-bold text-white uppercase font-display">
                {pillars.find((p) => p.id === activeBottleneck)?.title || 'Corpo & Ação'}
              </div>
              <div className="text-xs text-violet-400 font-mono">
                Determina por onde o currículo começa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => {
          const isBottleneck = pillar.status === 'gargalo_atual' && pillar.id === activeBottleneck;
          return (
            <div
              key={pillar.id}
              onClick={() => onSelectPillar && onSelectPillar(pillar.id)}
              className={`relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isBottleneck
                  ? 'bg-gradient-to-b from-[#18080a] to-[#0c0c12] border-violet-600 cyber-glow-red scale-[1.02]'
                  : 'bg-[#0e0e14]/90 border-zinc-800 hover:border-violet-900/60 hover:bg-[#12121a]'
              }`}
            >
              <div>
                {/* Pillar Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{pillar.emoji}</span>
                    <div className="p-1.5 rounded-md bg-black/50 border border-zinc-800">
                      {getPillarIcon(pillar.id)}
                    </div>
                  </div>
                  {getStatusBadge(isBottleneck ? 'gargalo_atual' : pillar.status)}
                </div>

                <h3 className="text-lg font-bold font-display text-white tracking-wide">
                  {pillar.title}
                </h3>
                <div className="text-xs font-mono text-violet-400/90 mb-2">
                  {pillar.subtitle}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                  {pillar.description}
                </p>

                {/* Score bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Nível observável</span>
                    <span className="text-zinc-300 font-bold">{pillar.status === 'nao_avaliado_ainda' ? '—' : `${pillar.score}%`}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBottleneck ? 'bg-violet-500 shadow-sm shadow-violet-500' : 'bg-zinc-600'
                      }`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>

                {/* Invisible Modules */}
                {pillar.invisibleModules && (
                  <div className="border-t border-zinc-800/80 pt-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                      Módulos Invisíveis:
                    </div>
                    <ul className="space-y-1">
                      {pillar.invisibleModules.slice(0, 3).map((mod, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-violet-500" />
                          <span className="truncate">{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer action */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-violet-400">
                <span>Ver detalhes do pilar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
