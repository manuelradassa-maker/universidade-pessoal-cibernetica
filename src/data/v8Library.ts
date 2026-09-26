import {
  BookRole,
  EvidenceClass,
  LibraryEntry,
  LibraryList,
  LibraryTier,
  ReadDepth,
  V8StageId
} from '../types';

/**
 * BIBLIOTECA MESTRE V8 — registos canónicos.
 * ==================================================================
 * Cada entrada cumpre o "CANONICAL BOOK RECORD" do Prompt Mestre V8:
 * rank, título, autor, ano, domínio, estágio, dificuldade, contribuição
 * central, razão de inclusão, o que desenvolve, aplicação prática,
 * limitação crítica e profundidade de leitura.
 *
 * NOTAS DE RIGOR (nada é maquilhado):
 *  - Nenhuma obra entra por fama, bestseller ou rating de plataforma.
 *  - Cada entrada declara a sua base epistémica (evidenceClass): fonte,
 *    inferência razoável ou julgamento editorial.
 *  - Limitações e críticas estão escritas por entrada; quando evidência
 *    posterior enfraqueceu a tese, isso está declarado.
 *  - Os anos correspondem à primeira publicação habitualmente aceite.
 *    A verificação primária campo a campo é tarefa declarada e aberta
 *    (o painel de conformidade não a apresenta como concluída).
 */

type Reread = 'Alto' | 'Médio' | 'Baixo';

/**
 * Construtor posicional compacto. Ordem fixa:
 * rank, lista, título, autor, ano, domínio, estágio, dificuldade, extensão,
 * profundidade, papel, base epistémica, tier, releitura, contribuição central,
 * razão de inclusão, o que desenvolve, aplicação prática, limitação crítica.
 */
const e = (
  rank: number,
  list: LibraryList,
  title: string,
  author: string,
  year: number,
  domain: string,
  stage: V8StageId,
  difficulty: 1 | 2 | 3 | 4 | 5,
  durationOrPages: string,
  readDepth: ReadDepth,
  role: BookRole,
  evidenceClass: EvidenceClass,
  tier: LibraryTier,
  rereadValue: Reread,
  coreContribution: string,
  whyIncluded: string,
  whatItDevelops: string,
  bestPracticalApplication: string,
  criticalWarning: string
): LibraryEntry => ({
  rank,
  list,
  title,
  author,
  year,
  domain,
  stage,
  difficulty,
  durationOrPages,
  readDepth,
  role,
  evidenceClass,
  tier,
  rereadValue,
  coreContribution,
  whyIncluded,
  whatItDevelops,
  bestPracticalApplication,
  criticalWarning
});

const PESSOAL_1: LibraryEntry[] = [
  e(1, 'pessoal', 'Meditações', 'Marco Aurélio', 180, 'Caráter e responsabilidade pessoal', 1, 2, '~200 pág.', 'Master', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Separa o que depende de nós do que não depende e reduz o sofrimento à qualidade do julgamento.',
    'É o registo prático mais antigo de autodomínio exercido sob pressão real, sem promessas mágicas.',
    'Autodomínio, aceitação do incontrolável, dever e serviço.',
    'Diário de 10 minutos: nomear a dificuldade do dia e separar o controlável do incontrolável.',
    'Escrito para uso privado e sem sistema pedagógico: exige leitura ativa para virar prática.'),
  e(2, 'pessoal', 'Cartas a Lucílio', 'Séneca', 65, 'Filosofia, espiritualidade e mortalidade', 1, 3, '~400 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Trata o tempo como recurso irreversível e a adversidade como material de treino moral.',
    'Dá base ética e existencial à disciplina, evitando que a ambição se torne cinismo.',
    'Uso deliberado do tempo, serenidade perante perdas, amizade e progresso moral.',
    'Auditoria semanal do tempo: onde foi gasto, o que se perdeu, qual o corte decidido.',
    'Estilo epistolar do século I: alguns conselhos sociais são contextualmente limitados.'),
  e(3, 'pessoal', 'Ética a Nicómaco', 'Aristóteles', -340, 'Caráter e responsabilidade pessoal', 1, 4, '~350 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Define virtude como hábito e o bem como atividade da alma segundo a razão, não como sentimento.',
    'É a origem conceptual da cadeia hábito → caráter → destino usada por quase toda a literatura posterior.',
    'Deliberação prática, virtude como meio-termo, amizade como bem, felicidade como atividade.',
    'Escolher uma virtude por semana e registar uma decisão concreta onde ela foi ou não exercida.',
    'Contexto grego (escravatura, papéis sociais) exige leitura crítica, não adoção literal.'),
  e(4, 'pessoal', 'Hábitos Atómicos', 'James Clear', 2018, 'Hábitos, disciplina e atenção', 1, 1, '320 pág.', 'Master', 'Ferramenta', 'Inferência razoável', 1, 'Alto',
    'Sistematiza a mudança de comportamento em quatro leis: claro, atraente, fácil e satisfatório.',
    'Converte intenções abstratas em desenho de ambiente e em ações de dois minutos executáveis hoje.',
    'Formação de hábito ancorada em identidade, gatilhos e atrito ambiental.',
    'Definir "depois de [hábito existente] faço [ação de 2 minutos]" e registar adesão durante 21 dias.',
    'Base sobretudo prática: a literatura científica é citada de forma seletiva e simplificada.'),
  e(5, 'pessoal', 'Atenção: o Recurso Mais Valioso', 'Johann Hari', 2022, 'Hábitos, disciplina e atenção', 1, 2, '~350 pág.', 'Read', 'Corretivo', 'Inferência razoável', 2, 'Médio',
    'Mostra que a atenção se degrada por ambiente, tecnologia, sono, trabalho e isolamento, não por fraqueza moral.',
    'Ataca a causa ambiental da dispersão antes de exigir mais força de vontade ao leitor.',
    'Higiene de atenção, controlo do ambiente digital, sono e recuperação.',
    'Auditoria de notificações e quarentena matinal de 90 minutos sem ecrãs durante 14 dias.',
    'Reportagem narrativa: algumas teses sociais são interpretação, não consenso científico.'),
  e(6, 'pessoal', 'Como Fazer Amigos e Influenciar Pessoas', 'Dale Carnegie', 1936, 'Comunicação e inteligência social', 3, 2, '~290 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Médio',
    'Codifica a mecânica da consideração genuína: interesse sincero, nome, elogio específico, evitar contradição por prazer.',
    'Permanece o manual mais transferível da mecânica social básica e da redução de atrito humano.',
    'Escuta, persuasão não coerciva, gestão de conflito interpessoal.',
    'Aplicar uma técnica por dia em conversas reais durante uma semana e registar o efeito observado.',
    'Exemplos anedóticos da cultura empresarial americana de 1930; pode soar instrumental se mal usado.'),
  e(7, 'pessoal', 'Comunicação Não Violenta', 'Marshall B. Rosenberg', 1999, 'Comunicação e inteligência social', 3, 2, '~250 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Alto',
    'Estrutura a fala em quatro passos: observação, sentimento, necessidade e pedido concreto.',
    'É o protocolo mais praticável para conduzir conflito sem escalar ou humilhar.',
    'Regulação emocional aplicada à fala, empatia estruturada e pedido claro.',
    'Reescrever um conflito real nos quatro passos antes de o levar à pessoa envolvida.',
    'Pode soar mecânico contra má-fé; não substitui limites, consequências e firmeza.'),
  e(8, 'pessoal', 'Os Melhores Discursos (Chris Anderson / TED)', 'Chris Anderson', 2016, 'Comunicação e inteligência social', 3, 2, '~270 pág.', 'Read', 'Ferramenta', 'Inferência razoável', 2, 'Médio',
    'Destila a arquitetura de uma ideia transmissível: fio condutor, contexto, estrutura e chamada à ação.',
    'O objetivo de quem aprende é ser compreendido, não apenas ter razão: aqui está o método.',
    'Clareza expositiva, síntese e transmissão de valor em público.',
    'Preparar e apresentar uma ideia própria em 5 minutos, sem notas, a uma pessoa real.',
    'Otimizado para formatos curtos de palco; não cobre argumentação técnica longa.')
];

