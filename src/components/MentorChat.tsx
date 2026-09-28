import React, { useEffect, useRef, useState } from 'react';
import { AlertOctagon, BatteryLow, Bot, HeartHandshake, PhoneCall, RefreshCw, Send } from 'lucide-react';
import type { ChatMessage, UserProfile, VitruvianPillar } from '../types';
import { supabase } from '../lib/supabase';
import { Avatar } from './Avatar';

interface MentorChatProps {
  user: UserProfile;
  activeBottleneck: VitruvianPillar;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  onUpdateUserMode: (mode: UserProfile['systemMode']) => void;
  onGenerateHandoff: () => void;
}

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const safetyPattern = /\b(suic[ií]d|matar-me|magoar-me|acabar com tudo|desistir da vida|tirar a minha vida)\b/i;

export const MentorChat: React.FC<MentorChatProps> = ({ user, activeBottleneck, messages, onMessagesChange, onUpdateUserMode, onGenerateHandoff }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', timestamp: timeNow(), text };
    const history = [...messages.filter((message) => message.sender !== 'system'), userMessage];
    onMessagesChange(history);
    setInput('');
    setError('');
    setIsTyping(true);

    if (safetyPattern.test(text)) onUpdateUserMode('modo_b_falha_critica');
    else if (/muito cansad|esgotad|sem for[cç]a|baixa energia/i.test(text)) onUpdateUserMode('modo_a_baixa_energia');

    try {
      if (!supabase) throw new Error('A ligação ao serviço não está configurada.');
      const { data, error: invokeError } = await supabase.functions.invoke('mentor-chat', {
        body: {
          messages: history.slice(-20).map(({ sender, text: messageText }) => ({ role: sender === 'user' ? 'user' : 'assistant', content: messageText })),
          mode: safetyPattern.test(text) ? 'modo_b_falha_critica' : user.systemMode,
          activeBottleneck,
        },
      });
      if (invokeError) throw invokeError;
      if (typeof data?.reply !== 'string' || !data.reply.trim()) throw new Error('O serviço não devolveu uma resposta válida.');
      const reply: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', timestamp: timeNow(), text: data.reply.trim() };
      onMessagesChange([...history, reply]);
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : 'Erro de ligação.';
      setError(`Não foi possível obter resposta da mentora. ${reason} A tua mensagem ficou guardada nesta conta; tenta novamente.`);
    } finally {
      setIsTyping(false);
    }
  };

  return <div className="flex h-[750px] flex-col overflow-hidden rounded-2xl border border-violet-600/40 bg-[#0c0c12] shadow-2xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-900/40 bg-gradient-to-r from-violet-950/60 via-[#14141d] to-black p-4">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500 bg-violet-600/20 text-violet-400"><Bot className="h-6 w-6" /></div><div><h3 className="text-sm font-bold text-white">Mentora V8</h3><p className="text-[11px] text-zinc-400">Pilar em foco: {activeBottleneck.replace('_', ' ')}</p></div></div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onUpdateUserMode(user.systemMode === 'modo_a_baixa_energia' ? 'normal' : 'modo_a_baixa_energia')} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300"><BatteryLow className="h-3.5 w-3.5" />Modo A</button>
        <button type="button" onClick={() => onUpdateUserMode('modo_b_falha_critica')} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-700 bg-violet-950/80 px-2.5 py-1.5 text-xs text-violet-200"><AlertOctagon className="h-3.5 w-3.5" />Apoio</button>
        <button type="button" onClick={onGenerateHandoff} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300"><RefreshCw className="h-3.5 w-3.5" />Handoff</button>
      </div>
    </div>
    {user.systemMode === 'modo_b_falha_critica' && <div className="border-b border-violet-600 bg-violet-950/80 p-4 text-xs text-violet-100"><p className="mb-2 flex items-center gap-2 font-semibold"><HeartHandshake size={17} />O teu bem-estar vem antes dos estudos. Se houver perigo imediato, liga 112.</p><div className="flex flex-wrap gap-4"><a className="inline-flex items-center gap-1 underline" href="tel:1411"><PhoneCall size={14} /> Portugal: 1411 (prevenção do suicídio)</a><a className="inline-flex items-center gap-1 underline" href="tel:188"><PhoneCall size={14} /> Brasil: CVV 188</a><a className="inline-flex items-center gap-1 underline" href="tel:192"><PhoneCall size={14} /> Brasil: emergência 192</a></div><button className="mt-3 underline" onClick={() => onUpdateUserMode('normal')}>Fechar aviso</button></div>}
    <p className="border-b border-zinc-800 bg-zinc-950/70 px-4 py-2 text-[11px] text-zinc-400">As mensagens e o perfil de aprendizagem sao enviados ao OpenRouter, guardados de forma privada nesta conta e encaminhados apenas para fornecedores elegiveis a ZDR e sem recolha de dados. Evita incluir dados sensiveis.</p>
    <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      {!messages.length && <div className="mx-auto mt-12 max-w-sm text-center text-sm text-zinc-400"><Bot className="mx-auto mb-3 text-violet-400" /><p>A conversa começa quando enviares uma pergunta. A mentora usa as tuas respostas V8 e não inventa progresso.</p></div>}
      {messages.map((message) => { const isAI = message.sender === 'ai'; return <div key={message.id} className={`flex max-w-[90%] gap-3 ${isAI ? '' : 'ml-auto flex-row-reverse'}`}><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm">{isAI ? '🏛️' : <Avatar avatar={user.avatar} avatarType={user.avatarType} name={user.name} size="sm" ring={false} />}</div><div className={`space-y-1 rounded-2xl p-4 text-xs leading-relaxed shadow-lg md:text-sm ${isAI ? 'rounded-tl-none border border-violet-900/30 bg-[#151520] text-zinc-200' : 'rounded-tr-none bg-violet-800 text-white'}`}><div className="flex justify-between gap-4 text-[10px] text-zinc-400"><strong className="text-violet-400">{isAI ? 'Mentora V8' : user.name}</strong><span>{message.timestamp}</span></div><div className="whitespace-pre-wrap">{message.text}</div></div></div>; })}
      {isTyping && <div className="p-2 text-xs text-violet-400">A mentora está a responder…</div>}
      {error && <p role="alert" className="rounded-lg border border-amber-800 bg-amber-950/40 p-3 text-xs text-amber-200">{error}</p>}
      <div ref={messagesEndRef} />
    </div>
    <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-zinc-800 bg-black/90 p-3"><input maxLength={3000} value={input} onChange={(event) => setInput(event.target.value)} placeholder={user.systemMode === 'modo_a_baixa_energia' ? 'Escreve a dúvida essencial…' : 'Partilha uma dúvida ou bloqueio…'} className="flex-1 rounded-xl border border-zinc-700 bg-[#111118] px-4 py-3 text-xs text-white outline-none focus:border-violet-500 md:text-sm" /><button type="submit" disabled={!input.trim() || isTyping} aria-label="Enviar mensagem" className="flex items-center justify-center rounded-xl bg-violet-700 p-3 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button></form>
  </div>;
};
