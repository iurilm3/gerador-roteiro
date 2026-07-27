// Edge Function: resumo-do-dia
// Roda nos servidores do Supabase (não no navegador).
// Lê os roteiros do usuário logado e devolve um resumo de produção
// em texto puro, pronto para colar no WhatsApp.
//
// Segurança:
// · verify_jwt = true (padrão no painel) — rejeita qualquer pedido sem
//   um login válido antes de executar qualquer linha de código
// · O cliente Supabase é criado com o JWT do usuário, não com a chave de
//   administrador — o RLS (Row Level Security) entra em ação e a função
//   só enxerga os roteiros DESTE usuário, nunca os de outra pessoa

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Lista dos 18 subtemas ───────────────────────────────────────────────────
// Copiada de lib/matriz.ts porque a função precisa ser um arquivo único
// e independente para ser colada no painel do Supabase sem nenhuma outra
// dependência do projeto Next.js.
const SUBTEMAS = [
  { id: "clickbait",        label: "Clickbait" },
  { id: "sensacao",         label: "Sensação" },
  { id: "mito",             label: "Mito" },
  { id: "contraste",        label: "Contraste" },
  { id: "prova",            label: "Prova" },
  { id: "dilema",           label: "Dilema" },
  { id: "visual",           label: "Visual" },
  { id: "certo_vs_errado",  label: "Certo vs Errado" },
  { id: "apelo_emocional",  label: "Apelo Emocional" },
  { id: "comparacao",       label: "Comparação" },
  { id: "curiosidade",      label: "Curiosidade" },
  { id: "demonstracao",     label: "Demonstração" },
  { id: "oportunidade",     label: "Oportunidade" },
  { id: "ultra_segmentado", label: "Ultra Segmentado" },
  { id: "historia",         label: "História" },
  { id: "reflexao",         label: "Reflexão" },
  { id: "explicacao",       label: "Explicação" },
  { id: "problema_solucao", label: "Problema/Solução" },
];