const PESSOAL_2: LibraryEntry[] = [
  e(9, 'pessoal', 'Mindset: A Nova Psicologia do Sucesso', 'Carol Dweck', 2006, 'Identidade e autoconhecimento', 1, 2, '~300 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Distingue mentalidade fixa de mentalidade de crescimento e mostra o efeito no erro e no esforço.',
    'Explica porque pessoas capazes evitam desafios e como elogio mal colocado cria fragilidade.',
    'Reenquadramento do erro, persistência e resposta a feedback difícil.',
    'Registar um erro da semana e reescrevê-lo como informação sobre estratégia, não sobre identidade.',
    'Risco de simplificação: "mentalidade de crescimento" virou slogan e algumas intervenções têm evidência fraca.'),
  e(10, 'pessoal', 'Inteligência Emocional', 'Daniel Goleman', 1995, 'Regulação emocional e resiliência', 1, 3, '~450 pág.', 'Read', 'Referência', 'Ideia contestada', 2, 'Médio',
    'Torna a emoção objeto legítimo de estudo e liga autoconsciência a autocontrolo e empatia.',
    'É o ponto de entrada histórico para vocabulário emocional, hoje indispensável em negociação.',
    'Nomeação de estados internos, protelação da reação e leitura social.',
    'Registo de gatilhos: o que aconteceu, o que senti, o que fiz, o que faria diferente em 90 segundos.',
    'A tese de que o QE prevê sucesso é contestada e frequentemente exagerada face aos dados disponíveis.'),
  e(11, 'pessoal', 'O Corpo Não Esquece', 'Bessel van der Kolk', 2014, 'Saúde mental e compreensão psicológica', 1, 4, '~430 pág.', 'Study', 'Referência', 'Ideia contestada', 2, 'Alto',
    'Mostra como o trauma se inscreve no corpo e reorganiza respostas fisiológicas e relações.',
    'Sem literacia de trauma, autodisciplina pode transformar-se em violência contra si mesmo.',
    'Compreensão de respostas automáticas, regulação somática e limites do esforço voluntário.',
    'Mapear uma reação desproporcionada e identificar o padrão fisiológico que a antecede.',
    'Material sensível; algumas interpretações neurocientíficas são contestadas por investigadores.'),
  e(12, 'pessoal', 'Porque Dormimos', 'Matthew Walker', 2017, 'Saúde física, energia e longevidade', 1, 2, '~420 pág.', 'Master', 'Ferramenta', 'Ideia contestada', 1, 'Alto',
    'Demonstra que o sono é alicerce fisiológico de memória, humor, decisão e saúde metabólica.',
    'Nenhum plano de disciplina sobrevive a privação de sono: ataca a base antes de tudo o resto.',
    'Higiene circadiana, consistência de horários, exposição à luz e corte de cafeína tardia.',
    'Protocolo de 21 dias: hora fixa de deitar, sem cafeína após as 14h, telemóvel fora do quarto.',
    'Alguns números e generalizações foram criticados por exagero; o núcleo é bem sustentado.'),
  e(13, 'pessoal', 'Aprender a Aprender', 'Peter C. Brown, Henry Roediger, Mark A. McDaniel', 2014, 'Aprendizagem e criatividade', 2, 2, '~320 pág.', 'Study', 'Ferramenta', 'Suportado por fontes', 1, 'Alto',
    'Substitui releitura e sublinhar por recuperação ativa, prática espaçada e intercalada.',
    'Corrige o erro de estudo mais comum: confundir familiaridade com domínio.',
    'Retenção real, autoavaliação honesta e transferência para problemas novos.',
    'Converter cada capítulo em cinco perguntas e respondê-las de memória a 24h, 7 dias e 30 dias.',
    'Base de ciência cognitiva sólida, mas exige disciplina desconfortável para ser aplicada.'),
  e(14, 'pessoal', 'Como Ler um Livro', 'Mortimer Adler e Charles Van Doren', 1940, 'Aprendizagem e criatividade', 2, 2, '~400 pág.', 'Study', 'Ferramenta', 'Suportado por fontes', 2, 'Alto',
    'Define quatro níveis de leitura: elementar, inspecional, analítica e sintópica.',
    'Ensina a extrair a tese e a estrutura de um livro e a comparar autores em vez de os colecionar.',
    'Leitura inspecional, análise de argumento e leitura sintópica.',
    'Aplicar leitura sintópica a dois autores que discordam do mesmo tema e escrever a matriz de divergência.',
    'Linguagem e exemplos datados; os quatro níveis, porém, continuam operativos.')
];

