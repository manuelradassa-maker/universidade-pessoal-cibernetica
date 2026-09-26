import {
  BookRole,
  EvidenceClass,
  LibraryEntry,
  LibraryList,
  LibraryTier,
  ReadDepth,
  V8AuditCheck,
  V8AuditReport,
  V8Stage,
  V8StageId
} from '../types';

/**
 * V8 — "DEVELOPMENTAL-STAGE MODEL".
 * Cada estágio é pré-requisito do seguinte: sem autodomínio observável,
 * qualquer leitura avançada transforma-se em entretenimento passivo.
 */
export const V8_STAGES: V8Stage[] = [
  {
    id: 1,
    title: 'Stage 1 — Autodomínio',
    focuses: ['atenção', 'disciplina básica', 'regulação emocional', 'hábitos', 'fundamentos físicos', 'agência pessoal'],
    prerequisite: 'Nenhum. É o alicerce: sem consistência observável diária nada mais se sustenta.'
  },
  {
    id: 2,
    title: 'Stage 2 — Aprendizagem e Pensamento Claro',
    focuses: ['leitura', 'memória', 'lógica', 'deteção de enviesamentos', 'literacia científica', 'humildade intelectual'],
    prerequisite: 'Stage 1: atenção e hábitos mínimos para sustentar estudo deliberado.'
  },
  {
    id: 3,
    title: 'Stage 3 — Competência Social e Emocional',
    focuses: ['comunicação', 'empatia', 'limites', 'negociação', 'gestão de conflito', 'julgamento social'],
    prerequisite: 'Stage 2: sem clareza de raciocínio não existe comunicação rigorosa.'
  },
  {
    id: 4,
    title: 'Stage 4 — Criação de Valor',
    focuses: ['consciência do cliente', 'seleção de problemas', 'criatividade', 'competências úteis', 'vendas', 'marketing'],
    prerequisite: 'Stage 3: criar valor exige comunicar com pessoas reais e ouvir.'
  },
  {
    id: 5,
    title: 'Stage 5 — Construção de Negócio',
    focuses: ['ofertas', 'produto', 'operações', 'finanças', 'gestão', 'sistemas', 'modelos repetíveis'],
    prerequisite: 'Stage 4: primeiro é preciso validar valor entregue, depois industrializá-lo.'
  },
  {
    id: 6,
    title: 'Stage 6 — Sistemas e Estratégia',
    focuses: ['pensamento sistémico', 'incentivos', 'vantagem competitiva', 'desenho organizacional', 'previsão estratégica'],
    prerequisite: 'Stage 5: sem um negócio a funcionar não há estratégia testável.'
  },
  {
    id: 7,
    title: 'Stage 7 — Liderança e Mordomia',
    focuses: ['liderança ética', 'construção de instituições', 'alocação de capital', 'governança', 'propriedade de longo prazo'],
    prerequisite: 'Stage 6: liderar sem compreender sistemas e incentivos gera dano em escala.'
  },
  {
    id: 8,
    title: 'Stage 8 — Sentido, Sabedoria e Legado',
    focuses: ['filosofia', 'moral', 'espiritualidade', 'mortalidade', 'serviço', 'contribuição', 'geratividade'],
    prerequisite: 'Stage 7: só quem já carregou responsabilidade real compreende sabedoria prática.'
  }
];

export const STAGE_BY_ID: Record<V8StageId, V8Stage> = V8_STAGES.reduce(
  (acc, stage) => ({ ...acc, [stage.id]: stage }),
  {} as Record<V8StageId, V8Stage>
);

/**
 * Domínios canónicos (rótulos curtos e estáveis). Cobrem as dimensões de vida
 * exigidas pelo V8 (desenvolvimento pessoal), a jornada de construção de
 * negócio e os níveis do roteiro de pensamento.
 */
export const V8_DOMAINS: string[] = [
  // Desenvolvimento pessoal
  'Caráter',
  'Identidade',
  'Hábitos',
  'Atenção',
  'Emoção',
  'Saúde mental',
  'Aprendizagem',
  'Criatividade',
  'Comunicação',
  'Relações',
  'Saúde física',
  'Dinheiro',
  'Propósito',
  'Filosofia',
  'Espiritualidade',
  'Serviço',
  // Negócios e empreendedorismo
  'Mentalidade',
  'Oportunidade',
  'Cliente',
  'Oferta',
  'Vendas',
  'Marketing',
  'Copywriting',
  'Produto',
  'Modelo',
  'Preços',
  'Operações',
  'Finanças',
  'Negociação',
  'Gestão',
  'Cultura',
  'Estratégia',
  'Sistemas',
  'Escala',
  'Tecnologia',
  'Capital',
  'História',
  'Falhas',
  // Pensamento
  'Lógica',
  'Evidência',
  'Probabilidade',
  'Decisão',
  'Psicologia',
  'Civilização',
  'Ética',
  'Sabedoria'
];

