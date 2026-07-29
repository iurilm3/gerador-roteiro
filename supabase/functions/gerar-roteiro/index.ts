// Edge Function: gerar-roteiro
// Recebe os parâmetros do formulário /gerar, monta um prompt rico a
// partir das referências de copywriting do projeto e chama a API do
// Gemini — tudo dentro do servidor Supabase.
//
// Segurança:
// · verify_jwt = true (padrão no painel) — rejeita qualquer pedido sem
//   login válido antes de executar qualquer linha de código
// · GEMINI_API_KEY lida via Deno.env.get — nunca sai do servidor,
//   nunca trafega para o navegador
// · CORS restrito ao domínio de produção
// · Rate limit: 20 tentativas/hora por usuário, contadas na tabela
//   geracoes_log (sobrevive a reinício de servidor)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Dados da Matriz de Ângulos ───────────────────────────────────────────────
// Copiado de lib/matriz.ts — a função precisa ser um arquivo único e
// independente para ser colada no painel do Supabase sem dependências externas.
const SUBTEMAS: Record<string, { label: string; descricao: string }> = {
  clickbait:        { label: "Clickbait",        descricao: "Quebra de padrão pra tráfego frio" },
  sensacao:         { label: "Sensação",          descricao: "Ativa gatilho emocional final" },
  mito:             { label: "Mito",              descricao: "Derruba a crença limitante que travou a compra" },
  contraste:        { label: "Contraste",         descricao: "Antes/depois reforça valor percebido" },
  prova:            { label: "Prova",             descricao: "Sustenta autoridade" },
  dilema:           { label: "Dilema",            descricao: "Força a escolha no momento de decisão" },
  visual:           { label: "Visual",            descricao: "Reforço visual novo pra reengajar quem já viu o anúncio" },
  certo_vs_errado:  { label: "Certo vs Errado",   descricao: "Posiciona a marca como autoridade" },
  apelo_emocional:  { label: "Apelo Emocional",   descricao: "Constrói vínculo antes da venda" },
  comparacao:       { label: "Comparação",        descricao: "Muda o ângulo pra quebrar a objeção nº 1" },
  curiosidade:      { label: "Curiosidade",       descricao: "Gancho puro pra parar o scroll de público frio" },
  demonstracao:     { label: "Demonstração",      descricao: "Mostra o mecanismo solução funcionando" },
  oportunidade:     { label: "Oportunidade",      descricao: "Ativa urgência real, o reason why" },
  ultra_segmentado: { label: "Ultra Segmentado",  descricao: "Fala direto com a dor específica de quem nunca viu a marca" },
  historia:         { label: "História",          descricao: "Principal ferramenta de aquecimento via storytelling" },
  reflexao:         { label: "Reflexão",          descricao: "Aprofunda identificação emocional" },
  explicacao:       { label: "Explicação",        descricao: "Educa sobre um padrão que a audiência ainda não percebeu" },
  problema_solucao: { label: "Problema/Solução",  descricao: "Estrutura direta ao mecanismo de solução" },
};

const CATEGORIAS: Record<string, { label: string; descricao: string }> = {
  urgencia_oculta: { label: "Urgência Oculta", descricao: "Problema real que o público ainda não vê como urgente" },
  oportunidade:    { label: "Oportunidade",    descricao: "Uma vantagem ou caminho que o público ainda não viu" },
  prontidao:       { label: "Prontidão",       descricao: "Já sabe que precisa, falta empurrar pra decisão" },
};

// ─── CORS ────────────────────────────────────────────────────────────────────
// Restrito ao domínio de produção — o navegador bloqueia chamadas de
// qualquer outro domínio antes mesmo de chegarem à função.
const CORS = {
  "Access-Control-Allow-Origin": "https://gerador-roteiro.pages.dev",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Helper de erro ───────────────────────────────────────────────────────────
function erroJson(status: number, mensagem: string): Response {
  return new Response(
    JSON.stringify({ erro: mensagem }),
    { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } }
  );
}