const PESSOAL_3: LibraryEntry[] = [
  e(15, 'pessoal', 'Antifrágil', 'Nassim Nicholas Taleb', 2012, 'Regulação emocional e resiliência', 2, 4, '~500 pág.', 'Study', 'Contraponto', 'Inferência razoável', 2, 'Alto',
    'Sistemas podem ganhar com a desordem; opcionalidade e assimetria de risco explicam resiliência.',
    'Contrapõe a cultura de otimização frágil e protege contra colapso por alavancagem excessiva.',
    'Apetite por erro pequeno, risco assimétrico e desprezo por previsão de curto prazo.',
    'Limitar a perda máxima por decisão e manter exposições de ganho muito positivas.',
    'Tom polémico e alvos por vezes mal caracterizados; exige leitura crítica.'),
  e(16, 'pessoal', 'Sentir-se Bem', 'David D. Burns', 1980, 'Saúde mental e compreensão psicológica', 2, 3, '~450 pág.', 'Study', 'Ferramenta', 'Suportado por fontes', 2, 'Alto',
    'Nomeia distorções cognitivas e ensina a refutá-las por escrito.',
    'Dá ao leitor um método para discutir com o próprio pensamento antes de agir sobre ele.',
    'Deteção de distorção, reestruturação cognitiva e redução de ruminação.',
    'Registo de três colunas: pensamento, distorção identificada, resposta racional verificável.',
    'Autoajuda clínica: não substitui acompanhamento profissional em quadros graves.'),
  e(17, 'pessoal', 'A Coragem de Ser Imperfeito', 'Brené Brown', 2012, 'Identidade e autoconhecimento', 3, 2, '~250 pág.', 'Read', 'Referência', 'Inferência razoável', 3, 'Médio',
    'Define vulnerabilidade como condição de coragem e ligação, e vergonha como travão.',
    'Corrige a leitura de que força equivale a ausência de exposição emocional.',
    'Coragem emocional, aceitação da imperfeição e autenticidade social.',
    'Executar uma exposição evitada e registar o que realmente aconteceu, sem dramatizar.',
    'Investigação qualitativa: generalizações sobre género e liderança são discutíveis.'),
  e(18, 'pessoal', 'Sete Princípios para o Casamento', 'John M. Gottman', 1999, 'Relações, família e amor', 3, 2, '~300 pág.', 'Study', 'Ferramenta', 'Suportado por fontes', 2, 'Alto',
    'Identifica padrões observáveis que prenunciam rutura: crítica, desprezo, defensividade, bloqueio.',
    'Torna a relação objeto de análise baseada em observação e não em opinião romântica.',
    'Gestão de conflito, reparação e construção de significado partilhado.',
    'Durante uma semana, substituir crítica à pessoa por queixa específica de comportamento.',
    'Amostras sobretudo americanas e heterossexuais; exige adaptação cultural.'),
  e(19, 'pessoal', 'O Homem em Busca de Sentido', 'Viktor E. Frankl', 1946, 'Propósito e trabalho com sentido', 8, 2, '~150 pág.', 'Master', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Sustenta que sentido e escolha de atitude são a última liberdade humana.',
    'Impede que o leitor reduza a vida a produtividade e desempenho.',
    'Propósito, responsabilidade, escolha de atitude e resistência psicológica.',
    'Escrever o propósito em três frases e confrontá-lo com uma decisão desta semana.',
    'Testemunho de contexto específico: não generalizar a experiência de todas as vítimas.'),
  e(20, 'pessoal', 'A Psicologia Financeira', 'Morgan Housel', 2020, 'Dinheiro e comportamento financeiro', 4, 2, '~250 pág.', 'Study', 'Ferramenta', 'Julgamento editorial', 1, 'Alto',
    'Mostra que gerir dinheiro é comportamento e paciência mais do que cálculo sofisticado.',
    'Cria literacia financeira real antes de qualquer ambição de capital ou investimento.',
    'Poupança, margem de segurança, tolerância a volatilidade e definição de suficiente.',
    'Automatizar uma taxa de poupança e definir explicitamente o valor que é suficiente.',
    'Ensaios ilustrativos: não é manual técnico de investimento nem aconselhamento financeiro.'),
  e(21, 'pessoal', 'O Homem Mais Rico da Babilónia', 'George S. Clason', 1926, 'Dinheiro e comportamento financeiro', 2, 1, '~150 pág.', 'Read', 'Fundação', 'Julgamento editorial', 2, 'Médio',
    'Formula regras simples e duráveis: pagar-se primeiro, controlar despesas, prudência no investimento.',
    'É a introdução mais acessível a uma relação disciplinada com dinheiro.',
    'Disciplina de poupança, gestão de dívida e prudência de investimento.',
    'Transferir 10% de cada entrada para reserva antes de qualquer despesa discricionária.',
    'Parábolas simplistas e datadas: não substitui literacia financeira moderna.')
];
const PESSOAL_4: LibraryEntry[] = [
  e(22, 'pessoal', 'O Poder do Hábito', 'Charles Duhigg', 2012, 'Hábitos, disciplina e atenção', 1, 2, '~400 pág.', 'Read', 'Referência', 'Inferência razoável', 2, 'Médio',
    'Descreve o ciclo gatilho, rotina e recompensa e a substituição da rotina mantendo o gatilho.',
    'Complementa a literatura de hábitos com casos organizacionais concretos.',
    'Diagnóstico de laços de hábito e desenho de rotina alternativa.',
    'Mapear um hábito indesejado em gatilho, rotina e recompensa e desenhar a rotina alternativa.',
    'Repete material de outros manuais: dispensável para quem já leu o essencial.'),
  e(23, 'pessoal', 'Trabalho Focado', 'Cal Newport', 2016, 'Hábitos, disciplina e atenção', 2, 3, '~300 pág.', 'Master', 'Ferramenta', 'Inferência razoável', 1, 'Alto',
    'Argumenta que a concentração profunda se tornou rara e por isso economicamente mais valiosa.',
    'Liga diretamente atenção a trabalho diferenciado de alto valor.',
    'Blocos de foco, ritual de entrada, gestão de interrupção e desconexão deliberada.',
    'Instalar blocos de foco diários com hora fixa e entregável definido à entrada.',
    'Base empírica indireta: extrapola de casos de profissionais de conhecimento bem-sucedidos.'),
  e(24, 'pessoal', 'A Estrada para o Caráter', 'David Brooks', 2015, 'Caráter e responsabilidade pessoal', 8, 3, '~300 pág.', 'Read', 'Referência', 'Julgamento editorial', 3, 'Médio',
    'Contrasta o currículo do sucesso com o currículo da maturidade moral e da humildade.',
    'Prepara o estágio final: força sem virtude transforma-se em dano em escala.',
    'Humildade, dever, maturidade emocional e seriedade moral.',
    'Identificar uma fraqueza de caráter persistente e definir uma prática concreta de correção.',
    'Biográfico e interpretativo: é argumento moral, não investigação controlada.')
];

