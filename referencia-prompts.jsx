import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const CANAIS = [
  { id: "pago",     label: "Tráfego Pago",  sub: "Ads • Direct Response • VSL • 7–8 dígitos" },
  { id: "organico", label: "Orgânico",       sub: "Facebook • Instagram • Viral • Autoridade" },
];

const FORMATOS_PAGO = [
  { id: "carrossel", label: "Carrossel",       sub: "8–10 slides • debate orgânico • viral" },
  { id: "post",      label: "Post / Anúncio",  sub: "caption longa • imagem forte • conversão" },
  { id: "reel",      label: "Reel / Vídeo",    sub: "script 30–60s • gancho nos 3 primeiros s" },
  { id: "story",     label: "Story Sequência", sub: "5–7 cards • revelação progressiva • CTA" },
];

const FORMATOS_ORGANICO = [
  { id: "viral-post",    label: "Post Viral",               sub: "hook • valor • engajamento" },
  { id: "profile-audit", label: "Auditoria de Perfil",      sub: "bio • post fixado • funil de perfil" },
  { id: "calendario",    label: "Calendário 30 Dias",        sub: "plano completo • educação + oferta" },
  { id: "escada",        label: "Escada de Comentários",     sub: "7 passos • autoridade • leads" },
  { id: "repurpose",     label: "Motor de Repurposing",      sub: "1 ideia → 5 formatos • multi-plataforma" },
  { id: "autoridade",    label: "Posicionamento Autoridade", sub: "frameworks • opinião forte • must-follow" },
  { id: "gap",           label: "Content Gap Killer",        sub: "tendências • lacunas • tópicos virais" },
  { id: "psicologia",    label: "Psicologia da Audiência",   sub: "medos • desejos • gatilhos de scroll" },
  { id: "growth-sprint", label: "Growth Sprint 30D",         sub: "plano de crescimento rápido • formatos" },
  { id: "reverse",       label: "Engenharia Reversa",        sub: "análise de concorrentes • replique" },
];

const OBJETIVOS = [
  { id: "descoberta",     label: "Descoberta",     desc: "Novo público • topo de funil • awareness",    cor: "56,189,248" },
  { id: "relacionamento", label: "Relacionamento", desc: "Engajamento • autoridade • confiança",        cor: "34,197,94"  },
  { id: "conversao",      label: "Conversão",      desc: "Venda direta • CTA agressivo • urgência",     cor: "245,158,11" },
  { id: "remarketing",    label: "Remarketing",    desc: "Quem viu mas não comprou • segunda chance",   cor: "239,68,68"  },
];

// ─── 100 HOOKS — 8 CATEGORIAS (Daniel Chou + Direct Response) ────────────────

const HOOK_CATS = [
  {
    id: "pattern-interrupt",
    label: "Quebra de Padrão",
    desc: "Declarações inesperadas que interrompem o scroll com confissão ou ação contrária",
    pat: "Confissão chocante ou ação contrária ao esperado que força o leitor a parar e querer saber mais",
    col: "239,68,68",
    emoji: "⚡",
    exemplos: [
      "Desperdicei R$[valor] aprendendo isso para que você não precise...",
      "Pare de fazer [prática comum]. Aqui está o que realmente funciona...",
      "Quase destruí uma empresa de [valor] com um único erro. Não repita.",
      "Demiti meu melhor cliente. Veja o que aconteceu depois...",
      "Recusei fazer isso por [X] anos. Estava completamente errado.",
      "Todo mundo me disse que era impossível. Eu fiz mesmo assim...",
      "Estou quebrando todas as regras de [nicho] e está funcionando...",
      "Se você ainda faz [X], você já está atrás do mercado...",
    ],
    instrucao: "A confissão ou ação inesperada é o gancho. O leitor pensa 'por que alguém faria isso?' e precisa saber o resto. Seja específico — valores, tempos, situações reais.",
  },
  {
    id: "curiosity-gap",
    label: "Lacuna de Curiosidade",
    desc: "Revela existência de algo oculto ou descoberto sem entregar o conteúdo",
    pat: "Anuncia que algo existe (segredo, fórmula, teste, padrão) sem revelar o que é",
    col: "168,85,247",
    emoji: "🔍",
    exemplos: [
      "Tem uma função escondida em [plataforma] que 99% das pessoas ignoram...",
      "Testei 1.000 posts. Uma única coisa venceu sempre. Aqui está...",
      "Decodifiquei o padrão por trás de todo funil de 7 dígitos...",
      "Seus concorrentes estão usando isso agora. Você não...",
      "Encontrei a fórmula. É simples ao ponto de dar raiva...",
      "O ingrediente secreto de todo post viral? Não é o que você pensa...",
      "Reverso-engenheirei um lançamento de R$500k. Aqui está o blueprint...",
      "Há uma razão pela qual os maiores criadores nunca compartilham essa estratégia...",
    ],
    instrucao: "Revele a EXISTÊNCIA mas NÃO entregue o conteúdo no hook. A lacuna entre 'algo existe' e 'o que é' gera o clique. Quanto mais específico o dado, mais irresistível.",
  },
  {
    id: "authority",
    label: "Autoridade e Credencial",
    desc: "Dado concreto de experiência + número específico + insight inesperado",
    pat: "Número de experiência + contexto de autoridade + promessa de insight exclusivo",
    col: "245,158,11",
    emoji: "🏆",
    exemplos: [
      "Depois de [N] clientes, percebi um único erro que destrói resultados...",
      "Analisei [N] anúncios. Os top 1% fazem uma única coisa diferente...",
      "Gastei R$[valor] testando isso. Aqui está o que realmente funciona...",
      "Todo [profissional] que cobra R$[valor]+ usa esse framework exato...",
      "Entrevistei 100 [profissão] de sucesso. Todos disseram a mesma coisa...",
      "Depois de [X] anos em [nicho], essa é a maior mudança que já vi...",
      "Gerenciei R$[valor] em anúncios. Aprendi isso da forma mais cara...",
      "Revisando mais de 1.000 [resultados], apenas 3% fazem isso certo...",
    ],
    instrucao: "Número específico + contexto de autoridade + promessa de insight acumulado. Quanto mais específico o número (não '100 clientes' mas '127 clientes'), mais credível e memorável.",
  },
  {
    id: "pain-point",
    label: "Dor Direta",
    desc: "Toca na dor emocional exata e promete alívio imediato",
    pat: "Reconhecimento preciso da dor (sintoma específico) + promessa implícita de solução",
    col: "239,68,68",
    emoji: "🎯",
    exemplos: [
      "Cansado de renda inconsistente? Isso vai mudar tudo...",
      "Postando todo dia e sem resultado? Aqui está o motivo real...",
      "Se sua audiência não compra, você está pulando essa etapa...",
      "Seu conteúdo não é o problema. Sua estratégia é...",
      "Se você ainda troca tempo por dinheiro, leia isso agora...",
      "Invisível nas redes sociais? Uma única mudança resolve...",
      "Se seu lançamento continua flopando, o problema não é sua oferta...",
      "Sentindo-se o melhor segredo guardado do mercado? Isso resolve...",
    ],
    instrucao: "O leitor deve pensar 'você está falando comigo'. Use o sintoma exato — não 'sofrendo com X' mas o que a pessoa experimenta fisicamente ou emocionalmente ao ter esse problema.",
  },
  {
    id: "transformation",
    label: "Promessa de Transformação",
    desc: "Lidera com o resultado desejado e a jornada completa",
    pat: "De [estado atual negativo] para [resultado desejado específico] em [tempo específico]",
    col: "34,197,94",
    emoji: "🚀",
    exemplos: [
      "Como dobrei meus preços e consegui mais clientes ao mesmo tempo...",
      "De [N] seguidores a [N]k em [X] meses. O caminho exato...",
      "Como fiz [X dias] de conteúdo em uma tarde sem perder qualidade...",
      "Como saí do ciclo de criar sem resultado de uma vez por todas...",
      "O sistema simples para atrair clientes premium de forma repetível...",
      "De DMs ignoradas a agenda lotada: o que mudei na minha comunicação...",
      "Como troquei 60 horas semanais por 20h com o dobro de resultado...",
      "De segredo guardado a autoridade reconhecida em 90 dias...",
    ],
    instrucao: "O 'De X para Y' deve ser altamente específico — números reais, tempo real, resultado verificável. O leitor vê o resultado e pensa 'Como?'. Essa pergunta é o hook.",
  },
  {
    id: "controversial",
    label: "Hot Take / Controverso",
    desc: "Desafia o senso comum e provoca debate inteligente",
    pat: "Opinião forte e específica que duas pessoas inteligentes podem discordar legitimamente",
    col: "56,189,248",
    emoji: "🔥",
    exemplos: [
      "Opinião impopular: você não precisa de audiência grande para faturar alto...",
      "Consistência é superestimada. Visibilidade estratégica bate post diário...",
      "Conteúdo de valor está matando suas vendas. Poste isso no lugar...",
      "Alcance orgânico não está morto. Seu conteúdo é que não é bom o suficiente...",
      "Ser autêntico está te custando dinheiro. A verdade que ninguém fala...",
      "Construir audiência está errado. Construa um grupo de verdadeiros fãs...",
      "O conteúdo que você tem vergonha de postar vai exatamente explodir...",
      "Seu modelo de negócio está quebrado. Aqui está a prova...",
    ],
    instrucao: "A opinião deve ser específica o suficiente para dividir opiniões inteligentes. 'Marketing digital é ruim' não funciona. 'Conteúdo de valor está matando suas vendas' divide o Time A e o Time B — o debate nos comentários é o sinal de sucesso.",
  },
  {
    id: "urgency",
    label: "Urgência e FOMO",
    desc: "Cria janela de oportunidade sensível ao tempo com reason why real",
    pat: "Mudança recente ou janela de oportunidade + consequência de não agir agora",
    col: "245,158,11",
    emoji: "⏰",
    exemplos: [
      "Essa atualização da plataforma acabou de matar 90% das estratégias...",
      "Se você não se adaptar a essa mudança, ficará obsoleto em [prazo]...",
      "A janela para [oportunidade] está se fechando mais rápido do que você pensa...",
      "Essa estratégia tem prazo de validade. Use enquanto ainda funciona...",
      "O que funcionou em [período] vai falhar em [próximo]. Aqui está o novo manual...",
      "Há uma janela de 30 dias para capitalizar nessa tendência...",
      "Três coisas que estarão obsoletas no próximo trimestre...",
      "O mercado acabou de mudar. Veja como se posicionar agora...",
    ],
    instrucao: "O reason why da urgência deve ser real e crível — mudança de algoritmo documentada, tendência verificável, prazo real. Urgência fabricada queima credibilidade permanentemente.",
  },
  {
    id: "story",
    label: "Baseado em História",
    desc: "Puxa o leitor com narrativa irresistível de personagem identificável",
    pat: "Personagem + fundo do poço (específico) + virada + resultado + lição aplicável",
    col: "168,85,247",
    emoji: "📖",
    exemplos: [
      "Meu cliente estava prestes a desistir. Mudamos uma palavra. Veja o resultado...",
      "Perdi tudo em [ano]. Reconstruí melhor em [ano]. As lições que guardei...",
      "Ela me mandou uma mensagem chorando de alegria. Isso é o que aconteceu...",
      "Riram da minha ideia de negócio. Agora me pedem conselhos...",
      "Estava com R$[valor] na conta e uma decisão para tomar. Aqui está o que fiz...",
      "Quase desisti. Aí descobri uma coisa que mudou tudo...",
      "Fui do burnout total a agenda lotada em 6 semanas. O que mudou...",
      "Eles me disseram que meu nicho estava saturado. Eu fiz mesmo assim...",
    ],
    instrucao: "O fundo do poço deve ser específico e identificável — o leitor pensa 'isso poderia ser eu'. A virada é o gancho de curiosidade implícito. O resultado é a promessa. A lição é o porquê de seguir lendo.",
  },
];