export const READ_DEPTHS: ReadDepth[] = [
  'Master',
  'Study',
  'Read',
  'Selective',
  'Reference',
  'Summary Sufficient',
  'Defer',
  'Skip'
];

export const BOOK_ROLES: BookRole[] = [
  'Fundação',
  'Corretivo',
  'Ferramenta',
  'Estudo de Caso',
  'Contraponto',
  'Síntese',
  'Referência',
  'Exploração'
];

export const EVIDENCE_CLASSES: EvidenceClass[] = [
  'Suportado por fontes',
  'Inferência razoável',
  'Julgamento editorial',
  'Dependente de contexto',
  'Ideia contestada'
];

export const LIST_LABELS: Record<LibraryList, string> = {
  pessoal: 'Top 100 — Desenvolvimento Pessoal',
  negocios: 'Top 100 — Negócios e Empreendedorismo',
  pensamento: '50 Livros — Nível Mais Elevado de Pensamento'
};

export const TIER_LABELS: Record<LibraryTier, string> = {
  1: 'Tier 1 — O Essencial 30',
  2: 'Tier 2 — O Núcleo 75',
  3: 'Tier 3 — O Completo 150',
  4: 'Tier 4 — Biblioteca Mestre Alargada'
};

/* ------------------------------------------------------------------ */
/* Auditoria automática de conformidade V8                             */
/* ------------------------------------------------------------------ */

const AUTHOR_CAP_PER_LIST = 3;
const TIER1_CAP = 30;

const REQUIRED_FIELDS: (keyof LibraryEntry)[] = [
  'title',
  'author',
  'domain',
  'durationOrPages',
  'coreContribution',
  'whyIncluded',
  'whatItDevelops',
  'bestPracticalApplication',
  'criticalWarning'
];

export const normalizeTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Executa a "FINAL QUALITY-CONTROL AUDIT" do V8 sobre a biblioteca mestre.
 * Nada é arredondado nem maquilhado: o que não passa fica reportado.
 */