const NEGOCIOS_1: LibraryEntry[] = [
  e(1, 'negocios', 'A Startup Enxuta', 'Eric Ries', 2011, 'Empreendedorismo: mentalidade e realidade', 4, 3, '~350 pág.', 'Master', 'Fundação', 'Inferência razoável', 1, 'Alto',
    'Substitui o plano extenso pelo ciclo construir-medir-aprender com produto mínimo viável.',
    'Dá método para testar hipóteses de negócio a custo baixo antes de comprometer capital.',
    'Experimentação disciplinada, métricas acionáveis e decisão de perseverar ou pivotar.',
    'Escrever três hipóteses — problema, oferta e canal — e desenhar o teste mais barato para cada.',
    'Aplicável sobretudo a software e ciclos rápidos; em serviços pesados exige adaptação.'),
  e(2, 'negocios', 'O Mito do Empreendedor', 'Michael E. Gerber', 1986, 'Operações e execução', 5, 2, '~250 pág.', 'Study', 'Fundação', 'Inferência razoável', 1, 'Alto',
    'Mostra como o técnico competente falha ao tentar ser empresário sem construir sistemas.',
    'Ataca a causa mais comum de estagnação no negócio pequeno: dependência total do dono.',
    'Desenho de processos, delegação e visão do negócio como sistema replicável.',
    'Escrever o manual operacional de uma tarefa que só o dono sabe fazer, como se fosse para um estranho.',
    'Repetitivo e com estilo de consultoria; a tese central continua válida.'),
  e(3, 'negocios', 'O Teste da Mãe', 'Rob Fitzpatrick', 2013, 'Descoberta do cliente', 4, 1, '~130 pág.', 'Master', 'Ferramenta', 'Inferência razoável', 1, 'Alto',
    'Ensina entrevistas de cliente que não produzem elogios inúteis nem falsa validação.',
    'Corrige o erro que destrói mais negócios: perguntar de forma viciada e ler cortesia como sinal.',
    'Entrevista honesta, escuta e distinção entre compromisso real e simpatia.',
    'Entrevistar 10 potenciais clientes sem revelar a ideia, procurando problemas passados e custos reais.',
    'Não cobre negociação nem vendas complexas: é ferramenta de descoberta, não de fecho.'),
  e(4, 'negocios', 'Oferta Irresistível', 'Alex Hormozi', 2021, 'Ofertas e proposta de valor', 4, 2, '~160 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Médio',
    'Operacionaliza valor percebido: resultado desejado × certeza, dividido por tempo e esforço.',
    'Dá método concreto para tornar a oferta difícil de recusar sem manipulação.',
    'Desenho de oferta, eliminação de atrito, garantia e perceção de valor.',
    'Reduzir esforço e tempo de entrega da oferta atual mantendo o resultado prometido.',
    'Foco comercial agressivo: exige calibração ética e entrega real, senão vira promessa vazia.'),
  e(5, 'negocios', 'Vendas SPIN', 'Neil Rackham', 1988, 'Vendas', 4, 3, '~250 pág.', 'Study', 'Ferramenta', 'Suportado por fontes', 1, 'Alto',
    'Baseia-se em investigação observacional: situação, problema, implicação e necessidade de solução.',
    'É um dos poucos livros de vendas assentes em estudo sistemático de conversas reais.',
    'Diagnóstico de problema, construção de implicação e fecho por valor.',
    'Escrever três perguntas de implicação sobre o custo do problema antes do próximo contacto.',
    'Foco em vendas B2B de ciclo longo; em transações simples é excessivo.'),
  e(6, 'negocios', 'Influência: A Psicologia da Persuasão', 'Robert Cialdini', 1984, 'Copywriting e persuasão', 4, 3, '~380 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Organiza seis princípios de influência: reciprocidade, compromisso, prova social, autoridade, simpatia, escassez.',
    'Serve tanto para persuadir com ética como para reconhecer manipulação dirigida a si.',
    'Deteção de táticas de influência e comunicação legítima de valor.',
    'Auditar uma compra recente e identificar qual princípio foi usado e por quem.',
    'Conhecimento duplamente utilizável: sem ética, torna-se kit de manipulação.')
];

const NEGOCIOS_2: LibraryEntry[] = [
  e(7, 'negocios', 'Posicionamento: A Batalha pela Sua Mente', 'Al Ries e Jack Trout', 1981, 'Modelos de negócio e posicionamento', 5, 2, '~210 pág.', 'Study', 'Fundação', 'Julgamento editorial', 1, 'Alto',
    'Posicionamento é o lugar que a marca ocupa na mente do cliente, não um atributo interno do produto.',
    'Explica porque ser melhor não basta se a perceção do mercado já está organizada de outra forma.',
    'Escolha de categoria, diferenciação e sequência de entrada no mercado.',
    'Escrever numa frase a categoria em que competes e porque serias escolhido em vez da alternativa.',
    'Exemplos de publicidade do século XX: princípios duradouros, táticas datadas.'),
  e(8, 'negocios', 'Isto é Marketing', 'Seth Godin', 2018, 'Marketing e aquisição', 5, 2, '~270 pág.', 'Read', 'Referência', 'Julgamento editorial', 2, 'Médio',
    'Redefine marketing como serviço a um público específico e mudança voluntária desejada.',
    'Contrapõe a cultura de interromper e pressionar, centrando a atenção no público mais pequeno viável.',
    'Escolha de público, tensão narrativa e construção de confiança.',
    'Definir explicitamente quem é o público mínimo viável da oferta atual e o que ele mudaria.',
    'Ensaios aforísticos: inspiram direção estratégica, mas não substituem execução nem dados.'),
  e(9, 'negocios', 'Traction', 'Gabriel Weinberg e Justin Mares', 2014, 'Marketing e aquisição', 4, 2, '~230 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Alto',
    'Cataloga 19 canais de aquisição e propõe testá-los em paralelo com critério e orçamento.',
    'Elimina o palpite no canal: mede canais em vez de os debater.',
    'Seleção experimental de canal, custo de aquisição e decisão por dados.',
    'Escolher três canais, definir orçamento de teste e medir custo por cliente em cada um.',
    'Foco em produtos digitais recentes; canais envelhecem e alguns exemplos ficaram obsoletos.'),
  e(10, 'negocios', 'Building a StoryBrand', 'Donald Miller', 2017, 'Copywriting e persuasão', 4, 1, '~230 pág.', 'Read', 'Ferramenta', 'Julgamento editorial', 2, 'Médio',
    'Estrutura a mensagem com o cliente como protagonista e a marca como guia.',
    'Resolve o erro de comunicação mais comum: falar de si em vez do problema do cliente.',
    'Clareza de mensagem, proposta e chamada à ação.',
    'Reescrever a página principal do próprio projeto com a estrutura problema, guia, plano, ação.',
    'Simplifica excessivamente narrativas complexas; funciona melhor em produtos de consumo e serviços.'),
  e(11, 'negocios', 'O MBA Pessoal', 'Josh Kaufman', 2010, 'Modelos de negócio e posicionamento', 4, 2, '~500 pág.', 'Master', 'Fundação', 'Inferência razoável', 1, 'Alto',
    'Sistematiza cinco pilares de qualquer negócio: criação de valor, marketing, vendas, entrega e finanças.',
    'Desmistifica a gestão empresarial sem jargão académico nem promessas de enriquecimento rápido.',
    'Vocabulário empresarial completo e visão do negócio como sistema integrado.',
    'Mapear uma ideia nos cinco pilares e identificar qual deles está vazio.',
    'Visão panorâmica: não substitui domínio profundo de nenhuma competência específica.'),
  e(12, 'negocios', 'Business Model Generation', 'Alexander Osterwalder e Yves Pigneur', 2010, 'Modelos de negócio e posicionamento', 5, 2, '~280 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Alto',
    'Fornece o quadro de modelo de negócio em nove blocos e as ferramentas visuais de desenho.',
    'Torna comparável aquilo que normalmente se discute de forma abstracta: como o valor é criado e capturado.',
    'Análise de modelo de negócio, segmentação e fontes de receita.',
    'Preencher o quadro de nove blocos para o próprio projeto e para um concorrente direto.',
    'Ferramenta de estrutura, não de validação: um quadro preenchido não prova que o negócio funciona.'),
  e(13, 'negocios', 'Monetizing Innovation', 'Madhavan Ramanujam e Georg Tacke', 2016, 'Preços e monetização', 5, 3, '~250 pág.', 'Study', 'Ferramenta', 'Suportado por fontes', 2, 'Alto',
    'Mostra que preço deve ser desenhado com o produto e não fixado no fim, e como evitar produtos sem disposição a pagar.',
    'Corrige a causa mais frequente de fracasso comercial: inventar primeiro e perguntar o preço depois.',
    'Disposição a pagar, arquitetura de oferta e segmentação por valor.',
    'Conduzir cinco conversas de preço antes de construir, testando faixas e reações reais.',
    'Baseado em estudo de consultoria com viés para empresas estabelecidas, não para fases iniciais.'),
  e(14, 'negocios', 'Empreendedorismo Disciplinado', 'Bill Aulet', 2013, 'Oportunidade e seleção de mercado', 4, 3, '~300 pág.', 'Study', 'Ferramenta', 'Suportado por fontes', 2, 'Alto',
    'Divide a jornada em 24 passos verificáveis, do mercado inicial ao produto e à economia do negócio.',
    'Dá sequência lógica a quem tem ideias mas não sabe o que decidir primeiro.',
    'Seleção de mercado de entrada, quantificação de valor e construção de economia unitária.',
    'Identificar um mercado de entrada muito específico e calcular quantos clientes são necessários para a meta de receita.',
    'Estrutura académica densa: cansa se lido como livro em vez de usado como guia de trabalho.')
];

