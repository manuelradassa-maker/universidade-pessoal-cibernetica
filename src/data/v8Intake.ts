export interface IntakeField {
  id: string;
  label: string;
  kind?: 'short' | 'long' | 'rating';
}

export interface IntakeSection {
  title: string;
  prompt: string;
  fields: IntakeField[];
}

const fields = (items: string, kind: IntakeField['kind'] = 'short'): IntakeField[] =>
  items.split('|').map((item) => {
    const [id, label] = item.split('=');
    return { id, label, kind };
  });

const pairCapabilities = (items: string): IntakeField[] => items.split('|').flatMap((item) => {
  const [id, label] = item.split('=');
  return [
    { id: `${id}Rating`, label: `${label} (0–5)`, kind: 'rating' as const },
    { id: `${id}Evidence`, label: `Exemplo que sustenta esta nota`, kind: 'long' as const },
  ];
});

/** 13 blocos do LEARNER PROFILE INPUT do V8, apresentados como entrevista guiada. */
export const V8_INTAKE_SECTIONS: IntakeSection[] = [
  { title: '1. Pessoa e contexto', prompt: 'Para quem estamos a desenhar esta jornada?', fields: fields('learner=Pessoa a quem se destina|age=Idade ou faixa de maturidade|country=País e contexto cultural|language=Idioma principal|otherLanguages=Outros idiomas de leitura|education=Escolaridade|role=Papel atual|lifeStage=Etapa atual da vida') },
  { title: '2. Direção a longo prazo', prompt: 'Que vida queres construir? Responde só ao que já sabes.', fields: fields('identity=Pessoa que quero tornar-me|outcomes=Três resultados de longo prazo mais importantes|personalGoal=Objetivo de desenvolvimento pessoal|intellectualGoal=Objetivo intelectual|careerGoal=Objetivo de carreira|businessGoal=Objetivo de negócio|financialGoal=Objetivo financeiro|healthGoal=Objetivo de saúde|relationshipGoal=Objetivo de relações|purposeGoal=Objetivo de propósito, filosofia ou espiritualidade|legacyGoal=Objetivo de contribuição ou legado', 'long') },
  { title: '3. Prioridade dos próximos 90 dias', prompt: 'Define um resultado concreto, o prazo e o que está em jogo.', fields: fields('problem=Problema atual mais urgente|result=Resultado desejado em 90 dias|why=Porque importa agora|deadline=Prazo atual|consequence=Consequência de não resolver|project=Projeto ativo|progress=Evidência de progresso já feito', 'long') },
  { title: '4. Capacidades atuais', prompt: 'Autoavaliação inicial: cada nota precisa de um exemplo. A nota não é progresso validado.', fields: pairCapabilities('discipline=Autodisciplina|focus=Foco|habits=Consistência de hábitos|emotion=Regulação emocional|energy=Energia física|learning=Capacidade de aprendizagem|reading=Compreensão de leitura|critical=Pensamento crítico|science=Literacia científica|probability=Probabilidade e estatística|communication=Comunicação|relationships=Relações|finance=Literacia financeira|sales=Vendas|marketing=Marketing|entrepreneurship=Empreendedorismo|operations=Operações|management=Gestão|leadership=Liderança|strategy=Estratégia|philosophy=Filosofia|ethics=Ética|wisdom=Sabedoria prática') },
  { title: '5. Histórico de leitura', prompt: 'O que já leste e o que realmente alterou o teu comportamento?', fields: fields('completed=Livros concluídos|partial=Livros começados e não concluídos|abandoned=Livros abandonados|influential=Livros mais influentes|changed=Livros que mudaram o meu comportamento|enjoyed=Livros de que gostei|disliked=Livros de que não gostei|topics=Tópicos que li repetidamente|owned=Livros que já tenho|authors=Autores que já conheço bem', 'long') },
  { title: '6. Preferências de leitura', prompt: 'Estas preferências ajudam a escolher formato e dificuldade.', fields: fields('format=Formato preferido|length=Extensão preferida|difficulty=Dificuldade preferida|practical=Prático ou teórico|narrative=Narrativo ou estruturado|academic=Tolerância a texto académico|mathematical=Tolerância a matemática|session=Tempo confortável por sessão|weeklyReading=Quantidade de leitura semanal confortável|audio=Uso de audiolivros|annotation=Como anoto|notes=Sistema de apontamentos', 'long') },
  { title: '7. Preferências de aprendizagem', prompt: 'Como aprendes, reténs e gostas de receber feedback?', fields: fields('learn=Aprendo melhor através de|retain=Retenho melhor através de|feedback=Prefiro feedback através de|projects=Prefiro projetos que envolvam|company=Prefiro estudar sozinho ou acompanhado|quizzes=Gosto ou não de questionários porque|writing=Gosto ou não de escrever porque|teaching=Gosto ou não de ensinar porque', 'long') },
  { title: '8. Limitações e disponibilidade', prompt: 'Planeamos com o tempo e as condições que realmente existem.', fields: fields('hours=Horas disponíveis por semana|days=Melhores dias|times=Melhores horários|work=Trabalho ou estudos|family=Responsabilidades familiares|budget=Orçamento para livros|library=Acesso a biblioteca|health=Limitações de saúde|attention=Limitações de atenção|stress=Limitações emocionais ou stress|barriers=Outras barreiras', 'long') },
  { title: '9. Situação profissional e de negócio', prompt: 'Responde apenas ao que se aplica. “Não se aplica” é uma resposta válida.', fields: fields('career=Carreira atual|desiredCareer=Carreira desejada|business=Negócio atual|stage=Etapa do negócio|customer=Cliente-alvo|problemSolved=Problema que resolvo|offer=Oferta atual|sales=Vendas atuais|revenue=Receita atual|businessBottleneck=Maior gargalo atual|team=Equipa atual|capital=Capital disponível|businessDeadline=Prazo principal de carreira ou negócio', 'long') },
  { title: '10. Ambiente de aplicação', prompt: 'Onde podemos aplicar e observar o que aprendes?', fields: fields('projects=Projetos disponíveis|people=Pessoas que posso entrevistar|skills=Competências que posso praticar|decisions=Decisões que enfrento|problems=Problemas que posso analisar|teach=Oportunidades para ensinar|sell=Oportunidades para vender|lead=Oportunidades para liderar', 'long') },
  { title: '11. Padrões pessoais', prompt: 'Responde com franqueza. Estes dados são privados e servem para orientar a tua jornada.', fields: fields('mistake=Erro que repito|distraction=Distração habitual|habit=Hábito difícil de manter|avoidance=Decisão que estou a evitar|fear=Receio que me limita|underused=Força que uso pouco|overestimate=Área em que me sobrestimo|underestimate=Área em que me subestimo', 'long') },
  { title: '12. Preferências da jornada', prompt: 'Ajustamos o ritmo para ser desafiante e sustentável.', fields: fields('length=Comprimento desejado da jornada|pace=Ritmo preferido|activeBooks=Número máximo de livros ativos|accountability=Quero acompanhamento rigoroso|disagreement=Quero ser desafiado com contrapontos|fixedOrAdaptive=Prefiro plano fixo ou fases adaptativas|abandon=O que me faria abandonar|success=O que faria a jornada parecer bem-sucedida', 'long') },
  { title: '13. Contexto adicional', prompt: 'Inclui apenas contexto necessário para personalizar com respeito.', fields: fields('additional=Informação importante não coberta|sensitive=Tópicos sensíveis a abordar com cuidado|excludedBooks=Livros ou autores que não quero|perspectives=Perspetivas filosóficas, religiosas ou morais a incluir|challenge=Perspetivas que quero ver questionadas', 'long') },
];

export const V8_CORE_FIELDS = ['age', 'country', 'language', 'role', 'lifeStage', 'problem', 'result', 'hours', 'format', 'mistake'];