const AVATARES = [
  { id: "ugc-fem",      label: "UGC Feminino" },
  { id: "ugc-masc",     label: "UGC Masculino" },
  { id: "especialista", label: "Especialista / Doutor" },
  { id: "podcast",      label: "Formato Podcast" },
  { id: "noticia",      label: "Estilo Notícia / TV" },
  { id: "depoimento",   label: "Depoimento Puro" },
];

const ALAVANCAS = [
  ["#1","Formato + Avatar",        "Teste novos avatares e formatos mantendo a mesma copy."],
  ["#2","Gancho Visual + Escrito", "Encontre padrões no spy. Replique a estrutura invisível."],
  ["#3","Aterrissagem (Landing)",  "Pegue hooks validados da biblioteca e plugue no anúncio."],
  ["#4","Congruência",             "Identifique trechos que não fazem sentido na copy e corrija."],
  ["#5","Contexto do Avatar",      "Para avatares famosos: casamentos, filhos, polêmicas, sucessos."],
  ["#6","Disparos de Dopamina",    "Corte palavras de transição. Adicione frases de impacto."],
  ["#7","Fechamento",              "Pós-CTA: escassez com reason why + bullets + push & pull."],
];

const PILARES_ORGANICO = [
  ["Perfil = Funil",       "Antes do conteúdo, corrija o perfil. Bio clara, post fixado, proposta de valor visível."],
  ["Hook = Tudo",          "Se a primeira linha não para o scroll, o resto não importa. Hook é 80% do alcance."],
  ["Problema = Atenção",   "Poste o que as pessoas SENTEM, não o que você quer dizer. Problemas geram views."],
  ["Volume + Consistência","Mais posts = mais chances de acertar. Consistência bate perfeição todos os dias."],
  ["Comentário = Lead",    "O real valor está nos comentários. Escada de comentários = autoridade + leads."],
  ["Análise → Dobrar",     "Estude o que funcionou. Duplique. Pare de adivinhar — analise e replique."],
  ["Repurposing = Alavanca","1 ideia → 5 formatos. Reels, carrossel, post, story. Mais alcance, menos trabalho."],
];

const CAMPOS_IDENTIDADE = [
  { id:"nome",    label:"Nome ou marca",             ph:"Ex: Dr. Roberto Maia | Instituto X", rows:1 },
  { id:"nicho",   label:"Nicho / oferta",             ph:"Ex: Diabetes tipo 2, emagrecimento, marketing digital", rows:1 },
  { id:"publico", label:"Público-alvo (específico)",  ph:"Ex: homens 50+, diabéticos tipo 2, donos de negócio", rows:2 },
  { id:"tom",     label:"Tom de voz",                 ph:"Ex: especialista empático, direto, amigo que entende", rows:1 },
  { id:"cta",     label:"CTA principal",              ph:"Ex: Toque em Saiba Mais | Link na bio | Me manda DM", rows:1 },
  { id:"produto", label:"O que você vende / entrega", ph:"Ex: suplemento, VSL com quiz, mentoria, serviço", rows:1 },
];