const NEGOCIOS_3: LibraryEntry[] = [
  e(15, 'negocios', 'Os Dilemas do Fundador', 'Noam Wasserman', 2012, 'Oportunidade e seleção de mercado', 5, 4, '~400 pág.', 'Study', 'Referência', 'Suportado por fontes', 2, 'Alto',
    'Analisa milhares de novas empresas para explicar decisões de equipa, capital e controlo.',
    'Substitui intuição sobre sócios e divisão de capital por padrões observados em dados.',
    'Escolha de sócios, divisão de capital, controlo e decisões irreversíveis.',
    'Escrever as regras de saída de um sócio antes de existir qualquer conflito.',
    'Amostra concentrada em tecnologia financiada: extrapolação limitada a outros modelos.'),
  e(16, 'negocios', 'Lucro Primeiro', 'Mike Michalowicz', 2014, 'Contabilidade e controlo financeiro', 5, 2, '~200 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Médio',
    'Inverte a ordem contabilística: separar o lucro primeiro e adaptar a operação ao resto.',
    'Resolve o caso comum de negócio lucrativo no papel e permanentemente sem caixa.',
    'Disciplina de fluxo de caixa, contas separadas e controlo de despesas.',
    'Abrir contas separadas e transferir a percentagem de lucro no dia em que entra receita.',
    'Solução de gestão de caixa, não de estratégia: exige execução rigorosa e mensal.'),
  e(17, 'negocios', 'Inteligência Financeira', 'Karen Berman e Joe Knight', 2006, 'Contabilidade e controlo financeiro', 5, 3, '~300 pág.', 'Study', 'Fundação', 'Suportado por fontes', 2, 'Alto',
    'Ensina a ler demonstrações financeiras e a ligar decisões operacionais a resultados.',
    'Sem literacia contabilística o empresário governa por sensação e descobre problemas tarde.',
    'Leitura de balanço, resultados, fluxo de caixa e indicadores de gestão.',
    'Recalcular margem bruta e ponto crítico do próprio negócio com dados reais do último mês.',
    'Contexto americano: princípios contabilísticos exigem adaptação à realidade local.'),
  e(18, 'negocios', 'Como Chegar ao Sim', 'Roger Fisher e William Ury', 1981, 'Negociação', 3, 2, '~200 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Propõe negociação por princípios: interesses, não posições; critérios objetivos; alternativa fora da mesa.',
    'Dá a estrutura que impede a negociação de degradar-se em desgaste emocional.',
    'Separação pessoa-problema, interesses, geração de opções e critérios objetivos.',
    'Preparar uma negociação real definindo por escrito a melhor alternativa fora da mesa antes de entrar.',
    'Assume racionalidade razoável; contra negociadores de má-fé exige complemento tático.'),
  e(19, 'negocios', 'Nunca Dividas a Diferença', 'Chris Voss', 2016, 'Negociação', 5, 3, '~280 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Alto',
    'Aplica técnicas de negociação de reféns: espelhamento, rotulagem, perguntas calibradas.',
    'Ensina a manter controlo emocional e a recolher informação em conversas de alta pressão.',
    'Escuta tática, desescalada e condução de conversa difícil.',
    'Aplicar espelhamento e rotulagem numa conversa difícil real e registar o efeito no tom.',
    'Contexto policial extremo: algumas técnicas soam manipuladoras se usadas sem transparência.')
];

const NEGOCIOS_4: LibraryEntry[] = [
  e(20, 'negocios', 'Gestão de Alta Produtividade', 'Andrew S. Grove', 1983, 'Gestão, contratação e cultura', 6, 3, '~250 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Define a produção do gestor como a produção da sua organização e mostra como a medir.',
    'É o manual de gestão com utilidade prática mais imediata, escrito por um operador real.',
    'Definição de objetivos, reuniões como ferramenta, delegação e indicadores.',
    'Definir um indicador de produção para a equipa e uma reunião com pautas e decisões registadas.',
    'Anterior à generalização do trabalho remoto: exige adaptação a equipas distribuídas.'),
  e(21, 'negocios', 'O Executivo Eficaz', 'Peter F. Drucker', 1966, 'Gestão, contratação e cultura', 6, 3, '~200 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Reduz a eficácia executiva a cinco práticas observáveis e treináveis.',
    'É o primeiro sistema sério de autogestão profissional e decisão organizacional.',
    'Gestão do tempo, foco em contribuição, uso de forças e decisão efetiva.',
    'Registar durante uma semana onde o tempo foi gasto e cortar um compromisso de baixo valor.',
    'Exemplos de organizações dos anos 60: as práticas permanecem, o contexto mudou.'),
  e(22, 'negocios', 'Estratégia Competitiva', 'Michael E. Porter', 1980, 'Estratégia e concorrência', 6, 4, '~400 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Estabelece as cinco forças competitivas e a lógica de vantagem por custo ou diferenciação.',
    'É a base analítica que impede a estratégia de ser apenas ambição verbal.',
    'Análise estrutural de indústria, escolha de vantagem e leitura da concorrência.',
    'Analisar a própria indústria nas cinco forças e identificar onde reside o poder de negociação.',
    'Foco em indústrias estabelecidas: mercados emergentes e digitais exigem instrumentos adicionais.'),
  e(23, 'negocios', '7 Poderes', 'Hamilton Helmer', 2016, 'Estratégia e concorrência', 6, 4, '~180 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Alto',
    'Define sete fontes concretas de poder persistente: escala, efeitos de rede, custos de mudança, marca, canto, contratos, processo.',
    'Torna a vantagem competitiva verificável em vez de aspiracional.',
    'Diagnóstico de poder competitivo e escolha estratégica justificada por dados.',
    'Testar o próprio negócio nos sete poderes e eliminar os que não se sustentam em evidência.',
    'Quadro conceptual de investidor: exige experiência para interpretar corretamente.'),
  e(24, 'negocios', 'A Meta', 'Eliyahu M. Goldratt', 1984, 'Operações e execução', 5, 2, '~350 pág.', 'Study', 'Ferramenta', 'Inferência razoável', 2, 'Alto',
    'Expõe a teoria das restrições: o sistema produz ao ritmo do seu gargalo.',
    'Ensina a identificar e explorar o gargalo em vez de otimizar tudo ao mesmo tempo.',
    'Identificação de gargalo, gestão de fluxo e melhoria contínua.',
    'Mapear o processo principal do negócio e localizar o único passo que limita a produção.',
    'Escrito como novela didática: simplifica contextos com múltiplas restrições simultâneas.')
];