// ─── Instrução de gancho por subtema ─────────────────────────────────────────
// Define o padrão psicológico a aplicar na abertura do roteiro.
// Cada entrada é um padrão estrutural, nunca uma frase pronta.
function instrucaoGancho(subtema: string): string {
  const mapa: Record<string, string> = {
    clickbait:
      "Use ruptura de padrão: construa uma afirmação que contradiz o senso comum do nicho. O gancho deve gerar espanto imediato sem revelar a conclusão. Não abra com pergunta.",
    sensacao:
      "Use apelo emocional: nomeie uma sensação ou emoção específica que o público conhece bem, mas raramente vê dita em voz alta. A precisão do nome é o que para o scroll.",
    mito:
      "Use opinião impopular: desafie uma crença comum do nicho com uma afirmação que discorda do óbvio, seguida imediatamente de razão concreta. Sem atacar, só argumentar.",
    contraste:
      "Use transformação: mostre um estado inicial concreto e o resultado desejado, com prazo ou detalhe específico. Antes/depois com número ou cenário real.",
    prova:
      "Use autoridade: cite tempo de experiência, volume analisado ou resultado concreto, seguido de uma conclusão inesperada que apenas essa experiência permitiria.",
    dilema:
      "Use urgência real: apresente uma janela de tempo concreta ou uma mudança de contexto que torna a decisão urgente agora. A urgência precisa ser lógica, não fabricada.",
    visual:
      "Use ruptura de padrão visual: abra com uma cena ou imagem mental tão específica que o leitor consegue visualizar instantaneamente. Detalhes concretos de cor, espaço ou objeto.",
    certo_vs_errado:
      "Use polêmica estruturada: mostre o jeito errado (o que a maioria faz) e o jeito certo, sem atacar quem erra, mas com argumento claro de por que um funciona e o outro não.",
    apelo_emocional:
      "Use dor emocional nomeada: identifique um sentimento específico que o público carrega mas não costuma admitir em voz alta. A precisão emocional é o gancho.",
    comparacao:
      "Use analogia inesperada: compare a situação do público com algo cotidiano e improvável que muda completamente o ângulo de percepção. Nunca use celebridade.",
    curiosidade:
      "Use lacuna de curiosidade: mencione um fato ou resultado surpreendente sem revelar o como ou o porquê ainda. A lacuna puxa a leitura para frente.",
    demonstracao:
      "Use autoridade demonstrativa: abra mostrando o mecanismo em ação, com dado concreto ou situação observável. O leitor vê funcionar antes de ouvir a explicação.",
    oportunidade:
      "Use urgência de mercado: apresente uma janela ou mudança de contexto real que torna o momento relevante agora. A oportunidade precisa ter data de validade lógica.",
    ultra_segmentado:
      "Use dor ultra específica: nomeie a situação exata, o cargo, o momento ou a dor de um grupo muito específico dentro do nicho. Quanto mais preciso, mais o público sente 'é pra mim'.",
    historia:
      "Use narrativa: comece com a situação inicial concreta antes da virada, sem revelar o final ainda. Cenário específico, detalhe sensorial, sem introdução explicativa.",
    reflexao:
      "Use reflexão provocativa: formule uma observação que o público evita ter, mas que ressoa quando alguém a nomeia. Tom de escritor compartilhando algo que percebeu, não de vendedor.",
    explicacao:
      "Use lacuna de curiosidade ou ruptura de padrão: revele um padrão que o público ainda não percebeu, com dado ou observação concreta que muda a leitura que ele tinha da situação.",
    problema_solucao:
      "Use dor nomeada: descreva o problema de forma tão específica que o leitor pensa 'é exatamente isso que eu sinto'. Sem generalização, sem nicho genérico.",
  };
  return mapa[subtema] ?? "Construa um gancho forte que pare o scroll nos primeiros segundos, usando especificidade e concretude.";
}

