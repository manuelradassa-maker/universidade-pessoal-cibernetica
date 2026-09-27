import { CANONICAL_RESOURCES } from '../data/curriculumData';
import { INITIAL_PHASE_EXECUTION } from '../data/defaultState';
import type { PracticalPhase, UserProfile, VitruvianPillar } from '../types';

const pillarNames: Record<VitruvianPillar, string> = {
  mente: 'Mente', intelecto: 'Intelecto', corpo_acao: 'Corpo & Ação', proposito: 'Propósito',
};

/** Builds one provisional V8 phase from the learner's own intake, never a multi-year plan. */
export function buildV8Phase(profile: UserProfile, pillar: VitruvianPillar): PracticalPhase {
  const format = profile.learnerData.contentPreference;
  const matching = CANONICAL_RESOURCES.filter((resource) => resource.pillar === pillar);
  const requestedType = format === 'audiovisual' ? matching.find((resource) => resource.type !== 'livro') : matching.find((resource) => resource.type === 'livro');
  const mainResource = requestedType ?? matching[0] ?? INITIAL_PHASE_EXECUTION.mainResource;
  const complementary = format === 'misto'
    ? matching.find((resource) => resource.id !== mainResource.id && resource.type !== mainResource.type)
    : undefined;
  const data = profile.learnerData;
  const intake = profile.v8Intake ?? {};
  const goal = data.target90DaysResult;
  const project = data.activeProject || goal;
  const hours = data.weeklyHoursAvailable;
  const stage = mainResource.stage;
  const laterResources = CANONICAL_RESOURCES.filter((resource) => resource.stage > stage).slice(0, 3).map((resource) => `${resource.title} — adiado até haver evidência para avançar além do Stage ${stage}.`);
  const weeklyAction = (week: number) => [
    `Registar uma linha de base datada para o projeto: ${project}`,
    `Explicar sem notas uma ideia de ${mainResource.title} ligada ao objetivo: ${goal}`,
    `Testar uma ideia do recurso no projeto e guardar o artefacto criado: ${project}`,
    `Comparar o resultado observado com a linha de base e anotar o que mudou.`,
    `Procurar um contraexemplo que possa refutar a abordagem usada no projeto.`,
    `Reunir a evid?ncia e escrever o pr?ximo ajuste com base no resultado de 90 dias: ${goal}`,
  ][week - 1];
  const weeklyPlan = Array.from({ length: 6 }, (_, index) => {
    const week = index + 1;
    const focusByWeek = [
      'Estabelecer a linha de base e escolher uma pergunta de leitura',
      'Compreender e recuperar as ideias centrais sem notas',
      'Testar uma ideia no projeto ativo',
      'Observar resultados e ajustar uma ação',
      'Procurar limites, contrapontos e efeitos não previstos',
      'Reunir evidência e fazer a revisão de fase',
    ];
    return { week, focus: focusByWeek[index], actions: [weeklyAction(week)], measurableMetric: 'Registo datado do que foi tentado, do resultado observado e da evidência disponível.' };
  });

  return {
    ...INITIAL_PHASE_EXECUTION,
    id: `v8-${profile.id}-${Date.now()}`,
    phaseNumber: 1,
    title: `Fase 1 · ${pillarNames[pillar]} · ${mainResource.title}`,
    durationWeeks: 6,
    pillar,
    stage,
    objective: `Trabalhar no resultado indicado: ${goal}`,
    whyItComesNow: `Hipótese de gargalo indicada pelo utilizador em ${pillarNames[pillar]}: ${data.currentBottleneck}. Esta é uma recomendação provisória, a rever perante evidência. Contexto: ${intake.why || 'não indicado'}.`,
    whatIsDeliberatelyPostponed: laterResources,
    deferredResources: laterResources,
    mainResource: {
      ...mainResource,
      whyIncluded: `Foi selecionado por corresponder ao pilar autodeclarado (${pillarNames[pillar]}) e ao domínio ${mainResource.domain}. A adequação deve ser confirmada na revisão inicial.`,
    },
    optionalResource: complementary,
    chaptersToReadOrEpisodes: 'Escolher secções depois de verificar a edição disponível e a pergunta prática desta fase.',
    weeklyReadingTarget: `Até ${Math.max(1, Math.floor(hours / 2))} hora(s) por semana, como limite inicial dentro das ${hours} hora(s) indicadas; ajustar na revisão.`,
    applicationProject: {
      realWorldObjective: goal,
      deliverable: `Resultado verificável relacionado com: ${project}. A pessoa define o artefacto apropriado na primeira revisão.`,
      measurementCriteria: `Comparar a linha de base e o resultado de 90 dias descritos pela pessoa: ${goal}`,
      evidenceProofRequired: 'A pessoa escolhe evidência adequada ao projeto (registo datado, métrica, artefacto ou validação externa); nenhuma evidência é presumida.',
    },
    realWorldProject: {
      title: project,
      description: `Projeto indicado pela pessoa durante o diagnóstico: ${project}`,
      deliverable: `Entregável definido pela pessoa para avançar em direção a: ${goal}`,
      measurement: `Métrica escolhida e registada antes da aplicação; rever contra o resultado: ${goal}`,
      evidenceRequired: 'Registo produzido pela pessoa, datado e relevante para o objetivo.',
    },
    weeklyPlan,
    assessment: {
      comprehensionQuestion: `Qual é a ideia mais importante de ${mainResource.title} para o objetivo ${goal}?`,
      retrievalQuestion: `Explica sem notas o modelo que aplicaste e onde pode falhar.`,
      decisionJournalPrompt: `Que decisão real sobre ${project} foi alterada pela evidência desta semana?`,
      counterargumentExercise: `Que argumento ou dado poderia mostrar que a tua abordagem a ${goal} está errada?`,
    },
    behavioralGraduationCriteria: [
      'Entregar o artefacto de projeto definido pelo próprio utilizador.',
      'Apresentar evidência datada e comparável com a linha de base.',
      'Explicar o modelo aplicado, a sua limitação e o que será ajustado.',
    ],
    completionCriteria: [
      'Entregar o artefacto de projeto definido pelo próprio utilizador.',
      'Apresentar evidência datada e comparável com a linha de base.',
      'Explicar o modelo aplicado, a sua limitação e o que será ajustado.',
    ],
  };
}