const NEGOCIOS_5: LibraryEntry[] = [
  e(25, 'negocios', 'Zero a Um', 'Peter Thiel', 2014, 'Empreendedorismo: mentalidade e realidade', 5, 2, '~200 pág.', 'Read', 'Contraponto', 'Julgamento editorial', 2, 'Médio',
    'Argumenta que criação de valor exige monopólio tecnológico e não competição por margens finas.',
    'Força a pergunta que quase nenhum plano responde: porque este negócio gera algo único.',
    'Escolha de mercado, segredos de mercado e pensamento de monopólio.',
    'Escrever a resposta à pergunta "que verdade sabes que poucos acreditam e que é verdadeira?".',
    'Generalizações a partir de um universo restrito de startups de tecnologia, com forte ideologia.'),
  e(26, 'negocios', 'O Difícil das Coisas Difíceis', 'Ben Horowitz', 2014, 'Empreendedorismo: mentalidade e realidade', 6, 3, '~300 pág.', 'Study', 'Estudo de Caso', 'Inferência razoável', 2, 'Alto',
    'Documenta decisões difíceis de gestão em crise: despedir amigos, cortar, sobreviver.',
    'Não ensina a evitar crise; ensina a comportar-se quando ela chega, com casos reais.',
    'Decisão sob pressão, comunicação em crise e cultura em tempos ruins.',
    'Escrever um plano de contingência para a pior hipótese financeira dos próximos 12 meses.',
    'Narrativa de um contexto específico (Silicon Valley, software): exige tradução para outros setores.'),
  e(27, 'negocios', 'Shoe Dog', 'Phil Knight', 2016, 'História empresarial, biografias e análise de falhas', 6, 2, '~400 pág.', 'Read', 'Estudo de Caso', 'Inferência razoável', 3, 'Médio',
    'Relata a construção da Nike com dívida permanente, erros e risco de colapso.',
    'Mostra que a história real de uma empresa é feita de improviso e sobrevivência, não de plano limpo.',
    'Persistência, negociação, distribuição e construção de marca ao longo de décadas.',
    'Identificar três decisões do livro que parecem irresponsáveis e explicar porque funcionaram.',
    'Memória de um fundador: sobrevivorship bias presente; não copiar decisões sem contexto.'),
  e(28, 'negocios', 'Porque Falham as Startups', 'Tom Eisenmann', 2021, 'História empresarial, biografias e análise de falhas', 5, 4, '~350 pág.', 'Study', 'Referência', 'Suportado por fontes', 2, 'Alto',
    'Classifica padrões de falha: boas ideias sem mercado, falsos inícios, escala prematura e falhas de equipa.',
    'É leitura preventiva: identifica o modo de falha antes de investir anos no caminho errado.',
    'Deteção precoce de padrões de falha e decisão de paragem.',
    'Classificar o próprio projeto no padrão de falha mais provável e definir um sinal de alerta mensurável.',
    'Baseado em casos de startups financiadas; o vocabulário não cobre negócios familiares ou artesanais.'),
  e(29, 'negocios', 'Os Outsiders', 'William N. Thorndike', 2012, 'Capital, aquisições e propriedade', 7, 3, '~250 pág.', 'Study', 'Estudo de Caso', 'Suportado por fontes', 2, 'Alto',
    'Analisa CEOs que geraram retornos excecionais por alocação de capital e não por carisma.',
    'Enquadra o topo da jornada empresarial: comprar bem, financiar bem, devolver capital.',
    'Alocação de capital, disciplina de aquisição e pensamento de proprietário.',
    'Calcular o retorno sobre capital investido do próprio negócio e compará-lo com alternativas.',
    'Casos históricos de mercados americanos: exige adaptação e ceticismo sobre sobrevivência.'),
  e(30, 'negocios', 'Os Ensaios de Warren Buffett', 'Warren Buffett (org. Lawrence Cunningham)', 1997, 'Capital, aquisições e propriedade', 7, 3, '~350 pág.', 'Study', 'Fundação', 'Julgamento editorial', 2, 'Alto',
    'Expõe princípios de propriedade, avaliação, governança e independência de julgamento.',
    'Traduz a lógica de investimento para a linguagem de quem gere e compra negócios.',
    'Círculo de competência, avaliação de negócio e disciplina de longo prazo.',
    'Escrever a tese de investimento de um negócio real com número, risco e horizonte temporal.',
    'Perspetiva de investidor de capital com acesso a condições que o leitor comum não tem.')
];

const PENSAMENTO_1: LibraryEntry[] = [
  e(1, 'pensamento', 'Pensar, Depressa e Devagar', 'Daniel Kahneman', 2011, 'Enviesamentos cognitivos e autocorreção', 2, 4, '~500 pág.', 'Master', 'Fundação', 'Ideia contestada', 1, 'Alto',
    'Descreve dois modos de pensamento — intuitivo e deliberado — e as heurísticas que produzem erro sistemático.',
    'É a base empírica para detetar juízos automáticos antes de agir sobre eles.',
    'Deteção de enviesamento, calibração de intuição e verificação deliberada.',
    'Antes de cada decisão relevante, escrever a intuição inicial e a verificação de três contra-argumentos.',
    'Vários estudos de priming falharam na crise de replicação; o núcleo dos dois sistemas permanece sólido.'),
  e(2, 'pensamento', 'Superprevisões', 'Philip E. Tetlock e Dan Gardner', 2015, 'Decisão sob incerteza', 5, 3, '~350 pág.', 'Master', 'Ferramenta', 'Suportado por fontes', 1, 'Alto',
    'Resulta de torneios de previsão e mostra o que distingue quem acerta: granularidade e atualização contínua.',
    'Substitui opinião categórica por probabilidade declarada e auditável.',
    'Previsão calibrada, atualização bayesiana e decomposição de problemas.',
    'Criar um diário de previsões com percentagens e rever acertos a cada trimestre.',
    'Resultados de uma comunidade específica de previsores: exige disciplina diária para replicar.'),
  e(3, 'pensamento', 'O Andar do Bêbado', 'Leonard Mlodinow', 2008, 'Julgamento científico e estatístico', 3, 2, '~250 pág.', 'Study', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Explica aleatoriedade, probabilidade e regressão à média através de casos reais.',
    'Corrige a leitura ingénua de padrões em sequências aleatórias.',
    'Intuição probabilística, interpretação de estatística e ceticismo sobre narrativas.',
    'Recalcular um "resultado impressionante" recente e estimar quanta variação aleatória explica.',
    'Didático e por vezes superficial: não substitui um curso formal de estatística.'),
  e(4, 'pensamento', 'O Sinal e o Ruído', 'Nate Silver', 2012, 'Julgamento científico e estatístico', 4, 3, '~500 pág.', 'Study', 'Referência', 'Suportado por fontes', 2, 'Médio',
    'Distingue sinal de ruído em previsão em domínios distintos e mostra os limites de cada modelo.',
    'Ensina a exigir taxa de erro explícita antes de aceitar qualquer previsão.',
    'Avaliação de modelos, pensamento bayesiano e comunicação de incerteza.',
    'Pedir ou estimar a taxa de erro histórica de uma previsão que consome nas notícias.',
    'Exemplos ligados a eleições e desporto americanos; alguns erros do autor são instrutivos.'),
  e(5, 'pensamento', 'O Cisne Negro', 'Nassim Nicholas Taleb', 2007, 'Decisão sob incerteza', 5, 4, '~400 pág.', 'Study', 'Contraponto', 'Inferência razoável', 2, 'Alto',
    'Argumenta que eventos raros e imprevisíveis dominam resultados e que a previsão é sobrestimada.',
    'Contrapeso necessário aos livros de previsão: ensina robustez em vez de acerto.',
    'Assimetria de exposição, limites da indução e desconfiança de modelos elegantes.',
    'Listar as exposições do próprio projeto a eventos raros extremos e reduzir as catastróficas.',
    'Retórica polémica e simplificações sobre estatística aplicada; ler com contraponto técnico.')
];