// ─── Instrução de CTA por objetivo ───────────────────────────────────────────
function instrucaoCTA(objetivo: string): string {
  const mapa: Record<string, string> = {
    descoberta:
      "Convide a seguir o perfil, com motivo concreto e específico (o que a pessoa vai encontrar lá). NUNCA use apenas 'salvar', 'comentar' ou 'compartilhar' sem justificativa. NUNCA mencione frequência de postagem.",
    relacionamento:
      "Peça engajamento: marcar um amigo, comentar, salvar ou compartilhar. Sempre com verbo no imperativo e objeto concreto. Ex: 'Manda pra aquela amiga que...' em vez de 'Compartilhe'.",
    conversao:
      "Convide para o próximo passo leve: aula gratuita, material, isca digital, link na bio. NUNCA peça compra diretamente. O público ainda não está pronto para comprar, está sendo qualificado.",
    remarketing:
      "CTA direto: comprar agora, garantir vaga, acessar o link. O público já viu a oferta antes e está quente. Verbo no imperativo com objeto concreto. Sem enrolação.",
  };
  return mapa[objetivo] ?? "Use um CTA claro com verbo no imperativo e objeto concreto.";
}

// ─── Instrução de formato de saída ───────────────────────────────────────────
function instrucaoFormato(formato: string): string {
  const mapa: Record<string, string> = {
    reels: `
Script para vídeo vertical de 30 a 60 segundos. Use as marcações de tempo abaixo obrigatoriamente:

[0s-3s] GANCHO — texto falado nos primeiros 3 segundos. Deve parar o scroll imediatamente.
[3s-8s] ATERRISSAGEM — primeira frase após o gancho. Prende o espectador que ficou.
[8s-30s] DESENVOLVIMENTO — o coração do conteúdo: problema, mecanismo, transformação.
[30s-50s] VIRADA OU PROVA — o que sustenta ou surpreende.
[50s-60s] CTA — próximo passo claro, verbo no imperativo.

Escreva o texto exato a ser falado em câmera em cada bloco. Tom conversacional, frases curtas.`,

    post: `
Legenda para imagem estática. Estrutura obrigatória:

GANCHO (1-2 linhas): primeira frase que para o scroll. Sem pergunta retórica. Sem exclamação.
QUALIFICAÇÃO (1 parágrafo): para quem é essa mensagem.
DESENVOLVIMENTO (2-3 parágrafos): mecanismo, transformação, argumento. Parágrafos de 3-5 linhas.
PROVA OU CONSEQUÊNCIA (1 parágrafo): dado concreto, caso plausível ou contraste temporal.
CTA (1-2 linhas): próximo passo, verbo no imperativo, objeto concreto.

Sem emojis. Parágrafos separados por linha em branco.`,

    carrossel: `
8 slides obrigatórios, nesta ordem exata. Para cada slide, escreva o título "SLIDE X — [NOME]:" seguido do texto do slide (2-4 linhas).

SLIDE 1 — CAPA: título impactante (o gancho) + subtítulo curto que qualifica quem deve continuar lendo.
SLIDE 2 — MECANISMO DO PROBLEMA: o que cria ou mantém o problema que o público enfrenta.
SLIDE 3 — AGRAVAMENTO: o que acontece se o problema não for resolvido (consequência concreta).
SLIDE 4 — MECANISMO DA SOLUÇÃO: o que realmente resolve e por quê funciona, sem citar o produto ainda.
SLIDE 5 — PROVA EMPILHADA: dado, caso plausível ou comparação que sustenta o mecanismo da solução.
SLIDE 6 — BENEFÍCIOS: o que muda concretamente na vida do leitor quando o problema é resolvido.
SLIDE 7 — URGÊNCIA: por que agir agora (janela de tempo real ou custo concreto de adiar).
SLIDE 8 — CTA: próximo passo claro, verbo no imperativo, objeto concreto.`,

    stories: `
3 a 5 telas sequenciais. Para cada tela, escreva "TELA X:" e forneça:
- TEXTO: o que aparece escrito na tela (curto, direto, fonte grande)
- VISUAL: sugestão de fundo, cor ou elemento visual (uma linha)
- INTERAÇÃO: elemento interativo se aplicável (enquete, caixinha de pergunta, link) — opcional

Narrativa encadeada: cada tela depende da anterior para fazer sentido. Ritmo rápido.`,
  };
  return mapa[formato] ?? "Gere o conteúdo no formato solicitado, com estrutura clara e linguagem direta.";
}

