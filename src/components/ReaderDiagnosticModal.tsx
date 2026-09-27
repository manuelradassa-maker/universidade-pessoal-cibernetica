import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import type { UserProfile, VitruvianPillar } from '../types';
import { V8_CORE_FIELDS, V8_INTAKE_SECTIONS } from '../data/v8Intake';

interface ReaderDiagnosticModalProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile, bottleneckPillar: VitruvianPillar) => void;
  onDraftChange: (answers: Record<string, string>) => void;
  onClose?: () => void;
}

const PILLARS: { id: VitruvianPillar; name: string; prompt: string }[] = [
  { id: 'mente', name: 'Mente', prompt: 'Pensamento, emoções, decisões ou autoconsciência' },
  { id: 'intelecto', name: 'Intelecto', prompt: 'Aprendizagem, leitura, retenção ou raciocínio' },
  { id: 'corpo_acao', name: 'Corpo & Ação', prompt: 'Energia, atenção, disciplina ou consistência' },
  { id: 'proposito', name: 'Propósito', prompt: 'Carreira, negócio, direção ou criação de valor' },
];

const inputClass = 'w-full rounded-xl border border-zinc-700 bg-black/50 px-3.5 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500';

export function ReaderDiagnosticModal({ user, onComplete, onDraftChange, onClose }: ReaderDiagnosticModalProps) {
  const sections = V8_INTAKE_SECTIONS;
  const [step, setStep] = useState(() => Math.max(0, Math.min(sections.length, Number.parseInt(user.v8Intake?._step ?? '0', 10) || 0)));
  const [answers, setAnswers] = useState<Record<string, string>>(user.v8Intake ?? {});
  const [bottleneck, setBottleneck] = useState<VitruvianPillar | ''>(user.v8Intake?._bottleneck as VitruvianPillar | undefined ?? (user.evaluated ? user.learnerData.currentBottleneckPillar : ''));
  const [bottleneckEvidence, setBottleneckEvidence] = useState(user.v8Intake?._bottleneckEvidence ?? (user.evaluated ? user.learnerData.currentBottleneck : ''));
  const [intakeMode, setIntakeMode] = useState<'guided' | 'detailed'>((user.v8Intake?._mode === 'detailed' || user.v8Intake?.intakeMode === 'detailed') ? 'detailed' : 'guided');
  const [error, setError] = useState('');
  const totalSteps = sections.length + 1;
  const current = sections[step];
  const answeredCore = useMemo(() => V8_CORE_FIELDS.every((key) => {
    const value = (answers[key] ?? '').trim();
    return value.length > 0 && !/^(desconhecido|não sei|nao sei)$/i.test(value);
  }), [answers]);

  useEffect(() => { onDraftChange({ ...answers, _step: String(step), _mode: intakeMode, _bottleneck: bottleneck, _bottleneckEvidence: bottleneckEvidence }); }, [answers, step, intakeMode, bottleneck, bottleneckEvidence, onDraftChange]);
  const setAnswer = (id: string, value: string) => setAnswers((previous) => ({ ...previous, [id]: value }));
  const fillUnknown = () => setAnswers((previous) => ({
    ...previous,
    ...Object.fromEntries((current?.fields ?? []).map((field) => [field.id, previous[field.id]?.trim() ? previous[field.id] : 'Desconhecido'])),
  }));

  const finish = () => {
    const detailed = intakeMode === 'detailed';
    const detailedText = (answers.detailedContext ?? '').trim();
    const hours = Number.parseFloat(detailed ? (answers.detailedHours ?? '') : (answers.hours ?? ''));
    const concretePriority = detailed
      ? detailedText.length >= 100
      : (answers.problem ?? '').trim().length >= 15 && (answers.result ?? '').trim().length >= 20
        && !/^(quero melhorar|ser melhor|ter sucesso|evoluir|ler mais)$/i.test((answers.result ?? '').trim());
    const missing = detailed
      ? [
          detailedText.length < 100 ? 'um contexto com pelo menos 100 caracteres' : '',
          !Number.isFinite(hours) || hours <= 0 ? 'as horas disponiveis por semana' : '',
          !answers.detailedFormat ? 'o formato preferido' : '',
        ].filter(Boolean)
      : [
          !answeredCore ? 'os campos essenciais da entrevista' : '',
          !Number.isFinite(hours) || hours <= 0 ? 'as horas disponiveis por semana' : '',
          !concretePriority ? 'um objetivo concreto para os proximos 90 dias' : '',
        ].filter(Boolean);
    if (missing.length > 0) {
      setError(`Antes de guardar, falta preencher: ${missing.join(', ')}.`);
      return;
    }
    const evidence = detailed ? detailedText : bottleneckEvidence.trim();
    if (!bottleneck) {
      setError('Escolhe um dos quatro pilares para identificar o gargalo que queres trabalhar.');
      return;
    }
    if (evidence.length < 12) {
      setError('Descreve uma situacao recente que sustente a hipotese de gargalo.');
      return;
    }
    const number = (key: string) => {
      const parsed = Number.parseInt(answers[`${key}Rating`] ?? '', 10);
      return Number.isFinite(parsed) ? Math.min(5, Math.max(0, parsed)) : 0;
    };
    const updated: UserProfile = {
      ...user,
      v8Intake: Object.fromEntries(Object.entries({ ...answers, intakeMode, _mode: intakeMode }).filter(([key]) => !key.startsWith('_'))),
      learnerData: {
        ...user.learnerData,
        targetPerson: answers.learner ?? '', ageOrMaturity: answers.age ?? '', countryContext: answers.country ?? '',
        primaryLanguage: answers.language ?? '', currentRoleAndStage: `${answers.role ?? ''} — ${answers.lifeStage ?? ''}`.trim(),
        desiredIdentity: answers.identity ?? '', topLongTermOutcomes: answers.outcomes ?? '',
        primaryLongTermGoal: [answers.personalGoal, answers.intellectualGoal, answers.careerGoal, answers.businessGoal].filter(Boolean).join('\n'),
        urgentCurrentProblem: detailed ? detailedText : answers.problem ?? '', target90DaysResult: detailed ? detailedText : answers.result ?? '', activeProject: answers.project ?? '',
        evidenceProgressMade: answers.progress ?? '',
        capabilities: detailed ? user.learnerData.capabilities : {
          selfDiscipline: number('discipline'), focus: number('focus'), habitConsistency: number('habits'),
          emotionalRegulation: number('emotion'), physicalEnergy: number('energy'), learningAbility: number('learning'),
          criticalThinking: number('critical'), salesAndOffers: number('sales'), businessStrategy: number('strategy'),
        },
        completedBooks: answers.completed ?? '', dislikedOrAbandoned: [answers.disliked, answers.abandoned].filter(Boolean).join('\n'),
        contentPreference: detailed ? (answers.detailedFormat as UserProfile['learnerData']['contentPreference']) : /áudio|audiovisual|vídeo|video/i.test(answers.format ?? '') ? 'audiovisual' : /misto|ambos/i.test(answers.format ?? '') ? 'misto' : 'livros',
        weeklyHoursAvailable: hours,
        learningPreferencesNotes: [answers.learn, answers.retain, answers.feedback].filter(Boolean).join('\n'),
        repeatedMistakeOrDistraction: detailed ? detailedText : [answers.mistake, answers.distraction].filter(Boolean).join('\n'),
        currentBottleneckPillar: bottleneck,
        currentBottleneck: evidence,
        weakPoints: [answers.habit, answers.avoidance, answers.fear].filter(Boolean).join('\n'),
        applicationEnvironment: [answers.projects, answers.people, answers.skills, answers.decisions].filter(Boolean).join('\n'),
      },
      evaluated: true,
    };
    onComplete(updated, bottleneck);
  };

  const next = () => {
    setError('');
    if (step === 3) {
      const capabilityFields = sections[step].fields.filter((field) => field.kind === 'rating');
      const incomplete = capabilityFields.some((field) => {
        const rating = answers[field.id];
        const evidence = answers[field.id.replace('Rating', 'Evidence')]?.trim() ?? '';
        return !rating || (rating !== 'Desconhecido' && evidence.length < 8);
      });
      if (incomplete) {
        setError('Para cada capacidade, escolhe uma nota e da um exemplo concreto; se nao souberes, assinala Desconhecido.');
        return;
      }
    }
    if (step < sections.length) setStep(step + 1);
    else finish();
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm md:p-6">
    <section role="dialog" aria-modal="true" aria-labelledby="intake-title" className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-[#101014] shadow-2xl shadow-black/70">
      <header className="border-b border-zinc-800 px-5 py-4 md:px-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-red-400">Entrevista guiada · V8</p><h2 id="intake-title" className="mt-1 text-xl font-semibold text-white">{current?.title ?? (intakeMode === 'detailed' ? 'Contexto detalhado e gargalo' : 'Síntese e gargalo')}</h2><p className="mt-1 text-sm text-zinc-400">{current?.prompt ?? (intakeMode === 'detailed' ? 'Descreve o contexto e confirma a hipótese de gargalo.' : 'Confirma uma hipótese de gargalo com um exemplo real.')}</p></div>
          {onClose && <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label="Fechar diagnóstico"><X size={18} /></button>}
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div>
        <p className="mt-2 text-right text-xs text-zinc-500">Bloco {step + 1} de {totalSteps}</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-7">
        {current ? <>
          {step === 0 && <div className="rounded-xl border border-red-900/70 bg-red-950/20 p-4">
            <p className="font-semibold text-white">Preferes não responder aos 13 blocos?</p>
            <p className="mt-1 text-sm text-zinc-300">Podes escrever o teu contexto detalhado, indicar o tempo disponível e o formato, e escolher o teu gargalo.</p>
            <button type="button" className="mt-3 rounded-lg border border-red-700 px-3 py-2 text-sm text-red-200 hover:bg-red-950" onClick={() => { setIntakeMode('detailed'); setStep(sections.length); }}>Adicionar contexto detalhado</button>
          </div>}
          <p className="rounded-lg border border-zinc-800 bg-black/30 p-3 text-xs leading-5 text-zinc-400">Responde ao que sabes. Podes escrever “Desconhecido” ou “Não se aplica”; não inventamos respostas. O perfil completo fica guardado na tua conta quando terminares a entrevista.</p>
          {current.fields.map((field) => <label key={field.id} className="block space-y-1.5 text-sm text-zinc-200"><span>{field.label}{field.kind === 'rating' && <span className="ml-2 text-xs text-zinc-500">0 = ainda não consigo demonstrar · 5 = consigo demonstrar consistentemente</span>}</span>
            {field.kind === 'rating' ? <select className={inputClass} value={answers[field.id] ?? ''} onChange={(event) => setAnswer(field.id, event.target.value)}><option value="">Escolher</option>{[0, 1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}<option value="Desconhecido">Desconhecido</option></select>
              : field.kind === 'long' ? <textarea rows={2} className={inputClass} value={answers[field.id] ?? ''} onChange={(event) => setAnswer(field.id, event.target.value)} />
                : <input className={inputClass} value={answers[field.id] ?? ''} onChange={(event) => setAnswer(field.id, event.target.value)} />}
          </label>)}
          <button type="button" className="text-xs text-zinc-400 underline decoration-zinc-600 underline-offset-4 hover:text-white" onClick={fillUnknown}>Assinalar como desconhecidos os campos vazios deste bloco</button>
        </> : <>
          <div className="rounded-xl border border-amber-900/70 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100"><AlertTriangle className="mr-2 inline text-amber-400" size={16} />Esta escolha é uma hipótese reportada por ti, não uma avaliação automática nem uma medição objetiva. Poderás alterá-la quando surgirem novas evidências.</div>
          {intakeMode === 'detailed' && <section className="space-y-3 rounded-xl border border-zinc-800 bg-black/20 p-4">
            <label className="block space-y-1.5 text-sm text-zinc-200">Descreve quem és, a tua situação atual, o que queres alcançar nos próximos 90 dias, porque importa e que obstáculos tens.<textarea required minLength={100} rows={7} className={inputClass} value={answers.detailedContext ?? ''} onChange={(event) => { setAnswer('detailedContext', event.target.value); setBottleneckEvidence(event.target.value); }} placeholder="Escreve com detalhe. Inclui objetivos, responsabilidades, dificuldades e um exemplo recente. Não inventes dados que não sabes." /></label>
            <label className="block space-y-1.5 text-sm text-zinc-200">Quantas horas por semana tens disponíveis?<input required type="number" min="0.5" max="100" step="0.5" className={inputClass} value={answers.detailedHours ?? ''} onChange={(event) => setAnswer('detailedHours', event.target.value)} /></label>
            <label className="block space-y-1.5 text-sm text-zinc-200">Formato preferido<select required className={inputClass} value={answers.detailedFormat ?? ''} onChange={(event) => setAnswer('detailedFormat', event.target.value)}><option value="">Escolhe um formato</option><option value="livros">Livros</option><option value="audiovisual">Áudio ou vídeo</option><option value="misto">Misto</option></select></label>
          </section>}
          <div className="grid gap-3 sm:grid-cols-2">{PILLARS.map((pillar) => <button key={pillar.id} type="button" onClick={() => setBottleneck(pillar.id)} className={`rounded-xl border p-4 text-left transition ${bottleneck === pillar.id ? 'border-red-500 bg-red-950/30' : 'border-zinc-800 bg-black/20 hover:border-zinc-600'}`}><span className="font-semibold text-white">{pillar.name}</span><span className="mt-1 block text-xs text-zinc-400">{pillar.prompt}</span></button>)}</div>
          {intakeMode !== 'detailed' && <label className="block space-y-1.5 text-sm text-zinc-200">Que situação recente sustenta esta hipótese?<textarea rows={4} className={inputClass} value={bottleneckEvidence} onChange={(event) => setBottleneckEvidence(event.target.value)} placeholder="Descreve o que aconteceu, quando e que resultado observável teve." /></label>}
          {(intakeMode === 'detailed' ? ((answers.detailedContext ?? '').trim().length < 100 || !answers.detailedHours || !answers.detailedFormat) : !answeredCore) && <p className="text-sm text-amber-300">Completa o contexto, as horas semanais e o formato para poderes guardar o diagnóstico.</p>}
        </>}
        {error && <p role="alert" className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
      </div>

      <footer className="flex items-center justify-between border-t border-zinc-800 px-5 py-4 md:px-7">
        <button type="button" disabled={step === 0} onClick={() => { setError(''); if (intakeMode === 'detailed' && step === sections.length) { setIntakeMode('guided'); setStep(0); } else setStep(Math.max(0, step - 1)); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"><ArrowLeft size={16} /> Anterior</button>
        <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">{step === totalSteps - 1 ? <><Check size={16} /> Guardar diagnóstico</> : <>Continuar <ArrowRight size={16} /></>}</button>
      </footer>
    </section>
  </div>;
}