const CAMPOS_CRIATIVO_PAGO = [
  { id:"mecanismo_solucao",  label:"Mecanismo Solução (o que cura)",      ph:"Ex: Planta egípcia que restaura a insulina em 90 pontos", rows:2 },
  { id:"mecanismo_problema", label:"Mecanismo Problema (por que falhou)", ph:"Ex: Bactéria silenciosa que aloja no pâncreas bloqueando insulina", rows:2 },
  { id:"especialista",       label:"Especialista / autoridade",            ph:"Ex: Dr. Elliot Anderson, pesquisador da Universidade de Harvard", rows:1 },
  { id:"promessa",           label:"Promessa principal",                   ph:"Ex: Estabilizar glicemia em 90 pontos quase da noite pro dia", rows:2 },
  { id:"tema",               label:"Tema ou ângulo da pauta",             ph:"Ex: revelação de planta egípcia que reverte diabetes tipo 2", rows:2 },
  { id:"angulo",             label:"Big Idea / Ângulo revelador",          ph:"Ex: a causa real do diabetes não é açúcar, é uma bactéria", rows:2 },
];

const CAMPOS_CRIATIVO_ORGANICO = [
  { id:"concorrente",        label:"Perfil / criador referência",          ph:"Ex: @perfil do concorrente ou link", rows:1 },
  { id:"conteudo_top",       label:"Seu melhor post até hoje",             ph:"Ex: quando falei sobre X tive 50k de alcance", rows:2 },
  { id:"dor_principal",      label:"Principal dor/frustração da audiência",ph:"Ex: não conseguem crescer, gastam em curso e não aplicam", rows:2 },
  { id:"resultado_organico", label:"Resultado que você entrega",           ph:"Ex: crescimento de 0 a 10k seguidores em 60 dias", rows:2 },
  { id:"tema",               label:"Tema ou ideia do conteúdo",            ph:"Ex: por que a maioria dos criadores nunca sai de 500 seguidores", rows:2 },
  { id:"angulo",             label:"Ângulo / ponto de vista",              ph:"Ex: o problema não é conteúdo, é consistência estratégica", rows:2 },
];

const CAMPOS_IMPORTANTES = ["nome","nicho","publico","tom","cta","produto"];

// ─── HOOK BLOCK BUILDER ───────────────────────────────────────────────────────