// ─── Cabeçalhos CORS ─────────────────────────────────────────────────────────
// CORS é uma regra do navegador: antes de chamar um servidor diferente do seu,
// ele pergunta "você aceita pedidos vindos daqui?". Esses cabeçalhos respondem
// "sim, pode chamar". Sem eles, o navegador bloquearia a resposta mesmo que a
// função funcionasse corretamente.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Função principal ─────────────────────────────────────────────────────────
// Deno.serve é o ponto de entrada de toda Edge Function do Supabase.
// Ela recebe cada pedido HTTP e devolve uma resposta.
Deno.serve(async (req: Request) => {

  // O navegador manda um pedido "OPTIONS" antes do pedido real para verificar
  // se a função aceita chamadas do seu domínio. Respondemos "ok" e encerramos.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  // ── Conexão com o banco usando o JWT do usuário ──────────────────────────
  // Lemos o token de login que o navegador enviou no cabeçalho Authorization.
  // Ao passá-lo para o createClient, o Supabase executa as queries
  // "como" esse usuário — o RLS filtra automaticamente pelo user_id dele.
  // Usamos a ANON_KEY (não a SERVICE_ROLE_KEY) justamente para que o RLS
  // não seja contornado.
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // ── Busca todos os roteiros do usuário ───────────────────────────────────
  // Trazemos tudo de uma vez e filtramos no JS abaixo.
  // O RLS já garante que só chegam os roteiros deste usuário.
  const { data, error } = await supabase
    .from("roteiro")
    .select("id, objetivo, subtema_matriz, criado_em, tipo_trafego");

  if (error) {
    return new Response(
      JSON.stringify({ erro: "Não foi possível buscar os roteiros." }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const todos = data ?? [];

  // ── Data de hoje formatada em dd/mm/aaaa ─────────────────────────────────
  const agora = new Date();
  const dd   = String(agora.getDate()).padStart(2, "0");
  const mes  = String(agora.getMonth() + 1).padStart(2, "0");
  const ano  = agora.getFullYear();
  const dataHoje = `${dd}/${mes}/${ano}`;

  // ── Filtro dos últimos 30 dias ───────────────────────────────────────────
  // Proporções e subtema esquecido usam apenas os roteiros desse janela,
  // igual à lógica padrão do /dashboard.
  const limite = new Date(agora);
  limite.setDate(agora.getDate() - 30);
  limite.setHours(0, 0, 0, 0);
  const periodo = todos.filter((r) => new Date(r.criado_em) >= limite);

  const total = periodo.length;

  // ── Contagem por objetivo no período ────────────────────────────────────
  const contObj: Record<string, number> = {};
  for (const r of periodo) {
    contObj[r.objetivo] = (contObj[r.objetivo] ?? 0) + 1;
  }

  // Calcula a porcentagem de cada objetivo sobre o TOTAL do período
  // (incluindo remarketing no denominador — mesma regra do dashboard).
  function pct(obj: string): number {
    if (total === 0) return 0;
    return Math.round(((contObj[obj] ?? 0) / total) * 100);
  }

  const countRemarketing = contObj["remarketing"] ?? 0;

  // ── Subtema esquecido ────────────────────────────────────────────────────
  // Primeiro tenta achar um subtema com zero usos no período.
  // Se todos já foram usados ao menos uma vez, pega o que foi usado
  // há mais tempo (a data mais antiga de uso).
  const contSub: Record<string, { count: number; ultima: string | null }> = {};
  for (const s of SUBTEMAS) contSub[s.id] = { count: 0, ultima: null };

  for (const r of periodo) {
    if (contSub[r.subtema_matriz]) {
      contSub[r.subtema_matriz].count += 1;
      const atual = contSub[r.subtema_matriz].ultima;
      if (!atual || r.criado_em > atual) contSub[r.subtema_matriz].ultima = r.criado_em;
    }
  }

  let subtemaEsquecido = "—";
  if (total > 0) {
    const nunca = SUBTEMAS.find((s) => contSub[s.id].count === 0);
    if (nunca) {
      subtemaEsquecido = nunca.label;
    } else {
      const menosUsado = SUBTEMAS.reduce((acc, s) => {
        const u    = contSub[s.id].ultima   ?? "";
        const uAcc = contSub[acc.id].ultima ?? "";
        return u < uAcc ? s : acc;
      });
      subtemaEsquecido = menosUsado.label;
    }
  }

  // ── Dias desde o último roteiro ──────────────────────────────────────────
  // Usa TODOS os roteiros (não só os 30 dias), igual ao Bloco 3 do dashboard.
  let linhaUltimo = "Último roteiro: —";
  if (todos.length > 0) {
    const maisRecente = todos.reduce((acc, r) =>
      r.criado_em > acc.criado_em ? r : acc
    );
    const dias = Math.floor(
      (Date.now() - new Date(maisRecente.criado_em).getTime()) / 86_400_000
    );
    if (dias === 0)      linhaUltimo = "Último roteiro: hoje";
    else if (dias === 1) linhaUltimo = "Último roteiro: há 1 dia";
    else                 linhaUltimo = `Último roteiro: há ${dias} dias`;
  }

  // ── Monta o texto final ──────────────────────────────────────────────────
  // Cada linha separada por \n, pronto para colar no WhatsApp.
  const texto = [
    `📊 Resumo de produção — ${dataHoje}`,
    ``,
    `Total de roteiros: ${total} (últimos 30 dias)`,
    `+ Seguidores: ${pct("descoberta")}% (meta 70%)`,
    `+ Interação: ${pct("relacionamento")}% (meta 20%)`,
    `+ Vendas: ${pct("conversao")}% (meta 10%)`,
    `+ Remarketing: ${countRemarketing} roteiro${countRemarketing !== 1 ? "s" : ""}`,
    ``,
    `Subtema esquecido: ${subtemaEsquecido}`,
    linhaUltimo,
  ].join("\n");

  // Devolve texto puro (não JSON) com UTF-8 para os emojis e acentos
  return new Response(texto, {
    headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" },
  });
});