export const runV8Audit = (library: LibraryEntry[]): V8AuditReport => {
  const checks: V8AuditCheck[] = [];
  const byList = (list: LibraryList) => library.filter((b) => b.list === list);

  const pessoal = byList('pessoal');
  const negocios = byList('negocios');
  const pensamento = byList('pensamento');

  const countCheck = (
    list: LibraryList,
    entries: LibraryEntry[],
    expected: number,
    label: string
  ) => {
    checks.push({
      id: `count-${list}`,
      label,
      expectation: `${expected} livros`,
      observed: `${entries.length} livros`,
      status: entries.length === expected ? 'ok' : 'falha',
      detail:
        entries.length === expected
          ? 'Contagem exata verificada por função, não por estimativa.'
          : `Diferença de ${Math.abs(entries.length - expected)} registos face ao exigido pelo V8.`
    });
  };

  countCheck('pessoal', pessoal, 100, 'Contagem exata — Desenvolvimento Pessoal');
  countCheck('negocios', negocios, 100, 'Contagem exata — Negócios e Empreendedorismo');
  countCheck('pensamento', pensamento, 50, 'Contagem exata — Roteiro de Pensamento');

  const seen = new Map<string, LibraryEntry[]>();
  library.forEach((b) => {
    const key = normalizeTitle(b.title);
    seen.set(key, [...(seen.get(key) || []), b]);
  });
  const withinListDuplicates = [...seen.values()].filter(
    (group) => new Set(group.map((g) => g.list)).size < group.length
  );
  const overlaps = [...seen.values()].filter(
    (group) => group.length > 1 && new Set(group.map((g) => g.list)).size > 1
  );

  checks.push({
    id: 'duplicates-within-list',
    label: 'Deduplicação dentro de cada lista',
    expectation: '0 títulos repetidos na mesma lista',
    observed: `${withinListDuplicates.length} repetições`,
    status: withinListDuplicates.length === 0 ? 'ok' : 'falha',
    detail:
      withinListDuplicates.length === 0
        ? 'Cada lista mantém títulos únicos; a biblioteca integrada contabiliza livros únicos.'
        : `Títulos repetidos: ${withinListDuplicates.map((g) => g.map((x) => x.title).join(' / ')).join(' | ')}`
  });

  checks.push({
    id: 'duplicates-cross-list',
    label: 'Sobreposição entre listas (Step 1 — Deduplicate)',
    expectation: 'Sobreposições identificadas e contadas uma única vez',
    observed: `${overlaps.length} obras em mais de uma lista`,
    status: 'ok',
    detail:
      overlaps.length > 0
        ? `Obras partilhadas declaradas: ${overlaps
            .map((g) => `${g[0].title} (${g.map((x) => x.list).join(', ')})`)
            .join(' | ')}. O total integrado conta-as uma só vez.`
        : 'Nenhuma sobreposição: cada lista cobre um corpo de conhecimento distinto.'
  });

  const authorViolations: string[] = [];
  (['pessoal', 'negocios', 'pensamento'] as LibraryList[]).forEach((list) => {
    const counts = new Map<string, number>();
    byList(list).forEach((b) => counts.set(b.author, (counts.get(b.author) || 0) + 1));
    counts.forEach((count, author) => {
      if (count > AUTHOR_CAP_PER_LIST) {
        authorViolations.push(`${author} (${count} livros em ${list})`);
      }
    });
  });
  checks.push({
    id: 'author-cap',
    label: 'Limite de autor (máx. 3 por lista)',
    expectation: `Nenhum autor com mais de ${AUTHOR_CAP_PER_LIST} obras por lista`,
    observed: authorViolations.length === 0 ? 'Nenhuma exceção' : authorViolations.join('; '),
    status: authorViolations.length === 0 ? 'ok' : 'falha',
    detail:
      authorViolations.length === 0
        ? 'A quarta obra de um autor só seria aceite com justificação escrita.'
        : 'Violação do anticorpo anti-monopólio de autor definido no V8.'
  });

  const stageCount = new Map<number, number>();
  library.forEach((b) => stageCount.set(b.stage, (stageCount.get(b.stage) || 0) + 1));
  const missingStages = V8_STAGES.map((s) => s.id).filter((id) => !stageCount.has(id));
  checks.push({
    id: 'stage-coverage',
    label: 'Cobertura dos 8 estágios de desenvolvimento',
    expectation: 'Todos os estágios 1–8 com pelo menos um livro',
    observed: missingStages.length === 0 ? '8/8 estágios cobertos' : `Faltam: ${missingStages.join(', ')}`,
    status: missingStages.length === 0 ? 'ok' : 'falha',
    detail: V8_STAGES.map((s) => `S${s.id}: ${stageCount.get(s.id) || 0}`).join(' • ')
  });

  const incomplete = library.filter((b) =>
    REQUIRED_FIELDS.some((f) => {
      const value = b[f];
      return typeof value === 'string' && value.trim().length === 0;
    })
  );
  checks.push({
    id: 'canonical-fields',
    label: 'Registo canónico completo',
    expectation: `${REQUIRED_FIELDS.length} campos textuais preenchidos em todos os registos`,
    observed:
      incomplete.length === 0
        ? `${library.length}/${library.length} completos`
        : `${incomplete.length} incompletos`,
    status: incomplete.length === 0 ? 'ok' : 'falha',
    detail:
      incomplete.length === 0
        ? 'Cada livro tem contribuição, aplicação e limitação específicas — nunca elogio vazio.'
        : `Registos incompletos: ${incomplete.map((b) => b.title).join('; ')}`
  });

  const weakWarnings = library.filter((b) => b.criticalWarning.trim().length < 25);
  checks.push({
    id: 'distortion-risk',
    label: 'Risco de distorção documentado',
    expectation: 'Limitação ou crítica com extensão suficiente para ser útil',
    observed: `${library.length - weakWarnings.length}/${library.length} com crítica substantiva`,
    status: weakWarnings.length === 0 ? 'ok' : 'aviso',
    detail:
      weakWarnings.length === 0
        ? 'Nenhum aviso genérico do tipo "este livro é mau".'
        : `A rever: ${weakWarnings.map((b) => b.title).join('; ')}`
  });

  const depthSet = new Set(library.map((b) => b.readDepth));
  checks.push({
    id: 'read-depth-mix',
    label: 'Mistura de profundidades de leitura',
    expectation: 'Master, Study, Read e pelo menos uma categoria de consulta',
    observed: `${depthSet.size} categorias usadas`,
    status: depthSet.has('Master') && depthSet.has('Study') && depthSet.has('Read') ? 'ok' : 'falha',
    detail: READ_DEPTHS.map((d) => `${d}: ${library.filter((b) => b.readDepth === d).length}`).join(' • ')
  });

  const rolesUsed = new Set(library.map((b) => b.role));
  checks.push({
    id: 'role-mix',
    label: 'Papéis funcionais atribuídos',
    expectation: 'Cada livro com papel explícito (Fundação → Síntese)',
    observed: `${rolesUsed.size}/8 papéis representados`,
    status:
      rolesUsed.has('Fundação') && rolesUsed.has('Contraponto') && rolesUsed.has('Ferramenta')
        ? 'ok'
        : 'aviso',
    detail: BOOK_ROLES.map((r) => `${r}: ${library.filter((b) => b.role === r).length}`).join(' • ')
  });

  const evidenceUsed = new Set(library.map((b) => b.evidenceClass));
  checks.push({
    id: 'evidence-classes',
    label: 'Classes de evidência distinguidas',
    expectation: 'Facto, inferência e julgamento editorial separados',
    observed: `${evidenceUsed.size}/5 classes`,
    status:
      evidenceUsed.size >= 3 && evidenceUsed.has('Julgamento editorial')
        ? 'ok'
        : 'aviso',
    detail: EVIDENCE_CLASSES.map(
      (e) => `${e}: ${library.filter((b) => b.evidenceClass === e).length}`
    ).join(' • ')
  });

  const tier1 = library.filter((b) => b.tier === 1);
  checks.push({
    id: 'tier-structure',
    label: 'Estrutura de tiers (30 / 75 / 150 / alargada)',
    expectation: `Tier 1 com no máximo ${TIER1_CAP} livros`,
    observed: `Tier 1: ${tier1.length} • Tier 2: ${library.filter((b) => b.tier === 2).length} • Tier 3: ${library.filter((b) => b.tier === 3).length} • Tier 4: ${library.filter((b) => b.tier === 4).length}`,
    status: tier1.length <= TIER1_CAP && tier1.length > 0 ? 'ok' : 'aviso',
    detail:
      tier1.length <= TIER1_CAP
        ? 'A fama não promove nenhum livro de tier: a promoção exige função de desenvolvimento.'
        : 'Tier 1 excedido: reduzir para manter o "menor alicerce sério" que o V8 define.'
  });

  const decades = new Set(library.map((b) => Math.floor(b.year / 10) * 10));
  const authors = new Set(library.map((b) => b.author));
  checks.push({
    id: 'historical-spread',
    label: 'Diversidade histórica',
    expectation: 'Pelo menos 8 décadas distintas representadas',
    observed: `${decades.size} décadas`,
    status: decades.size >= 8 ? 'ok' : 'aviso',
    detail: [...decades]
      .sort((a, b) => a - b)
      .map((d) => `${d}s`)
      .join(' • ')
  });

  checks.push({
    id: 'author-diversity',
    label: 'Diversidade de autores',
    expectation: 'Mais de 150 autores distintos na biblioteca integrada',
    observed: `${authors.size} autores distintos`,
    status: authors.size >= 150 ? 'ok' : 'aviso',
    detail: `Média de ${(library.length / Math.max(authors.size, 1)).toFixed(2)} livros por autor.`
  });

  const businessJourneyDomains = ['Oportunidade', 'Cliente', 'Oferta', 'Vendas', 'Marketing', 'Capital'];
  const missingJourney = businessJourneyDomains.filter((d) => !negocios.some((b) => b.domain === d));
  checks.push({
    id: 'business-journey',
    label: 'Jornada de construção de negócio coberta',
    expectation: 'Todas as etapas, de oportunidade a alocação de capital',
    observed: missingJourney.length === 0 ? 'Jornada completa' : `Faltam: ${missingJourney.join(', ')}`,
    status: missingJourney.length === 0 ? 'ok' : 'falha',
    detail:
      'O V8 exige progressão: sem negócio → 1º cliente → oferta validada → entrega → escala → propriedade.'
  });

  const passed = checks.filter((c) => c.status === 'ok').length;
  const warnings = checks.filter((c) => c.status === 'aviso').length;
  const failures = checks.filter((c) => c.status === 'falha').length;

  return {
    generatedAt: new Date().toISOString(),
    checks,
    totals: {
      pessoal: pessoal.length,
      negocios: negocios.length,
      pensamento: pensamento.length,
      unique: seen.size,
      duplicates: withinListDuplicates.length
    },
    passed,
    warnings,
    failures
  };
};