const PENSAMENTO_2: LibraryEntry[] = [
  e(6, 'pensamento', 'Pensar em Sistemas', 'Donella H. Meadows', 2008, 'Sistemas e complexidade', 6, 4, '~200 pág.', 'Master', 'Fundação', 'Suportado por fontes', 1, 'Alto',
    'Explica stocks, fluxos, atrasos, ciclos de reforço e de equilíbrio e pontos de alavancagem.',
    'É o manual mais claro para deixar de pensar em causas lineares e passar a ver estruturas.',
    'Leitura de sistemas, identificação de ciclos e previsão de efeitos de segunda ordem.',
    'Desenhar o diagrama de um problema próprio com stocks, fluxos e um ciclo de reforço.',
    'Exemplos ecológicos e económicos dos anos 90: os padrões mantêm-se úteis em qualquer domínio.'),
  e(7, 'pensamento', 'A Quinta Disciplina', 'Peter M. Senge', 1990, 'Sistemas e complexidade', 6, 3, '~400 pág.', 'Study', 'Referência', 'Inferência razoável', 2, 'Médio',
    'Aplica pensamento sistémico a organizações, com arquétipos de falha recorrentes.',
    'Liga sistema individual a sistema organizacional, ponte entre domínio pessoal e gestão.',
    'Arquétipos sistémicos, aprendizagem organizacional e modelos mentais partilhados.',
    'Identificar num projeto real um arquétipo sistémico (limites de crescimento, deslocação de carga).',
    'Estilo de gestão dos anos 90 e casos maioritariamente corporativos; requer adaptação.'),
  e(8, 'pensamento', 'A Arte de Ter Razão', 'Arthur Schopenhauer', 1864, 'Lógica e raciocínio claro', 2, 2, '~100 pág.', 'Read', 'Ferramenta', 'Suportado por fontes', 2, 'Médio',
    'Cataloga 38 estratagemas retóricos usados para vencer discussões sem ter razão.',
    'Ensina a reconhecer manipulação argumentativa em tempo real.',
    'Deteção de falácia e defesa argumentativa.',
    'Assinalar num debate público real três estratagemas usados e a resposta que os neutraliza.',
    'Escrito com intenção cínica: serve para reconhecer, não para adotar como estilo próprio.'),
  e(9, 'pensamento', 'Introdução à Lógica', 'Irving M. Copi', 1953, 'Lógica e raciocínio claro', 2, 3, '~400 pág.', 'Study', 'Referência', 'Suportado por fontes', 2, 'Alto',
    'Ensina dedução, indução, validade, falácias informais e definição precisa de conceitos.',
    'Fornece o instrumento técnico que falta a quase toda a literatura de autoajuda cognitiva.',
    'Validade lógica, análise de argumento e precisão conceptual.',
    'Reconstruir por escrito um argumento lido em três premissas e testar a validade da inferência.',
    'Manual académico denso: exige exercícios, não leitura passiva.'),
  e(10, 'pensamento', 'Iludido pelo Acaso', 'Nassim Nicholas Taleb', 2001, 'Enviesamentos cognitivos e autocorreção', 3, 3, '~250 pág.', 'Read', 'Referência', 'Inferência razoável', 3, 'Médio',
    'Mostra como se confunde sorte com competência em resultados observados.',
    'Introduz o ceticismo sobre atribuição causal antes de se estudar estratégia e gestão.',
    'Atribuição causal, sobrevivorship bias e ceticismo sobre narrativas de sucesso.',
    'Analisar um caso de sucesso mediático e listar fatores de sorte que a narrativa omite.',
    'Primeira obra do autor: mais bruta e repetitiva do que as seguintes; sobreposição parcial com elas.')
];