function buildHookBlock(hookCat, nicho, mecanismo) {
  const cat = HOOK_CATS.find(h => h.id === hookCat) || HOOK_CATS[3];
  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BIBLIOTECA DE HOOKS — CATEGORIA: ${cat.label.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Padrão estrutural: ${cat.pat}

Como aplicar: ${cat.instrucao}

8 exemplos de referência (adapte os colchetes para ${nicho||"seu nicho"} e ${mecanismo||"seu mecanismo"}):
${cat.exemplos.map((e,i) => `${i+1}. "${e}"`).join("\n")}

TAREFA — GERAR 5 VARIAÇÕES DE HOOK:
Usando o padrão "${cat.label}" e os exemplos acima como referência estrutural:
— Adapte completamente para o nicho, mecanismo, especialista e promessa preenchidos neste prompt
— Crie 5 variações distintas entre si — do mais agressivo ao mais suave
— Para cada variação, entregue:
  • HOOK ESCRITO (máx 15 palavras — para post, legenda ou vídeo)
  • HOOK VISUAL (máx 5 palavras — para texto na tela em vídeos)
  • POR QUE FUNCIONA (1 linha explicando o gatilho psicológico)
— Indique qual testar primeiro e por quê`;
}

// ─── PROMPTS — PAGO ──────────────────────────────────────────────────────────

function gerarPromptCarrossel({ dados, objetivo, hookCat, avatar }) {
  const avt = AVATARES.find(a => a.id === avatar) || AVATARES[0];
  const obj = OBJETIVOS.find(o => o.id === objetivo) || OBJETIVOS[2];
  const d = dados;
  const objBloco = { descoberta:"DESCOBERTA — público ainda não me conhece. Zero jargão. Gancho de curiosidade pura. NÃO mencione produto no início.", relacionamento:"RELACIONAMENTO — público me conhece mas não comprou. Aprofunde autoridade, prova social, conexão emocional. Storytelling com identificação total.", conversao:"CONVERSÃO — público quente. Vá direto ao mecanismo solução, empilhe provas e urgência. CTA com valor percebido alto e escassez com reason why real.", remarketing:"REMARKETING — público viu mas não converteu. Mude o ângulo radicalmente. Quebre a objeção número 1. Use urgência oculta e prova social diferente." }[objetivo]||"";
  return `Você é um copywriter de Direct Response no nível de Eugene Schwartz, Clayton Makepeace e Gary Halbert — especializado em criativos virais que vendem múltiplos 7 e 8 dígitos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Marca / Expert: ${d.nome||"[nome]"} | Nicho: ${d.nicho||"[nicho]"} | Público: ${d.publico||"[público]"}
Tom: ${d.tom||"[tom]"} | CTA: ${d.cta||"[CTA]"} | Produto: ${d.produto||"[produto]"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENGENHARIA DO CRIATIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mecanismo Problema: ${d.mecanismo_problema||"[por que o público falhou]"}
Mecanismo Solução: ${d.mecanismo_solucao||"[o que realmente resolve]"}
Especialista: ${d.especialista||"[nome e credencial]"} — Avatar: ${avt.label}
Promessa: ${d.promessa||"[promessa central]"} | Big Idea: ${d.angulo||"[ângulo]"} | Tema: ${d.tema||"[tema]"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO NA MANDALA OMT: ${obj.label.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${objBloco}

${buildHookBlock(hookCat, d.nicho, d.mecanismo_solucao)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRUTURA DO CARROSSEL — 8 SLIDES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Formato 4:5 vertical. Texto: 180–250 caracteres/slide. Título: 50–80 caracteres. Mostre contador.

SLIDE 1 — CAPA (use hook escrito #1 acima)
Avatar: ${avt.label}. Três blocos de texto conectados causalmente em cores diferentes (Canva). Personagem real, dado real, revelação no terceiro bloco.

SLIDE 2 — MECANISMO PROBLEMA
"${d.mecanismo_problema||"o verdadeiro culpado"}" de forma chocante. Quebre a crença popular. Linguagem conspiracionista moderada.

SLIDE 3 — AGRAVAMENTO / MEDO
Consequências do mecanismo problema não tratado. Maior medo do público. Sintomas secundários específicos. Dados reais.

SLIDE 4 — MECANISMO SOLUÇÃO
"${d.mecanismo_solucao||"a solução"}" como descoberta recente. Credencial de ${d.especialista||"especialista"}. Nome/apelido curioso para o mecanismo.

SLIDE 5 — PROVA EMPILHADA
3 tipos: científica + social + autoridade. Números específicos. Depoimento antes/depois.

SLIDE 6 — BENEFÍCIOS EXPANDIDOS
Resultado principal + 3 benefícios secundários inesperados. Técnica Benefício 2: além de X, também Y, Z e W.

SLIDE 7 — URGÊNCIA / ESCASSEZ
Urgência com reason why real. Conspiração da indústria? Escassez de vagas/tempo. Bullets de curiosidade pós-CTA.

SLIDE 8 — CTA COM VALOR
[Quanto custava antes] + [Por que está acessível agora] + [Por quanto tempo] + [CTA: "${d.cta||"toque em Saiba Mais"}"] + [Push & pull final]

REGRAS ABSOLUTAS: ZERO travessões — – - • ZERO bullets nos slides • ZERO linguagem de IA • ZERO superlativos vazios • texto corrido humano • lido em 5s no celular • disparadores de dopamina.

OUTPUT: análise editorial (3 portões) + nome curioso do mecanismo + 5 hooks ranqueados + 8 slides completos + legenda (contexto extra + CTA + debate + 5 hashtags).`;
}

function gerarPromptPost({ dados, objetivo, hookCat, avatar }) {
  const avt = AVATARES.find(a => a.id === avatar) || AVATARES[0];
  const obj = OBJETIVOS.find(o => o.id === objetivo) || OBJETIVOS[2];
  const d = dados;
  return `Você é um copywriter de Direct Response especializado em posts de alta conversão para Instagram e Facebook.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Expert: ${d.nome||"[nome]"} | Nicho: ${d.nicho||"[nicho]"} | Público: ${d.publico||"[público]"}
Tom: ${d.tom||"[tom]"} | Produto: ${d.produto||"[produto]"} | Promessa: ${d.promessa||"[promessa]"}
Objetivo: ${obj.label} | Avatar: ${avt.label}

${buildHookBlock(hookCat, d.nicho, d.mecanismo_solucao)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRUTURA DO POST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMAGEM: prompt cinematográfico para ${avt.label}, pessoas reais. ARRI ALEXA 65, 50mm, f/1.4. Film grain. NO TEXT NO WATERMARKS.
PRIMEIRA LINHA: use hook escrito #1. Máx 10 palavras. Para antes do "ver mais".
[QUALIFICAÇÃO] — sintomas que só quem tem o problema reconhece em ${d.publico||"o público"}
[MECANISMO PROBLEMA] — "${d.mecanismo_problema||"[causa raiz]"}". Quebre a crença anterior.
[FRASE VIRAL] — uma linha que vai para o print. Contradiz o senso comum.
[MECANISMO SOLUÇÃO] — "${d.mecanismo_solucao||"[solução]"}". Apelido curioso. Credencial: ${d.especialista||"[especialista]"}.
[PROVA EMPILHADA] — científica + depoimento + dado numérico.
[BENEFÍCIOS EXPANDIDOS] — resultado + benefícios secundários inesperados.
[URGÊNCIA] — reason why real para agir agora.
[CTA COM VALOR] — "${d.cta||"[CTA]"}" + quanto valia + por que acessível + bullets de curiosidade + segundo CTA.
REGRAS: frases curtas • parágrafos 1–2 linhas • zero transições longas • linguagem humana real.
OUTPUT: 5 hooks ranqueados + prompt de imagem + post completo.`;
}

function gerarPromptReel({ dados, hookCat, avatar }) {
  const avt = AVATARES.find(a => a.id === avatar) || AVATARES[0];
  const d = dados;
  return `Você é um roteirista de Reels e vídeos de Direct Response — UGC que parece orgânico mas converte como anúncio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nicho: ${d.nicho||"[nicho]"} | Público: ${d.publico||"[público]"}
Mec. Problema: ${d.mecanismo_problema||"[causa raiz]"} | Mec. Solução: ${d.mecanismo_solucao||"[solução]"}
Avatar: ${d.especialista||"[nome]"} — Formato: ${avt.label}
Promessa: ${d.promessa||"[promessa]"} | CTA: ${d.cta||"[CTA]"}

${buildHookBlock(hookCat, d.nicho, d.mecanismo_solucao)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GANCHO VISUAL — PRIMEIROS 3 SEGUNDOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use hook visual #1 acima. Para cada uma das 3 opções: ação do avatar + texto sobreposto (máx 5 palavras) + por que para o scroll sem som.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCRIPT — 30 a 60 segundos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0s–3s] GANCHO FALADO — palavra-chave do nicho nos 2 primeiros segundos.
[3s–8s] QUALIFICAÇÃO — sintomas que só quem tem o problema reconhece.
[8s–18s] MECANISMO PROBLEMA — quebre a crença anterior de forma chocante.
[18s–32s] MECANISMO SOLUÇÃO — apelido curioso + credencial + linguagem simples e visual.
[32s–44s] PROVA — depoimento ou dado + benefícios expandidos.
[44s–52s] URGÊNCIA — reason why real. Conspiração moderada se for saúde/finanças.
[52s–60s] CTA DUPLO — "${d.cta||"[CTA]"}" + micro-pausa + bullets de curiosidade + segundo CTA + push & pull.

Instruções de edição: cortes a cada 2–3s • texto na tela em pontos-chave • b-roll por bloco • tipo de música por seção.
OUTPUT: 5 hooks ranqueados + 3 ganchos visuais + script completo + instruções de edição + prompt de thumbnail.`;
}

function gerarPromptStory({ dados, hookCat, avatar }) {
  const avt = AVATARES.find(a => a.id === avatar) || AVATARES[0];
  const d = dados;
  return `Você é um estrategista de Stories que cria sequências de 7 cards com 80%+ de retenção.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nicho: ${d.nicho||"[nicho]"} | Público: ${d.publico||"[público]"} | Avatar: ${avt.label}
Mec. Solução: ${d.mecanismo_solucao||"[solução]"} | Especialista: ${d.especialista||"[expert]"}
Promessa: ${d.promessa||"[promessa]"} | CTA: ${d.cta||"[CTA]"}

${buildHookBlock(hookCat, d.nicho, d.mecanismo_solucao)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7 STORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cada story: VISUAL • TEXTO SOBREPOSTO (máx 15 palavras) • ELEMENTO INTERATIVO • MOTIVO para avançar.

S1 — GANCHO: use hook visual #1. Loop aberto imediato. A pessoa deve sentir que perderá algo.
S2 — AGRAVAMENTO: sintoma específico + estatística. Enquete: "Você sente isso? SIM/NÃO"
S3 — REVELAÇÃO PARCIAL: comece "${d.mecanismo_problema||"[causa raiz]"}". Cliffhanger.
S4 — MECANISMO SOLUÇÃO: "${d.mecanismo_solucao||"[solução]"}". Credencial. Quiz: "Você sabia? SIM/NÃO"
S5 — PROVA: resultado + depoimento + credencial científica. Slider de concordância.
S6 — URGÊNCIA: reason why. Escassez. Contador visual.
S7 — CTA: "${d.cta||"[CTA]"}". ${avt.label} olhando para câmera. Um botão, uma ação, zero alternativas.

OUTPUT: 5 hooks ranqueados + 7 cards completos + 3 variações de abertura para A/B.`;
}

// ─── PROMPTS — ORGÂNICO ───────────────────────────────────────────────────────

function gerarPromptOrganico({ dados, formatoOrganico, hookCat }) {
  const d = dados;
  const ident = `Nicho: ${d.nicho||"[nicho]"} | Público: ${d.publico||"[público]"} | Tom: ${d.tom||"[tom]"}`;
  const hk = buildHookBlock(hookCat, d.nicho, d.resultado_organico);
  const catLabel = HOOK_CATS.find(h=>h.id===hookCat)?.label||"Dor Direta";

  const G = {
    "viral-post": `Você é um estrategista de conteúdo viral para Facebook e Instagram.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ident} | Resultado: ${d.resultado_organico||"[resultado]"}
Tema: ${d.tema||"[tema]"} | Ângulo: ${d.angulo||"[ângulo]"}

${hk}

ESTRUTURA DO POST VIRAL:
[LINHA 1 — HOOK] use hook escrito #1. Máx 10 palavras.
[CORPO] Ponto de identificação → Insight revelador → Aplicação prática → Consequência de não aplicar.
[CTA DE ENGAJAMENTO] Pergunta que divide opiniões. Termine: "Manda pra alguém que precisa ver isso."
REGRAS: especialista falando para amigo • frases curtas • zero bullets • zero linguagem de IA • Máx 5 hashtags minúsculas.
OUTPUT: 5 hooks ranqueados + post completo + pergunta de engajamento + sugestão de visual.`,

    "profile-audit": `Você é um estrategista de redes sociais especializado em perfis que convertem.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS DO PERFIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${d.nome||"[nome]"} | ${ident} | Produto: ${d.produto||"[produto]"} | CTA: ${d.cta||"[CTA]"}
[DESCREVA SEU PERFIL ATUAL AQUI]

${hk}

[1. DIAGNÓSTICO] pontos fracos, o que está confuso, o que sabota conversão
[2. BIO REESCRITA] nicho claro + proposta de valor + prova de autoridade + CTA: "${d.cta||"[CTA]"}"
[3. POST FIXADO] 3 ideias: tema + estrutura + por que converte — usando padrão "${catLabel}"
[4. ESTRATÉGIA] foto, capa, destaques e orientações gerais
OUTPUT: diagnóstico + bio reescrita + 3 ideias de post fixado + checklist de otimização.`,

    "calendario": `Você é um planejador de conteúdo especializado em calendários editoriais de 30 dias.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ident} | Produto: ${d.produto||"[produto]"} | CTA: ${d.cta||"[CTA]"} | Resultado: ${d.resultado_organico||"[resultado]"}

${hk}

Mix estratégico: 40% Educação • 30% Engajamento • 20% Prova Social • 10% Oferta
Hooks da categoria "${catLabel}" em todos os posts de maior impacto.

SEMANA 1 (dias 1–7) — AUTORIDADE: 7 posts com dia + tipo + hook + CTA
SEMANA 2 (dias 8–14) — ENGAJAMENTO: 7 posts com hook + formato + CTA
SEMANA 3 (dias 15–21) — PROVA SOCIAL: 7 posts com storytelling e before/after
SEMANA 4 (dias 22–30) — CONVERSÃO: 9 posts com CTAs progressivamente mais diretos
Formato: TEMA | GANCHO | FORMATO | CTA SUGERIDO
Final: 5 temas evergreen reutilizáveis a qualquer momento.`,

    "escada": `Você é um especialista em geração de leads por comentários estratégicos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ident} | Produto: ${d.produto||"[produto]"} | CTA: ${d.cta||"[CTA]"} | Tema: ${d.tema||"[tema]"}

${hk}

ESCADA DE 7 COMENTÁRIOS:
#1 PRIMEIRO VALOR — ensina algo útil. Zero venda.
#2 APROFUNDAMENTO — insight com dado ou número específico.
#3 HISTÓRIA / PROVA — caso real. Antes → depois.
#4 QUEBRA DE OBJEÇÃO — antecipa a principal dúvida. Responde com autoridade.
#5 VALOR + ENGAJAMENTO — mais insight + pergunta que gera respostas.
#6 AUTORIDADE + CURIOSIDADE — menciona o método sem vender diretamente.
#7 CTA NATURAL — "${d.cta||"[CTA]"}" de forma contextual, não forçada.
Para cada comentário: TEXTO COMPLETO + TIMING + GATILHO PSICOLÓGICO.
OUTPUT: 5 hooks ranqueados + 7 comentários prontos + variações de CTA final.`,

    "repurpose": `Você é um especialista em repurposing — 1 ideia em múltiplos formatos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ident}
Conteúdo original: ${d.conteudo_top||"[descreva ou cole o conteúdo aqui]"}

${hk}

MOTOR DE REPURPOSING — 1 IDEIA → 5 FORMATOS:
F1 — REEL/TIKTOK (30–60s): script + gancho visual + timing + edição.
F2 — CARROSSEL INSTAGRAM (6–8 slides): capa + slides (180–250 chars) + CTA.
F3 — POST LONGO FACEBOOK: hook + corpo + pergunta de engajamento + CTA.
F4 — STORY SEQUÊNCIA (5 cards): enquetes + revelação progressiva + CTA.
F5 — 10 VARIAÇÕES DE HOOK: uma em cada categoria das 8 categorias de hooks.
Para cada formato: estrutura completa + instrução de adaptação + CTA.`,

    "autoridade": `Você é um estrategista de posicionamento de autoridade digital.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${d.nome||"[nome]"} | ${ident} | Produto: ${d.produto||"[produto]"} | Resultado: ${d.resultado_organico||"[resultado]"}

${hk}

[1. 10 IDEIAS DE AUTORIDADE] insights que contradizem o consenso, frameworks exclusivos, opiniões fortes, dados que ninguém faz. Para cada: tema + hook categoria "${catLabel}" + por que posiciona como autoridade.
[2. FRAMEWORK EXCLUSIVO] nome próprio + 3–5 passos + como explicar em um post.
[3. 5 HOT TAKES] opiniões contrarians específicas que dividem opiniões. Declaração + justificativa + post.
[4. 3 SÉRIES BINGE] tema + 5 episódios + reason why para cada série.
OUTPUT: 10 ideias + framework exclusivo + 5 hot takes + 3 séries.`,

    "gap": `Você é um analista de conteúdo especializado em lacunas virais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ident} | Produto: ${d.produto||"[produto]"}
Referência: ${d.conteudo_top||"[melhores posts do nicho]"}

${hk}

CONTENT GAP KILLER — 10 LACUNAS VIRAIS:
Para cada: 1. TÓPICO (o que ninguém fala) 2. POR QUE VIRA (razão psicológica) 3. HOOK categoria "${catLabel}" 4. FORMATO IDEAL 5. TIMING (por que funciona agora)
Final: ranking dos 3 com maior potencial de viralização NOW e por quê.`,

    "psicologia": `Você é um especialista em psicologia do consumidor e comportamento de audiência.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ident} | Produto: ${d.produto||"[produto]"} | Dor principal: ${d.dor_principal||"[frustração]"}

${hk}

[1. MAPA DE CONSCIÊNCIA] medos • desejos profundos • frustrações • crenças bloqueadoras • identidade.
[2. 10 GATILHOS DE SCROLL] tipos de conteúdo que param esse público + trigger psicológico + hook categoria "${catLabel}" para cada.
[3. 15 PROBLEMAS → 15 POSTS] os 15 problemas mais sentidos → ideia de post prático para cada.
[4. DICIONÁRIO DE LINGUAGEM] palavras, expressões e gírias exatas que o público usa. Essas vão nos hooks.
[5. 5 QUEBRAS DE OBJEÇÃO] as 5 objeções que impedem a compra + como destruir com conteúdo orgânico.
OUTPUT: mapa de consciência + 10 gatilhos + 15 ideias + dicionário + 5 quebras de objeção.`,

    "growth-sprint": `Você é um estrategista de crescimento orgânico especializado em sprints de 30 dias.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${d.nome||"[nome]"} | ${ident} | Produto: ${d.produto||"[produto]"} | CTA: ${d.cta||"[CTA]"}
[DESCREVA SUA META E SITUAÇÃO ATUAL]

${hk}

GROWTH SPRINT — 30 DIAS:
S1 (1–7) FUNDAÇÃO: checklist de perfil + 7 posts de impacto com hooks categoria "${catLabel}" + meta para validar.
S2 (8–14) VOLUME E TESTE: 7 posts em formatos variados + 3 hooks diferentes por tema + identificação de padrões.
S3 (15–21) DOBRAR O QUE FUNCIONA: variações dos posts com melhor performance + escada de comentários + CTA direto.
S4 (22–30) CONVERSÃO: posts de oferta + prova social + repurposing + análise final.
Para cada semana: lista diária de ações + métricas + critérios de decisão.`,

    "reverse": `Você é um analista de crescimento especializado em engenharia reversa.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Meu nicho: ${d.nicho||"[nicho]"} | Meu público: ${d.publico||"[público]"}
Conta para analisar: ${d.concorrente||"[perfil ou link]"} | Resultado: ${d.resultado_organico||"[resultado]"}

${hk}

[1. ANÁLISE] categorias de hook usadas (Quebra de Padrão, Lacuna de Curiosidade, Autoridade, Dor Direta, Transformação, Hot Take, Urgência, História) • formato predominante • frequência • tom • 3 posts mais engajados e por quê.
[2. GATILHOS PSICOLÓGICOS] 5 principais triggers para parar o scroll, gerar comentários e shares.
[3. PADRÕES INVISÍVEIS] estrutura de frase, timing de CTA, uso de perguntas, controvérsia moderada.
[4. GAPS] o que esse criador NÃO faz que eu posso fazer para me diferenciar no mesmo público.
[5. 10 IDEIAS ADAPTADAS] inspiradas nos padrões, adaptadas para ${d.nicho||"[nicho]"}. Hook categoria "${catLabel}" + formato + por que vai funcionar.
OUTPUT: análise completa + padrões + 10 ideias adaptadas.`,
  };

  return G[formatoOrganico] || G["viral-post"];
}

// ─── DISPATCHER ──────────────────────────────────────────────────────────────

function gerarPrompt(state) {
  if (state.canal === "organico") return gerarPromptOrganico(state);
  if (state.formato === "carrossel") return gerarPromptCarrossel(state);
  if (state.formato === "post")      return gerarPromptPost(state);
  if (state.formato === "reel")      return gerarPromptReel(state);
  return gerarPromptStory(state);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const GC = { amber:"245,158,11", sky:"56,189,248", green:"34,197,94", red:"239,68,68", purple:"168,85,247" };

const s = {
  root:    { fontFamily:"'Segoe UI',system-ui,sans-serif", background:"linear-gradient(170deg,#03030a 0%,#080e1a 40%,#050810 100%)", color:"#d1d5db", minHeight:"100vh" },
  header:  { background:"linear-gradient(90deg,rgba(245,158,11,.12),rgba(245,158,11,.04))", borderBottom:"1px solid rgba(245,158,11,.2)", padding:"20px 24px" },
  inner:   { maxWidth:900, margin:"0 auto" },
  title:   { fontSize:20, fontWeight:900, color:"#fff", margin:"0 0 4px", letterSpacing:-0.4 },
  sub:     { fontSize:12, color:"#6b7280", margin:0 },
  badges:  { display:"flex", gap:6, flexWrap:"wrap", marginTop:10 },
  badge:   (a) => ({ fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:20, background:a?"rgba(245,158,11,.12)":"rgba(255,255,255,.05)", color:a?"#f59e0b":"#6b7280", border:a?"1px solid rgba(245,158,11,.25)":"1px solid rgba(255,255,255,.07)", textTransform:"uppercase", letterSpacing:0.9 }),
  tabBar:  { background:"rgba(3,3,10,.98)", borderBottom:"1px solid rgba(255,255,255,.05)", position:"sticky", top:0, zIndex:20, padding:"0 24px" },
  tabInner:{ maxWidth:900, margin:"0 auto", display:"flex" },
  tab:     (act,col) => ({ padding:"12px 16px", background:act?`rgba(${col||GC.amber},.06)`:"transparent", border:"none", borderBottom:act?`2px solid rgb(${col||GC.amber})`:"2px solid transparent", color:act?`rgb(${col||GC.amber})`:"#6b7280", cursor:"pointer", fontSize:12, fontWeight:act?700:400, fontFamily:"inherit", transition:"all .15s", whiteSpace:"nowrap" }),
  content: { maxWidth:900, margin:"0 auto", padding:"20px 20px 60px" },
  card:    (col) => ({ background:"rgba(255,255,255,.015)", border:`1px solid rgba(${col||"255,255,255"},.08)`, borderRadius:12, padding:16, marginBottom:12 }),
  secLabel:(col) => ({ fontSize:10, fontWeight:700, letterSpacing:0.9, color:`rgb(${col||GC.amber})`, marginBottom:4, textTransform:"uppercase" }),
  secHint: { fontSize:11, color:"#6b7280", marginBottom:14 },
  lbl:     { fontSize:11, color:"#9ca3af", marginBottom:5, display:"block", fontWeight:600 },
  inp:     { width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", color:"#e5e7eb", fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box", resize:"none" },
  grid2:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  sel:     (act,col) => ({ border:act?`1px solid rgba(${col||GC.amber},.6)`:"1px solid rgba(255,255,255,.07)", borderRadius:8, padding:"10px 12px", cursor:"pointer", background:act?`rgba(${col||GC.amber},.08)`:"rgba(255,255,255,.02)", transition:"all .15s" }),
  selT:    (act,col) => ({ fontSize:12, fontWeight:600, color:act?`rgb(${col||GC.amber})`:"#e5e7eb" }),
  selS:    { fontSize:10, color:"#6b7280", marginTop:2, lineHeight:1.4 },
  hcat:    (act,col) => ({ border:act?`1px solid rgba(${col},.6)`:"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"12px 14px", cursor:"pointer", background:act?`rgba(${col},.1)`:"rgba(255,255,255,.02)", transition:"all .15s", marginBottom:0 }),
  hcatH:   { display:"flex", alignItems:"center", gap:8, marginBottom:6 },
  hcatN:   (act,col) => ({ fontSize:12, fontWeight:700, color:act?`rgb(${col})`:"#e5e7eb", flex:1 }),
  hcatD:   { fontSize:10, color:"#9ca3af", lineHeight:1.5 },
  hcatP:   { fontSize:10, color:"#6b7280", fontStyle:"italic", marginBottom:6, lineHeight:1.5, borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:6 },
  hcatEx:  { fontSize:10, color:"#c9d1d9", padding:"3px 0", borderTop:"1px solid rgba(255,255,255,.05)", lineHeight:1.5 },
  hcatI:   (col) => ({ fontSize:10, color:`rgba(${col},.9)`, marginTop:8, padding:"6px 8px", background:`rgba(${col},.08)`, borderRadius:6, lineHeight:1.5 }),
  pill:    (act,col) => ({ fontSize:9, padding:"3px 8px", borderRadius:12, cursor:"pointer", background:act?`rgba(${col},.2)`:"rgba(255,255,255,.04)", color:act?`rgb(${col})`:"#6b7280", border:act?`1px solid rgba(${col},.4)`:"1px solid rgba(255,255,255,.06)", transition:"all .15s" }),
  prog:    { height:5, background:"rgba(255,255,255,.06)", borderRadius:3, overflow:"hidden", marginBottom:4 },
  progF:   (p) => ({ height:"100%", borderRadius:3, background:p===100?"linear-gradient(90deg,#22c55e,#f59e0b)":"linear-gradient(90deg,#f59e0b,#ef4444)", width:`${p}%`, transition:"width .3s" }),
  progI:   { display:"flex", justifyContent:"space-between", fontSize:10, color:"#6b7280" },
  btnMain: (col) => ({ width:"100%", padding:"13px 0", background:`linear-gradient(90deg,rgba(${col||GC.amber},.15),rgba(${col||GC.amber},.08))`, border:`1px solid rgba(${col||GC.amber},.3)`, borderRadius:10, color:`rgb(${col||GC.amber})`, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.4, transition:"all .15s", marginTop:4 }),
  btnCopy: (ok) => ({ padding:"8px 20px", background:ok?"rgba(34,197,94,.1)":"rgba(255,255,255,.04)", border:ok?"1px solid rgba(34,197,94,.3)":"1px solid rgba(255,255,255,.1)", borderRadius:8, color:ok?"#22c55e":"#9ca3af", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", transition:"all .2s" }),
  pBox:    { background:"rgba(0,0,0,.45)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:20, fontSize:11.5, color:"#c9d1d9", lineHeight:1.9, whiteSpace:"pre-wrap", fontFamily:"monospace", maxHeight:600, overflowY:"auto" },
  tip:     { marginTop:12, padding:"10px 14px", background:"rgba(245,158,11,.05)", border:"1px solid rgba(245,158,11,.12)", borderRadius:8, fontSize:11, color:"#d97706", lineHeight:1.7 },
  alav:    { display:"flex", gap:10, alignItems:"flex-start", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.05)" },
  alavN:   (col) => ({ fontSize:10, fontWeight:700, color:`rgb(${col||GC.amber})`, minWidth:26, paddingTop:1 }),
  alavT:   { fontSize:11, fontWeight:700, color:"#e5e7eb", display:"block", marginBottom:2 },
  alavD:   { fontSize:11, color:"#6b7280", lineHeight:1.5 },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function PromptMasterAds() {
  const [aba,   setAba]   = useState("identidade");
  const [canal, setCanal] = useState("pago");
  const [fmt,   setFmt]   = useState("carrossel");
  const [fmtO,  setFmtO]  = useState("viral-post");
  const [obj,   setObj]   = useState("conversao");
  const [hcat,  setHcat]  = useState("pain-point");
  const [avt,   setAvt]   = useState("ugc-fem");
  const [dados, setDados] = useState({});
  const [copiado, setCop] = useState(false);

  const upd   = (k,v) => setDados(p => ({ ...p, [k]:v }));
  const state = { dados, canal, formato:fmt, formatoOrganico:fmtO, objetivo:obj, hookCat:hcat, avatar:avt };
  const pct   = Math.round(CAMPOS_IMPORTANTES.filter(k=>dados[k]?.trim()).length/CAMPOS_IMPORTANTES.length*100);
  const isOrg = canal === "organico";
  const acc   = isOrg ? GC.sky : GC.amber;
  const catAtual = HOOK_CATS.find(h=>h.id===hcat)||HOOK_CATS[3];

  const TABS = [
    { id:"identidade", label:"⚙ Identidade" },
    { id:"estrategia", label:"🎯 Estratégia" },
    { id:"criativo",   label:"🧠 Criativo" },
    { id:"prompt",     label:"📋 Prompt" },
  ];
  const NEXT = { identidade:"estrategia", estrategia:"criativo", criativo:"prompt" };

  const copiar = () => {
    navigator.clipboard.writeText(gerarPrompt(state)).then(()=>{ setCop(true); setTimeout(()=>setCop(false),2500); });
  };

  const renderIdentidade = () => (
    <>
      <div style={s.card()}>
        <div style={s.secLabel(acc)}>Progresso</div>
        <div style={s.prog}><div style={s.progF(pct)}/></div>
        <div style={s.progI}><span>{pct}% preenchido</span><span>{pct===100?"Pronto para gerar":"Continue preenchendo"}</span></div>
      </div>
      <div style={s.card()}>
        <div style={s.secLabel(acc)}>Canal de Distribuição</div>
        <div style={s.secHint}>Define toda a lógica e estrutura do prompt gerado.</div>
        <div style={s.grid2}>
          {CANAIS.map(c=>(
            <div key={c.id} onClick={()=>setCanal(c.id)} style={s.sel(canal===c.id, c.id==="organico"?GC.sky:GC.amber)}>
              <div style={s.selT(canal===c.id, c.id==="organico"?GC.sky:GC.amber)}>{c.label}</div>
              <div style={s.selS}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={s.card()}>
        <div style={s.secLabel(acc)}>Módulo 1 — Identidade</div>
        <div style={s.secHint}>Os dados que personalizam todo o prompt gerado.</div>
        {CAMPOS_IDENTIDADE.map(c=>(
          <div key={c.id} style={{marginBottom:12}}>
            <label style={s.lbl}>{c.label}</label>
            <textarea rows={c.rows} placeholder={c.ph} value={dados[c.id]||""} onChange={e=>upd(c.id,e.target.value)} style={s.inp}/>
          </div>
        ))}
      </div>
    </>
  );

  const renderEstrategia = () => (
    <>
      {!isOrg ? (
        <>
          <div style={s.card()}>
            <div style={s.secLabel(acc)}>Formato do Criativo</div>
            <div style={s.secHint}>Define a estrutura completa do prompt.</div>
            <div style={s.grid2}>
              {FORMATOS_PAGO.map(f=>(
                <div key={f.id} onClick={()=>setFmt(f.id)} style={s.sel(fmt===f.id,GC.amber)}>
                  <div style={s.selT(fmt===f.id,GC.amber)}>{f.label}</div>
                  <div style={s.selS}>{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card()}>
            <div style={s.secLabel(acc)}>Objetivo na Mandala OMT</div>
            <div style={s.secHint}>Descoberta → Relacionamento → Conversão → Remarketing</div>
            <div style={s.grid2}>
              {OBJETIVOS.map(o=>(
                <div key={o.id} onClick={()=>setObj(o.id)} style={s.sel(obj===o.id,o.cor)}>
                  <div style={s.selT(obj===o.id,o.cor)}>{o.label}</div>
                  <div style={s.selS}>{o.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card()}>
            <div style={s.secLabel(acc)}>Avatar / Formato de Apresentação</div>
            <div style={s.secHint}>Quem aparece ou fala no criativo pago.</div>
            <div style={s.grid2}>
              {AVATARES.map(a=>(
                <div key={a.id} onClick={()=>setAvt(a.id)} style={s.sel(avt===a.id,GC.amber)}>
                  <div style={s.selT(avt===a.id,GC.amber)}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={s.card(GC.sky)}>
            <div style={s.secLabel(GC.sky)}>Estratégia de Crescimento Orgânico</div>
            <div style={s.secHint}>Selecione o tipo de prompt a gerar.</div>
            <div style={s.grid2}>
              {FORMATOS_ORGANICO.map(f=>(
                <div key={f.id} onClick={()=>setFmtO(f.id)} style={s.sel(fmtO===f.id,GC.sky)}>
                  <div style={s.selT(fmtO===f.id,GC.sky)}>{f.label}</div>
                  <div style={s.selS}>{f.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card(GC.sky)}>
            <div style={s.secLabel(GC.sky)}>7 Pilares do Crescimento Orgânico</div>
            <div style={s.secHint}>Frameworks dos maiores criadores de Facebook e Instagram.</div>
            {PILARES_ORGANICO.map(([t,d],i)=>(
              <div key={i} style={{...s.alav,...(i===PILARES_ORGANICO.length-1?{borderBottom:"none"}:{})}}>
                <div style={s.alavN(GC.sky)}>P{i+1}</div>
                <div><span style={{...s.alavT,color:"#38bdf8"}}>{t}</span><span style={s.alavD}>{d}</span></div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  const renderCriativo = () => {
    const campos = isOrg ? CAMPOS_CRIATIVO_ORGANICO : CAMPOS_CRIATIVO_PAGO;
    return (
      <>
        {/* HOOK CATEGORY SELECTOR */}
        <div style={s.card(acc)}>
          <div style={s.secLabel(acc)}>Biblioteca de 100 Hooks — 8 Categorias Validadas</div>
          <div style={{...s.secHint, marginBottom:12}}>
            100 hooks testados por Daniel Chou + Direct Response de 7–8 dígitos. A categoria escolhida gera 5 variações de hook com padrão estrutural, 8 exemplos de referência e instrução de aplicação dentro do prompt.
          </div>
          <div style={s.grid2}>
            {HOOK_CATS.map(cat=>{
              const act = hcat===cat.id;
              return (
                <div key={cat.id} onClick={()=>setHcat(cat.id)} style={s.hcat(act,cat.col)}>
                  <div style={s.hcatH}>
                    <span style={{fontSize:14}}>{cat.emoji}</span>
                    <span style={s.hcatN(act,cat.col)}>{cat.label}</span>
                    {act && <span style={{fontSize:9,padding:"2px 6px",borderRadius:10,background:`rgba(${cat.col},.2)`,color:`rgb(${cat.col})`}}>ATIVO</span>}
                  </div>
                  <div style={s.hcatD}>{cat.desc}</div>
                  {act && (
                    <>
                      <div style={s.hcatP}>Padrão: {cat.pat}</div>
                      <div style={{fontSize:9,fontWeight:700,color:`rgb(${cat.col})`,letterSpacing:0.7,marginBottom:4,textTransform:"uppercase"}}>8 Exemplos de referência</div>
                      {cat.exemplos.map((ex,i)=>(
                        <div key={i} style={s.hcatEx}><span style={{color:"#6b7280",marginRight:4}}>{i+1}.</span>{ex}</div>
                      ))}
                      <div style={s.hcatI(cat.col)}>{cat.instrucao}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {/* Quick pills */}
          <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
            {HOOK_CATS.map(c=>(
              <span key={c.id} onClick={()=>setHcat(c.id)} style={s.pill(hcat===c.id,c.col)}>
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* CAMPOS */}
        <div style={s.card()}>
          <div style={s.secLabel(acc)}>Módulo 2 — {isOrg?"Dados do Conteúdo Orgânico":"Engenharia do Criativo"}</div>
          <div style={s.secHint}>{isOrg?"Quanto mais específico, mais personalizado fica o prompt.":"Mecanismo, promessa e Big Idea — o coração do anúncio."}</div>
          {campos.map(c=>(
            <div key={c.id} style={{marginBottom:12}}>
              <label style={s.lbl}>{c.label}</label>
              <textarea rows={c.rows} placeholder={c.ph} value={dados[c.id]||""} onChange={e=>upd(c.id,e.target.value)} style={s.inp}/>
            </div>
          ))}
        </div>

        {/* ALAVANCAS / PILARES */}
        <div style={s.card()}>
          <div style={s.secLabel(acc)}>{isOrg?"7 Pilares do Crescimento Orgânico":"7 Alavancas para Bater o Controle"}</div>
          <div style={s.secHint}>{isOrg?"Valide cada conteúdo antes de postar.":"Use após ter o prompt base gerado."}</div>
          {(isOrg?PILARES_ORGANICO:ALAVANCAS).map(([n,t,d],i,arr)=>(
            <div key={i} style={{...s.alav,...(i===arr.length-1?{borderBottom:"none"}:{})}}>
              <div style={s.alavN(isOrg?GC.sky:GC.amber)}>{isOrg?`P${i+1}`:n}</div>
              <div><span style={s.alavT}>{t}</span><span style={s.alavD}>{d}</span></div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderPrompt = () => {
    const fLabel = isOrg ? (FORMATOS_ORGANICO.find(f=>f.id===fmtO)?.label||"Orgânico") : (FORMATOS_PAGO.find(f=>f.id===fmt)?.label||"Criativo");
    return (
      <>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>
              Prompt Gerado — {fLabel}
              <span style={{fontSize:10,fontWeight:400,color:isOrg?"#38bdf8":"#f59e0b",marginLeft:8,textTransform:"uppercase",letterSpacing:0.8}}>{isOrg?"Orgânico":"Tráfego Pago"}</span>
              <span style={{fontSize:10,fontWeight:400,color:`rgb(${catAtual.col})`,marginLeft:8}}>{catAtual.emoji} {catAtual.label}</span>
            </div>
            <div style={{fontSize:11,color:"#6b7280"}}>Cole em qualquer IA: Claude, ChatGPT, Gemini</div>
          </div>
          <button onClick={copiar} style={s.btnCopy(copiado)}>{copiado?"✓ Copiado!":"Copiar Prompt"}</button>
        </div>
        <div style={s.pBox}>{gerarPrompt(state)}</div>
        <div style={s.tip}>
          Cole esse prompt no início de uma conversa nova. Depois: <strong>"Agora crie o {fLabel.toLowerCase()} sobre [tema específico]."</strong>
          {!isOrg && <><br/>Para modelar concorrentes: <strong>"Agora faça a mesma coisa nesse anúncio: [cole o anúncio]"</strong></>}
          {isOrg  && <><br/>Para repurposing: <strong>"Agora adapte esse conteúdo para Reels, carrossel e story."</strong></>}
        </div>
      </>
    );
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={s.inner}>
          <div style={s.badges}>
            {[["Prompt Master Ads",true],["100 Hooks Virais",true],["8 Categorias",true],["Direct Response",false],["Mandala OMT",false],["7 Alavancas",false],["Crescimento Orgânico",false],["Spy + Modelagem",false]].map(([t,a])=>(
              <span key={t} style={s.badge(a)}>{t}</span>
            ))}
          </div>
          <h1 style={s.title}>Prompt Master Ads</h1>
          <p style={s.sub}>Tráfego Pago · Orgânico · 100 Hooks Virais em 8 Categorias · Carrossel · Post · Reel · Story · 10 Estratégias de Crescimento</p>
        </div>
      </div>

      <div style={s.tabBar}>
        <div style={s.tabInner}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setAba(t.id)} style={s.tab(aba===t.id,acc)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={s.content}>
        {aba==="identidade" && renderIdentidade()}
        {aba==="estrategia" && renderEstrategia()}
        {aba==="criativo"   && renderCriativo()}
        {aba==="prompt"     && renderPrompt()}

        {aba!=="prompt" && (
          <button onClick={()=>setAba(NEXT[aba])} style={s.btnMain(acc)}>
            {aba==="identidade"?"Próximo: Estratégia →":aba==="estrategia"?"Próximo: Criativo →":"Ver Prompt Gerado →"}
          </button>
        )}

        <div style={{textAlign:"center",marginTop:24,fontSize:10,color:"#374151"}}>
          PROMPT MASTER ADS · 100 HOOKS · 8 CATEGORIAS · TRÁFEGO PAGO + ORGÂNICO · MANDALA OMT · 7 ALAVANCAS
        </div>
      </div>
    </div>
  );
}
