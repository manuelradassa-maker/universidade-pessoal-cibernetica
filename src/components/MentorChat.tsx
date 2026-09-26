import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile, VitruvianPillar } from '../types';
import { Avatar } from './Avatar';
import { Send, Bot, User, AlertOctagon, BatteryLow, Zap, Sparkles, RefreshCw, HeartHandshake, PhoneCall } from 'lucide-react';

interface MentorChatProps {
  user: UserProfile;
  activeBottleneck: VitruvianPillar;
  onUpdateUserMode: (mode: UserProfile['systemMode']) => void;
  onGenerateHandoff: () => void;
}

export const MentorChat: React.FC<MentorChatProps> = ({
  user,
  activeBottleneck,
  onUpdateUserMode,
  onGenerateHandoff
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      timestamp: 'Agora',
      text: `Salve, ${user.name || 'Estudante Cibernético'}! 🏛️⚡ Sou a tua Mentora de Diagnóstico & Guardiã do Ciclo na Universidade Pessoal Cibernética. Estou ativa 24/7 para monitorizar o teu scaffolding de desenvolvimento, verificar evidências reais e proteger o teu foco contra consumo passivo.`
    },
    {
      id: 'msg-init-2',
      sender: 'ai',
      timestamp: 'Agora',
      text: `O teu pilar identificado como gargalo prioritário é [${activeBottleneck.toUpperCase().replace('_', ' & ')}]. Todas as prescrições estão focadas nele agora. Como correu a tua sessão prática de foco hoje? Encontraste algum atrito ou bloqueio?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // AI Response generation using the Master Prompt guidelines
    setTimeout(() => {
      let aiReply = '';
      const lower = userText.toLowerCase();

      // Check Mode B Trigger (Critical safety protocol)
      if (
        lower.includes('desistir da vida') ||
        lower.includes('me magoar') ||
        lower.includes('suicidio') ||
        lower.includes('acabar com tudo')
      ) {
        onUpdateUserMode('modo_b_falha_critica');
        aiReply =
          '🚨 PROTOCOLO MODO B ATIVADO: A tua vida e integridade são o bem mais precioso. Por favor, faz uma pausa imediata no currículo. Estou a encaminhar-te para canais humanos de apoio e escuta imediata.';
      }
      // Check Mode A Trigger (Fatigue / cognitive burnout)
      else if (
        user.systemMode === 'modo_a_baixa_energia' ||
        lower.includes('muito cansado') ||
        lower.includes('esgotado') ||
        lower.includes('sem forca')
      ) {
        onUpdateUserMode('modo_a_baixa_energia');
        aiReply =
          '🔋 [Modo A — Baixa Energia Ativado]: Reduzindo o output ao essencial. \n\nDescansa o teu cérebro hoje. Qual é a única pequena ação física (10 minutos) que podes fazer agora para não quebrar o ciclo antes de dormir?';
      }
      // Vague answers detection
      else if (
        lower.length < 15 &&
        (lower.includes('quero melhorar') ||
          lower.includes('tudo bem') ||
          lower.includes('nao sei') ||
          lower.includes('vou tentar'))
      ) {
        aiReply =
          '⚠️ Aviso da Mentora Adaptativa: Detetei uma resposta vaga. O sistema não opera sobre generalidades ou autoajuda passiva. Diz-me exatamente: a que horas iniciaste o teu bloco de trabalho hoje e qual foi o entregável factual produzido?';
      }
      // Documentaries vs books preference response
      else if (
        lower.includes('documentario') ||
        lower.includes('serie') ||
        lower.includes('filme') ||
        user.learnerData.contentPreference === 'audiovisual'
      ) {
        aiReply =
          `Perfeito! Registado na tua matriz de perfil: como preferes o formato audiovisual, a tua trilha substitui leituras pesadas por investigações factuais como "Free Solo" (preparação sob pressão extrema), "The Social Dilemma" (antídoto contra economia da atenção) e "Jiro Dreams of Sushi" (maestria por repetição). Já começaste a primeira visualização analítica?`;
      }
      // General Adaptive Coaching Response
      else {
        aiReply =
          `Compreendido. Avaliando pelo prisma do pilar [${activeBottleneck.toUpperCase().replace('_', ' & ')}]: o foco de hoje deve ser zero atrito e validação observável. Lembra-te do princípio V8: "Progresso não é terminar livros ou vídeos, é mudar o comportamento e decisões sob pressão." Precisas de ajustar a meta desta semana ou queres registar a tua revisão semanal agora?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_ai_' + Date.now(),
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: aiReply
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#0c0c12] border-2 border-red-600/40 rounded-2xl overflow-hidden shadow-2xl cyber-glow-red">
      {/* Top Bar with System Mode controls & 24/7 indicator */}
      <div className="p-4 bg-gradient-to-r from-red-950/60 via-[#14141d] to-black border-b border-red-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display text-white tracking-wide">
                IA Mentora & Guardiã do Ciclo
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                24/7 ONLINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Foco: {user.learnerData.currentBottleneckPillar}
            </p>
          </div>
        </div>

        {/* Quick System Mode Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onUpdateUserMode(
                user.systemMode === 'modo_a_baixa_energia' ? 'normal' : 'modo_a_baixa_energia'
              )
            }
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              user.systemMode === 'modo_a_baixa_energia'
                ? 'bg-amber-950 text-amber-300 border border-amber-500'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <BatteryLow className="w-3.5 h-3.5 text-amber-400" />
            <span>Modo A (Baixa Energia)</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateUserMode('modo_b_falha_critica')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 transition-all flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Modo B (Apoio)</span>
          </button>

          <button
            type="button"
            onClick={onGenerateHandoff}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-all flex items-center gap-1.5"
            title="Gerar Documento de Transferência para reiniciar conversa sem perder progresso"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Handoff</span>
          </button>
        </div>
      </div>

      {/* Mode B Alert Banner (If active) */}
      {user.systemMode === 'modo_b_falha_critica' && (
        <div className="p-4 bg-gradient-to-r from-red-950 via-red-900 to-black border-b-2 border-red-600 text-white animate-pulse">
          <div className="flex items-start gap-3">
            <HeartHandshake className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="text-xs space-y-2">
              <div className="font-bold text-sm text-red-200">
                🛡️ Presença e Apoio Humano Imediato
              </div>
              <p className="text-zinc-200">
                O sistema de estudos foi suspenso para cuidar do teu bem-estar emocional. Lembra-te que não estás sozinho. Por favor, liga ou envia mensagem a uma destas linhas gratuitas e confidenciais:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                <div className="p-2 rounded bg-black/60 border border-red-500/50">
                  🇵🇹 <strong>Portugal (SNS 24):</strong> 808 24 24 24 / Linha SOS Voz Amiga: 21 354 45 45
                </div>
                <div className="p-2 rounded bg-black/60 border border-red-500/50">
                  🇧🇷 <strong>Brasil (CVV):</strong> Ligue 188 (Disponível 24 horas por dia)
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => onUpdateUserMode('normal')}
                  className="px-3 py-1 rounded bg-zinc-900 text-xs text-zinc-300 hover:text-white border border-zinc-700"
                >
                  Voltar ao Modo Normal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                  isAI
                    ? 'bg-red-950 border border-red-600 text-red-400 shadow-md shadow-red-900/40'
                    : 'bg-zinc-800 border border-zinc-700 text-white'
                }`}
              >
              {isAI ? '🏛️' : <Avatar avatar={user.avatar} avatarType={user.avatarType} name={user.name} size="sm" ring={false} />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-1 shadow-lg ${
                  isAI
                    ? 'bg-[#151520] border border-red-900/30 text-zinc-200 rounded-tl-none'
                    : 'bg-gradient-to-r from-red-700 to-red-800 text-white rounded-tr-none font-medium'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono text-zinc-400">
                  <span className="font-bold text-red-400">{isAI ? 'Mentora V8' : user.name}</span>
                  <span>{m.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 p-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Mentora Adaptativa a processar segundo a lógica V8...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-black/90 border-t border-zinc-800/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            user.systemMode === 'modo_a_baixa_energia'
              ? 'Modo A: Escreve a tua dúvida essencial em poucas palavras...'
              : 'Diz à Mentora o que executaste hoje, dúvidas ou bloqueios...'
          }
          className="flex-1 px-4 py-3 rounded-xl bg-[#111118] border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white placeholder-zinc-500 text-xs md:text-sm outline-none transition-all"
        />
        <button
          type="submit"
          className="p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition-all shadow-lg shadow-red-950 flex items-center justify-center group"
        >
          <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>
    </div>
  );
};