// ─── Instrução de argumento para Conversão e Remarketing ─────────────────────
function instrucaoArgumento(objetivo: string): string {
  if (objetivo !== "conversao" && objetivo !== "remarketing") return "";
  return `
== ESTRUTURA DE ARGUMENTO (obrigatório para este objetivo) ==
O roteiro precisa quebrar uma objeção. Escolha UM dos tipos abaixo e aplique de forma integrada ao texto, nunca como lista solta:
1. Incontestável: dado ou fato concreto do nicho.
2. Lógico: raciocínio causa-efeito claro.
3. Analogia: comparação com situação cotidiana. Nunca use celebridade.
4. Exemplificação: caso hipotético plausível, sem nome de pessoa real.
5. Valor: comparação entre o investimento e o retorno tangível.
6. Consequência: o que muda em agir agora versus adiar 6 meses.
7. Contradição: a objeção contradiz outra prioridade da própria pessoa.
Use apenas um tipo. Integre naturalmente ao desenvolvimento, sem sinalizar qual tipo está usando.`;
}

// ─── Instrução de tom por tipo de tráfego ────────────────────────────────────
function instrucaoTrafego(tipo: string): string {
  if (tipo === "pago") {
    return "Este é um ANÚNCIO PAGO. Os primeiros 3 segundos são decisivos, se não prender o usuário pula. O hook deve ser ainda mais impactante. Linguagem direta, objetivo imediato, zero enrolação.";
  }
  return "Este é conteúdo ORGÂNICO. Tom mais pessoal e conversacional. Pode ter storytelling mais desenvolvido. O texto deve parecer que a criadora está falando com alguém de confiança.";
}