const PENSAMENTO_3: LibraryEntry[] = [
  e(11, 'pensamento', 'A Arte da Guerra', 'Sun Tzu', -500, 'Estratégia, incentivos e poder', 6, 1, '~100 pág.', 'Study', 'Fundação', 'Julgamento editorial', 1, 'Alto',
    'Formula princípios de conflito: conhecer terreno e adversário, vencer sem combater, escolher onde lutar.',
    'É o texto mais antigo e mais transferível sobre vantagem e custo de conflito.',
    'Leitura de terreno, economia de forças e dissuasão.',
    'Aplicar ao próprio negócio: escolher um terreno onde as forças relativas favoreçam a posição.',
    'Aforístico e militar: exige tradução cuidadosa para contextos comerciais e éticos.'),
  e(12, 'pensamento', 'Poder: Porque Alguns Têm e Outros Não', 'Jeffrey Pfeffer', 2010, 'Estratégia, incentivos e poder', 7, 3, '~250 pág.', 'Read', 'Contraponto', 'Inferência razoável', 3, 'Médio',
    'Defende que o poder se constrói por visibilidade, rede e disposição para incomodar.',
    'Prepara para a realidade política das organizações, que os manuais técnicos ignoram.',
    'Leitura de poder, construção de rede e negociação de recursos.',
    'Mapear os decisores reais de uma organização e escrever quem influencia quem e porquê.',
    'Confronta a ética da meritocracia; lido sem filtro moral, justifica oportunismo.'),
  e(13, 'pensamento', 'Armas, Germes e Aço', 'Jared Diamond', 1997, 'Natureza humana, sociedade e civilização', 6, 4, '~450 pág.', 'Study', 'Referência', 'Ideia contestada', 3, 'Médio',
    'Explica diferenças de desenvolvimento por geografia, agricultura e difusão tecnológica.',
    'Dá escala histórica ao julgamento sobre instituições e desigualdade.',
    'Pensamento de longa duração, causalidade geográfica e crítica do determinismo cultural.',
    'Reescrever a explicação de uma diferença regional atual em termos geográficos e institucionais.',
    'Determinismo geográfico é contestado por historiadores; ler com a crítica em mão.'),
  e(14, 'pensamento', 'Porque Falham as Nações', 'Daron Acemoglu e James A. Robinson', 2012, 'Natureza humana, sociedade e civilização', 7, 4, '~450 pág.', 'Study', 'Referência', 'Suportado por fontes', 2, 'Alto',
    'Atribui resultados económicos duradouros ao tipo de instituições políticas e económicas.',
    'Explica como incentivos institucionais determinam o que é possível a longo prazo.',
    'Análise institucional, leitura de incentivos e pensamento de longo prazo.',
    'Identificar uma regra ou incentivo no próprio contexto e prever que comportamento ela produz.',
    'Tese generalista contestada em detalhe por historiadores económicos; o quadro central é robusto.'),
  e(15, 'pensamento', 'Fundamentação da Metafísica dos Costumes', 'Immanuel Kant', 1785, 'Filosofia, ética e sentido', 8, 5, '~100 pág.', 'Selective', 'Fundação', 'Suportado por fontes', 3, 'Alto',
    'Formula o imperativo categórico: agir segundo máximas universalizáveis e tratar pessoas como fins.',
    'Dá o critério mais exigente para resistir a atalhos morais sob pressão.',
    'Raciocínio ético formal, universalização e dever.',
    'Aplicar o teste de universalização a uma decisão que beneficia o próprio e prejudica outro.',
    'Extremamente denso e abstrato; requer introdução secundária antes da leitura direta.'),
  e(16, 'pensamento', 'Sabedoria Prática', 'Barry Schwartz e Kenneth Sharpe', 2010, 'Sabedoria integrativa e prática', 8, 3, '~300 pág.', 'Study', 'Síntese', 'Inferência razoável', 2, 'Alto',
    'Define sabedoria prática como perceção da situação concreta e escolha do meio-termo com propósito moral.',
    'É a ponte entre raciocínio abstrato e ação correta em contexto real.',
    'Discernimento contextual, julgamento moral e ação proporcionada.',
    'Registar três decisões da semana e avaliar se a resposta foi proporcional à situação concreta.',
    'Argumento moral e narrativo: não oferece métricas nem protocolos verificáveis.'),
  e(17, 'pensamento', 'Trabalho Focado', 'Cal Newport', 2016, 'Atenção e autodomínio intelectual', 2, 3, '~300 pág.', 'Master', 'Ferramenta', 'Inferência razoável', 1, 'Alto',
    'Converte atenção em capacidade económica: sem foco não existe pensamento profundo sustentado.',
    'É a condição material do pensamento de alto nível: sem atenção não há raciocínio longo.',
    'Blocos cognitivos longos, ritual e proteção de tempo.',
    'Criar dois blocos diários de trabalho cognitivo sem interrupção durante 14 dias.',
    'Sobreposição direta com a lista de desenvolvimento pessoal: contar uma única vez na biblioteca integrada.')
];

/* ------------------------------------------------------------------ */
/* Biblioteca consolidada e leituras derivadas (nunca números inventados) */
/* ------------------------------------------------------------------ */

export const V8_LIBRARY: LibraryEntry[] = [
  ...PESSOAL_1,
  ...PESSOAL_2,
  ...PESSOAL_3,
  ...PESSOAL_4,
  ...NEGOCIOS_1,
  ...NEGOCIOS_2,
  ...NEGOCIOS_3,
  ...NEGOCIOS_4,
  ...NEGOCIOS_5,
  ...PENSAMENTO_1,
  ...PENSAMENTO_2,
  ...PENSAMENTO_3
];

/** Alvo exigido pelo Prompt Mestre V8 para cada lista. */
export const LIST_TARGETS: Record<LibraryList, number> = {
  pessoal: 100,
  negocios: 100,
  pensamento: 50
};

export const LIST_SHORT_LABELS: Record<LibraryList, string> = {
  pessoal: 'Desenvolvimento Pessoal',
  negocios: 'Negócios e Empreendedorismo',
  pensamento: 'Pensamento (Roadmap)'
};

export const byList = (list: LibraryList): LibraryEntry[] =>
  V8_LIBRARY.filter((entry) => entry.list === list);

export const listProgress = (list: LibraryList) => {
  const count = byList(list).length;
  const target = LIST_TARGETS[list];
  return {
    count,
    target,
    missing: Math.max(target - count, 0),
    ratio: Math.min(1, count / target)
  };
};

const dedupKey = (title: string): string =>
  title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9áàâãéêíóôõúç ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Deduplicação real: a mesma obra em listas distintas conta uma única vez. */
export const UNIQUE_LIBRARY: LibraryEntry[] = (() => {
  const map = new Map<string, LibraryEntry>();
  V8_LIBRARY.forEach((entry) => {
    const key = dedupKey(entry.title);
    if (!map.has(key)) map.set(key, entry);
  });
  return [...map.values()];
})();

export const CROSS_LISTED: LibraryEntry[][] = (() => {
  const groups = new Map<string, LibraryEntry[]>();
  V8_LIBRARY.forEach((entry) => {
    const key = dedupKey(entry.title);
    groups.set(key, [...(groups.get(key) || []), entry]);
  });
  return [...groups.values()].filter(
    (group) => group.length > 1 && new Set(group.map((g) => g.list)).size > 1
  );
})();

export const TIER_COUNTS: Record<LibraryTier, number> = {
  1: V8_LIBRARY.filter((b) => b.tier === 1).length,
  2: V8_LIBRARY.filter((b) => b.tier === 2).length,
  3: V8_LIBRARY.filter((b) => b.tier === 3).length,
  4: V8_LIBRARY.filter((b) => b.tier === 4).length
};

export const domainCoverage = (list: LibraryList) => {
  const counts = new Map<string, number>();
  byList(list).forEach((b) => counts.set(b.domain, (counts.get(b.domain) || 0) + 1));
  return [...counts.entries()]
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));
};

export const stageCoverage = (list?: LibraryList) => {
  const source = list ? byList(list) : V8_LIBRARY;
  const counts = new Map<number, number>();
  source.forEach((b) => counts.set(b.stage, (counts.get(b.stage) || 0) + 1));
  return [1, 2, 3, 4, 5, 6, 7, 8].map((stage) => ({ stage, count: counts.get(stage) || 0 }));
};

export const difficultyCurve = () => {
  const total = V8_LIBRARY.length || 1;
  const near = V8_LIBRARY.filter((b) => b.difficulty <= 2).length;
  const stretch = V8_LIBRARY.filter((b) => b.difficulty === 3 || b.difficulty === 4).length;
  const advanced = V8_LIBRARY.filter((b) => b.difficulty === 5).length;
  return {
    near: Math.round((near / total) * 100),
    stretch: Math.round((stretch / total) * 100),
    advanced: Math.round((advanced / total) * 100)
  };
};

export const mediaTypeLabel = (type: 'livro' | 'documentario' | 'serie' | 'filme'): string => {
  switch (type) {
    case 'documentario':
      return 'Documentário';
    case 'serie':
      return 'Série';
    case 'filme':
      return 'Filme';
    default:
      return 'Livro';
  }
};