// ─── Montagem do prompt completo ──────────────────────────────────────────────
function montarPrompt(params: {
  tipo_trafego: string;
  objetivo: string;
  topico: string;
  categoria_matriz: string;
  subtema_matriz: string;
  formato: string;
  cta_especifico: string;
  perfil: {
    nicho: string;
    publico: string;
    produto: string;
    tom_de_voz: string;
    preferencias_estilo: string;
  };
}): string {
  const { tipo_trafego, objetivo, topico, categoria_matriz, subtema_matriz, formato, cta_especifico, perfil } = params;

  const subtema   = SUBTEMAS[subtema_matriz]    ?? { label: subtema_matriz,    descricao: "" };
  const categoria = CATEGORIAS[categoria_matriz] ?? { label: categoria_matriz, descricao: "" };

  const objetivoLabel: Record<string, string> = {
    descoberta:     "Descoberta (ganhar novos seguidores)",
    relacionamento: "Relacionamento (aprofundar conexão com quem já segue)",
    conversao:      "Conversão (levar para o próximo passo de compra)",
    remarketing:    "Remarketing (reconverter quem viu mas não comprou)",
  };

  const formatoLabel: Record<string, string> = {
    reels:     "Reels (vídeo vertical curto)",
    post:      "Post (imagem estática)",
    carrossel: "Carrossel (8 slides)",
    stories:   "Stories (telas rápidas)",
  };

  const trafLabel = tipo_trafego === "pago" ? "Pago (anúncio)" : "Orgânico (conteúdo espontâneo)";

  return `Você é um copywriter especialista em conteúdo para Instagram e Facebook, com profundo domínio de direct response e criação de roteiros para criadores de conteúdo digital.

== IDENTIDADE DA CRIADORA ==
Nicho: ${perfil.nicho}
Público-alvo: ${perfil.publico}
Produto ou serviço: ${perfil.produto}
Tom de voz: ${perfil.tom_de_voz}
Como prefere falar (estilo e preferências): ${perfil.preferencias_estilo}

== ROTEIRO SOLICITADO ==
Tema: ${topico}
Tipo de tráfego: ${trafLabel}
Objetivo: ${objetivoLabel[objetivo] ?? objetivo}
Ângulo da Matriz: ${categoria.label} — ${categoria.descricao}
Subtema: ${subtema.label} — ${subtema.descricao}
Formato de entrega: ${formatoLabel[formato] ?? formato}

== CONTEXTO DE TRÁFEGO ==
${instrucaoTrafego(tipo_trafego)}

== ENGENHARIA DO GANCHO ==
O subtema escolhido é "${subtema.label}". Instrução de abertura:
${instrucaoGancho(subtema_matriz)}

== CTA PARA ESTE ROTEIRO ==
${cta_especifico
  ? `Use exatamente este CTA definido pela criadora: "${cta_especifico}". Adapte a forma para o formato de saída, mas mantenha a essência do que está escrito.`
  : instrucaoCTA(objetivo)}
${instrucaoArgumento(objetivo)}

== FORMATO DE SAÍDA ==
${instrucaoFormato(formato)}

== OS 15 PRINCÍPIOS QUE ESTE ROTEIRO DEVE SEGUIR ==
1. Ensinar em vez de prometer — entregar aprendizado antes de oferecer produto.
2. Nomear cria realidade — dar nome próprio a um conceito, problema ou solução. Nunca "Método Exclusivo" genérico.
3. Produto não aparece no início — as primeiras linhas falam do leitor e do mundo dele, não do produto.
4. Tom de escritor, não de vendedor — como alguém explicando o que sabe bem.
5. Especificidade mata generalização — números concretos, situações específicas. Ex: "de R$15 mil para R$70 mil por projeto", nunca "multiplique seus ganhos".
6. Avisar ou ensinar, nunca vender diretamente.
7. Crie um inimigo concreto — o jeito antigo, o guru, a vendedora da loja. A pessoa não precisa admitir que errou, só aceitar que foi mal orientada.
8. Argumentar, não apenas prometer — toda promessa vem com raciocínio.
9. Especificidade no número, no prazo, no cenário.
10. Zero frase de vendedor — nunca "descubra o método", "não perca essa oportunidade", "você merece isso".
11. Razão e emoção juntas, nunca só uma.
12. Prova concreta sempre que possível — dado, caso plausível, comparação.
13. Parágrafos curtos — máximo 4 a 6 linhas por bloco.
14. Consequência de agir versus não agir — o que muda em 6 meses ou 1 ano em cada cenário.
15. Contradição — mostrar, sem atacar, onde a objeção do leitor contradiz as próprias prioridades dele.

== VÍCIOS PROIBIDOS (ZERO TOLERÂNCIA) ==
- NUNCA use travessão (— ou –) como pausa. Use vírgula ou ponto.
- NUNCA use ponto de exclamação em nenhuma parte do texto.
- NUNCA use a construção "Não é X. É Y."
- NUNCA abra parágrafo ou gancho com pergunta retórica.
- NUNCA use "mesmo que" ou "sem precisar" como muleta.
- NUNCA use emoji dentro da copy ou do título.
- NUNCA use superlativos falsos: "incrível", "revolucionário", "único", "poderoso".
- NUNCA mencione o nome do produto ou método nas primeiras linhas.
- NUNCA faça promessa vaga sem número, prazo ou cenário concreto.
- NUNCA escreva texto genérico que poderia servir para qualquer nicho.

== LIMITES ÉTICOS INEGOCIÁVEIS ==
- NUNCA faça alegação de saúde não verificada ou sugira cura, tratamento ou melhora de doença.
- NUNCA atribua falas ou endosso a pessoas reais nomeadas sem que isso seja comprovadamente verdade.
- NUNCA invente autoridade, instituição, pesquisa ou dado que não existam.
- NUNCA use teoria da conspiração para gerar urgência ou medo.
- Se o tema solicitar algo que viole esses limites, gere o roteiro dentro dos limites éticos mesmo assim.

== INSTRUÇÃO FINAL ==
Gere APENAS o roteiro. Sem explicações, sem comentários, sem cabeçalho introdutório, sem "Aqui está o roteiro:". O texto começa diretamente na primeira linha do conteúdo. Escreva em português do Brasil, com linguagem natural, específica e honesta.`;
}

// ─── Função principal ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {

  // Responde ao preflight do navegador (verificação de CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  // ── Cria cliente Supabase com o JWT do usuário ────────────────────────────
  // O RLS filtra automaticamente por user_id — a função nunca vê dados
  // de outro usuário, independente do que for passado no body.
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // ── Verifica usuário logado ───────────────────────────────────────────────
  // verify_jwt = true no painel já rejeita tokens inválidos antes de
  // chegar aqui. Este getUser confirma quem é o dono da sessão.
  const { data: { user }, error: erroAuth } = await supabase.auth.getUser();
  if (erroAuth || !user) {
    return erroJson(401, "Sessão inválida. Faça login novamente.");
  }

  // ── Rate limit via geracoes_log ───────────────────────────────────────────
  // Conta tentativas da última hora nesta tabela dedicada.
  // Usa geracoes_log, não a tabela roteiro, porque conta tentativas
  // (cada clique que gasta tokens da API), não roteiros salvos.
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: erroCount } = await supabase
    .from("geracoes_log")
    .select("*", { count: "exact", head: true })
    .gte("criado_em", umaHoraAtras);

  if (erroCount) {
    return erroJson(500, "Não foi possível verificar o limite de uso. Tente novamente.");
  }

  if ((count ?? 0) >= 20) {
    return erroJson(
      429,
      "Você atingiu o limite de 20 gerações por hora. Aguarde antes de tentar novamente."
    );
  }

  // ── Valida o body ─────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return erroJson(400, "Pedido inválido. Tente novamente.");
  }

  const { tipo_trafego, objetivo, topico, categoria_matriz, subtema_matriz, formato, cta_especifico } =
    body as Record<string, unknown>;

  // Verifica presença de todos os campos obrigatórios
  for (const [campo, valor] of Object.entries({ tipo_trafego, objetivo, topico, categoria_matriz, subtema_matriz, formato })) {
    if (!valor || typeof valor !== "string" || !valor.trim()) {
      return erroJson(400, `Campo obrigatório ausente: ${campo}.`);
    }
  }

  // Limita o tema a 500 caracteres para evitar abuso via prompt injection
  if ((topico as string).length > 500) {
    return erroJson(400, "O tema não pode ter mais de 500 caracteres.");
  }

  // ── Registra a tentativa ANTES de chamar o Gemini ────────────────────────
  // Mesmo que o Gemini falhe depois, este clique já conta contra o limite.
  // O user_id é preenchido automaticamente pelo banco via DEFAULT auth.uid().
  const { error: erroLog } = await supabase.from("geracoes_log").insert({});
  if (erroLog) {
    return erroJson(500, "Não foi possível registrar a geração. Tente novamente.");
  }

  // ── Busca o perfil completo do usuário ────────────────────────────────────
  // O RLS garante que só retorna o perfil do próprio usuário logado.
  const { data: perfil, error: erroPerfil } = await supabase
    .from("perfil")
    .select("nicho, publico, produto, tom_de_voz, preferencias_estilo")
    .single();

  if (erroPerfil || !perfil) {
    return erroJson(
      400,
      "Perfil não encontrado. Preencha seu perfil antes de gerar um roteiro."
    );
  }

  // ── Monta o prompt a partir das referências de copywriting ────────────────
  const prompt = montarPrompt({
    tipo_trafego:    tipo_trafego as string,
    objetivo:        objetivo as string,
    topico:          (topico as string).trim(),
    categoria_matriz: categoria_matriz as string,
    subtema_matriz:  subtema_matriz as string,
    formato:         formato as string,
    cta_especifico:  typeof cta_especifico === "string" ? cta_especifico.trim() : "",
    perfil,
  });

  // ── Lê a chave do Gemini do ambiente seguro do servidor ──────────────────
  // Esta chave nunca sai deste servidor. O navegador nunca a vê.
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    return erroJson(500, "Configuração interna incompleta. Entre em contato com o suporte.");
  }

  // ── Chama a API do Gemini ─────────────────────────────────────────────────
  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`;

  let geminiResp: Response;
  try {
    geminiResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch {
    return erroJson(
      502,
      "Não foi possível conectar ao serviço de IA. Verifique sua conexão e tente novamente."
    );
  }

  if (!geminiResp.ok) {
    const geminiStatus = geminiResp.status;
    const geminiCorpo  = await geminiResp.text();
    console.error("[gerar-roteiro] Gemini erro", geminiStatus, geminiCorpo);
    return erroJson(
      502,
      "O serviço de IA retornou um erro. Tente novamente em alguns instantes."
    );
  }

  // ── Extrai o texto do roteiro ─────────────────────────────────────────────
  const geminiData = await geminiResp.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const texto = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!texto.trim()) {
    return erroJson(502, "O roteiro veio vazio. Tente novamente.");
  }

  // Devolve o roteiro em texto puro, pronto para exibir na tela
  return new Response(texto.trim(), {
    headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" },
  });
});
