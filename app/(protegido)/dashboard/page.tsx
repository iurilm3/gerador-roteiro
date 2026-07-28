"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SUBTEMAS_MATRIZ } from "@/lib/matriz";

const METAS: Record<string, number> = {
  descoberta:     0.70,
  relacionamento: 0.20,
  conversao:      0.10,
};

const LABELS_OBJETIVO: Record<string, string> = {
  descoberta:     "+ Seguidores",
  relacionamento: "+ Interação",
  conversao:      "+ Vendas",
  remarketing:    "+ Remarketing",
};

const LABELS_FORMATO: Record<string, string> = {
  reels:     "Reels",
  post:      "Post",
  carrossel: "Carrossel",
  stories:   "Stories",
};

const LABELS_STATUS: Record<string, string> = {
  rascunho:  "Rascunho",
  aprovado:  "Aprovado",
  publicado: "Publicado",
};

type Item = {
  id: string;
  objetivo: string;
  subtema_matriz: string;
  criado_em: string;
  tipo_trafego: string;
  topico: string;
  formato: string;
  status: string;
};

// Remove acentos e coloca em minúsculo para busca sem diferenciar acento
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

type ProporcaoItem = {
  objetivo: string;
  label: string;
  count: number;
  pct: number;
  meta: number | null;
  status: "ok" | "abaixo" | "acima" | "sem_meta";
};

type SubtemaInfo = {
  id: string;
  label: string;
  descricao: string;
  nunca: boolean;
};

function calcularProporcoes(roteiros: Item[]): ProporcaoItem[] {
  const contagemObj: Record<string, number> = {};
  for (const r of roteiros) {
    contagemObj[r.objetivo] = (contagemObj[r.objetivo] ?? 0) + 1;
  }
  const totalPeriodo = roteiros.length;

  return ["descoberta", "relacionamento", "conversao", "remarketing"].map((obj) => {
    const count = contagemObj[obj] ?? 0;
    const meta = METAS[obj] ?? null;
    let pct = 0;
    if (meta !== null && totalPeriodo > 0) pct = count / totalPeriodo;
    let status: ProporcaoItem["status"] = "sem_meta";
    if (meta !== null) {
      const diff = pct - meta;
      if (diff < -0.05) status = "abaixo";
      else if (diff > 0.05) status = "acima";
      else status = "ok";
    }
    return { objetivo: obj, label: LABELS_OBJETIVO[obj], count, pct, meta, status };
  });
}

function calcularSubtema(roteiros: Item[]): SubtemaInfo {
  const contagem: Record<string, { count: number; ultimaVez: string | null }> = {};
  for (const s of SUBTEMAS_MATRIZ) contagem[s.id] = { count: 0, ultimaVez: null };
  for (const r of roteiros) {
    if (contagem[r.subtema_matriz]) {
      contagem[r.subtema_matriz].count += 1;
      const atual = contagem[r.subtema_matriz].ultimaVez;
      if (!atual || r.criado_em > atual) contagem[r.subtema_matriz].ultimaVez = r.criado_em;
    }
  }
  const nunca = SUBTEMAS_MATRIZ.find((s) => contagem[s.id].count === 0);
  if (nunca) return { id: nunca.id, label: nunca.label, descricao: nunca.descricao, nunca: true };
  const menosUsado = SUBTEMAS_MATRIZ.reduce((acc, s) => {
    const ultima = contagem[s.id].ultimaVez ?? "";
    const accUltima = contagem[acc.id].ultimaVez ?? "";
    return ultima < accUltima ? s : acc;
  });
  return { id: menosUsado.id, label: menosUsado.label, descricao: menosUsado.descricao, nunca: false };
}

function diasDesdeUltimo(roteiros: Item[]): number | null {
  if (roteiros.length === 0) return null;
  const maisRecente = roteiros.reduce((acc, r) => (r.criado_em > acc.criado_em ? r : acc));
  return Math.floor((Date.now() - new Date(maisRecente.criado_em).getTime()) / 86_400_000);
}

function hojeStr(): string {
  return new Date().toISOString().split("T")[0];
}

function StatusIcon({ status }: { status: ProporcaoItem["status"] }) {
  if (status === "ok")     return <span title="Dentro da meta">🟢</span>;
  if (status === "abaixo") return <span title="Abaixo da meta">🔴</span>;
  if (status === "acima")  return <span title="Acima da meta">🟡</span>;
  return null;
}

export default function DashboardPage() {
  const [roteiros, setRoteiros] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [periodo, setPeriodo] = useState<"7" | "30" | "custom">("30");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Estados da seção "Meus Roteiros"
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroObjetivo, setFiltroObjetivo] = useState("todos");
  const [filtroFormato, setFiltroFormato] = useState("todos");

  // Estados do resumo do dia (Edge Function)
  const [textoResumo, setTextoResumo] = useState("");
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [erroResumo, setErroResumo] = useState("");
  const [copiadoResumo, setCopiadoResumo] = useState(false);

  // Chama a Edge Function do Supabase com o JWT do usuário logado.
  // O JWT é o "cartão de identidade" da sessão — já existe no navegador,
  // não é nenhuma chave secreta nova.
  async function gerarResumo() {
    setLoadingResumo(true);
    setErroResumo("");
    setTextoResumo("");
    setCopiadoResumo(false);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setErroResumo("Sessão expirada. Recarregue a página e tente de novo.");
      setLoadingResumo(false);
      return;
    }

    // A URL da Edge Function segue sempre o padrão:
    // {URL_DO_SUPABASE}/functions/v1/{nome-da-função}
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/resumo-do-dia`;

    try {
      const res = await fetch(url, {
        headers: {
          // Authorization leva o JWT — o Supabase verifica e só executa se válido
          Authorization: `Bearer ${token}`,
          // apikey identifica de qual projeto Supabase é esse pedido
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        },
      });

      if (!res.ok) {
        setErroResumo("Não foi possível gerar o resumo. Tente de novo.");
        setLoadingResumo(false);
        return;
      }

      const texto = await res.text();
      setTextoResumo(texto);
    } catch {
      setErroResumo("Erro de conexão. Verifique sua internet e tente de novo.");
    }

    setLoadingResumo(false);
  }

  function copiarResumo() {
    if (!textoResumo) return;
    navigator.clipboard.writeText(textoResumo).then(() => {
      setCopiadoResumo(true);
      setTimeout(() => setCopiadoResumo(false), 2000);
    });
  }

  useEffect(() => {
    async function buscar() {
      const { data, error } = await supabase
        .from("roteiro")
        .select("id, objetivo, subtema_matriz, criado_em, tipo_trafego, topico, formato, status")
        .order("criado_em", { ascending: false });
      if (error) {
        setErro("Não conseguimos carregar os dados. Tente recarregar a página.");
      } else {
        setRoteiros(data ?? []);
      }
      setCarregando(false);
    }
    buscar();
  }, []);

  // Calcular intervalo de datas
  const agora = new Date();
  const hojeFim = new Date(agora);
  hojeFim.setHours(23, 59, 59, 999);

  let inicioFiltro: Date | null = null;
  let fimFiltro: Date = hojeFim;
  let periodoInvalido = false;
  let periodoIncompleto = false;

  if (periodo === "7") {
    inicioFiltro = new Date(agora);
    inicioFiltro.setDate(agora.getDate() - 7);
    inicioFiltro.setHours(0, 0, 0, 0);
  } else if (periodo === "30") {
    inicioFiltro = new Date(agora);
    inicioFiltro.setDate(agora.getDate() - 30);
    inicioFiltro.setHours(0, 0, 0, 0);
  } else {
    if (!dataInicio || !dataFim) {
      periodoIncompleto = true;
    } else {
      const ini = new Date(dataInicio + "T00:00:00");
      const fimDesejado = new Date(dataFim + "T23:59:59");
      fimFiltro = fimDesejado > hojeFim ? hojeFim : fimDesejado;
      if (ini > fimFiltro) {
        periodoInvalido = true;
      } else {
        inicioFiltro = ini;
      }
    }
  }

  const podeCalcular = inicioFiltro !== null && !periodoInvalido && !periodoIncompleto;

  const roteiros_periodo = podeCalcular
    ? roteiros.filter((r) => {
        const d = new Date(r.criado_em);
        return d >= inicioFiltro! && d <= fimFiltro;
      })
    : [];

  const proporcoes = calcularProporcoes(roteiros_periodo);
  const subtemaInfo = roteiros_periodo.length > 0 ? calcularSubtema(roteiros_periodo) : null;
  const dias = diasDesdeUltimo(roteiros);

  const alertaConsistencia =
    dias === null    ? null
    : dias === 0    ? "Você gerou um roteiro hoje."
    : dias === 1    ? "Seu último roteiro foi ontem."
    : `Seu último roteiro foi há ${dias} dias.`;
  const consistenciaVermelha = dias !== null && dias > 3;

  // Alerta de Remarketing — usa todos os roteiros, ignora período
  const roteiros_pagos = roteiros.filter((r) => r.tipo_trafego === "pago");
  const totalRemarketing = roteiros.filter((r) => r.objetivo === "remarketing").length;
  let alertaRemarketingAtivo = false;
  let diasPrimeiroPago = 0;
  if (roteiros_pagos.length > 0 && totalRemarketing === 0) {
    const primeiroPago = roteiros_pagos.reduce((acc, r) =>
      r.criado_em < acc.criado_em ? r : acc
    );
    diasPrimeiroPago = Math.floor(
      (Date.now() - new Date(primeiroPago.criado_em).getTime()) / 86_400_000
    );
    alertaRemarketingAtivo = diasPrimeiroPago >= 7;
  }

  // "Meus Roteiros" — filtra os 50 mais recentes por busca + 3 filtros
  // Os roteiros já chegam ordenados por criado_em DESC (definido na query)
  const lista50 = roteiros.slice(0, 50);
  const termoBusca = normalizar(busca);
  const roteiros_filtrados = lista50.filter((r) => {
    if (termoBusca && !normalizar(r.topico ?? "").includes(termoBusca)) return false;
    if (filtroStatus   !== "todos" && r.status   !== filtroStatus)   return false;
    if (filtroObjetivo !== "todos" && r.objetivo  !== filtroObjetivo) return false;
    if (filtroFormato  !== "todos" && r.formato   !== filtroFormato)  return false;
    return true;
  });

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">Carregando dashboard...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
        <p className="text-red-700 dark:text-red-300 text-sm">{erro}</p>
      </div>
    );
  }

  if (roteiros.length === 0) {
    return (
      <div className="pb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
          Diagnóstico da sua produção de roteiros.
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-8 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-1">
            Você ainda não gerou nenhum roteiro.
          </p>
          <p className="text-zinc-400 dark:text-zinc-600 text-xs mb-5">
            Gere o primeiro e o painel começa a funcionar automaticamente.
          </p>
          <Link
            href="/gerar"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Gerar meu primeiro roteiro
          </Link>
        </div>
      </div>
    );
  }

  const OPCOES_PERIODO = [
    { valor: "7",      label: "Últimos 7 dias" },
    { valor: "30",     label: "Últimos 30 dias" },
    { valor: "custom", label: "Selecionar período" },
  ] as const;

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Dashboard</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-5">
        Diagnóstico da sua produção de roteiros.
      </p>

      {/* Seletor de período */}
      <div className="mb-5">
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
          {OPCOES_PERIODO.map((opt) => (
            <button
              key={opt.valor}
              onClick={() => setPeriodo(opt.valor)}
              className={`py-2 px-1 rounded-lg text-center text-[11px] font-medium leading-tight transition-colors ${
                periodo === opt.valor
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {periodo === "custom" && (
          <div className="mt-3 flex gap-2 items-center">
            <input
              type="date"
              value={dataInicio}
              max={hojeStr()}
              onChange={(e) => setDataInicio(e.target.value)}
              className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-50 text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
            <span className="text-zinc-400 dark:text-zinc-600 text-xs shrink-0">até</span>
            <input
              type="date"
              value={dataFim}
              max={hojeStr()}
              onChange={(e) => setDataFim(e.target.value)}
              className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-50 text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        )}

        {periodo === "custom" && periodoIncompleto && dataInicio === "" && dataFim === "" && (
          <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-2">
            Selecione as duas datas para ver os dados.
          </p>
        )}
        {periodo === "custom" && periodoInvalido && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
            A data de início deve ser anterior à data de fim.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {/* Bloco 1 — Régua de proporção */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-1">
            Régua de proporção
          </p>
          <p className="text-zinc-400 dark:text-zinc-600 text-xs mb-4">
            Meta: 70% seguidores · 20% interação · 10% vendas
          </p>

          {roteiros_periodo.length === 0 ? (
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">
              Nenhum roteiro gerado nesse período.
            </p>
          ) : (
            <div className="space-y-4">
              {proporcoes.map(({ objetivo, label, count, pct, meta, status }) => (
                <div key={objetivo}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      {meta !== null && <StatusIcon status={status} />}
                      <span className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">{label}</span>
                      {meta === null && (
                        <span className="text-zinc-400 dark:text-zinc-600 text-xs">
                          · Reativo — sem meta de proporção
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-500 dark:text-zinc-500 text-xs shrink-0 ml-2">
                      {meta !== null
                        ? `${Math.round(pct * 100)}% · meta ${Math.round(meta * 100)}%`
                        : `${count} roteiro${count !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  {meta !== null && (
                    <>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${Math.min(Math.round(pct * 100), 100)}%` }}
                        />
                      </div>
                      {status === "abaixo" && (
                        <Link
                          href={`/gerar?objetivo=${objetivo}`}
                          className="inline-block mt-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors underline underline-offset-2"
                        >
                          Gerar roteiro de {label} →
                        </Link>
                      )}
                    </>
                  )}
                  {objetivo === "remarketing" && alertaRemarketingAtivo && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3">
                      <div className="flex gap-2 items-start mb-3">
                        <span className="text-amber-500 shrink-0 text-sm">⚠</span>
                        <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                          Você roda tráfego pago há {diasPrimeiroPago} dias e ainda não criou nenhum roteiro de Remarketing. Se sua campanha está trazendo bastante tráfego diário, você já pode ter público suficiente pra ativar o Remarketing — confira o tamanho do seu público personalizado no Gerenciador de Anúncios antes de criar.
                        </p>
                      </div>
                      <Link
                        href="/gerar?objetivo=remarketing"
                        className="inline-block text-xs font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-200 transition-colors"
                      >
                        Gerar roteiro de Remarketing →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloco 2 — Subtema esquecido */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-3">
            Subtema esquecido
          </p>

          {roteiros_periodo.length === 0 ? (
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">
              Nenhum roteiro gerado nesse período.
            </p>
          ) : subtemaInfo ? (
            <>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                {subtemaInfo.nunca
                  ? <>Você ainda não gerou nenhum roteiro com o ângulo <span className="font-semibold text-zinc-800 dark:text-zinc-200">{subtemaInfo.label}</span> — {subtemaInfo.descricao.toLowerCase()}. Bora tentar no próximo roteiro?</>
                  : <>Você não gera um roteiro há mais tempo com o ângulo <span className="font-semibold text-zinc-800 dark:text-zinc-200">{subtemaInfo.label}</span> — {subtemaInfo.descricao.toLowerCase()}. Bora tentar no próximo roteiro?</>
                }
              </p>
              <Link
                href={`/gerar?subtema=${subtemaInfo.id}`}
                className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                Gerar roteiro sobre {subtemaInfo.label} →
              </Link>
            </>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-600 text-sm">
              Nenhum subtema identificado ainda.
            </p>
          )}
        </div>

        {/* Bloco 3 — Consistência (ignora período, usa todos os roteiros) */}
        <div className={`border rounded-xl p-5 ${
          consistenciaVermelha
            ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50"
            : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        }`}>
          <p className={`text-sm font-semibold mb-1 ${
            consistenciaVermelha
              ? "text-red-700 dark:text-red-300"
              : "text-zinc-700 dark:text-zinc-300"
          }`}>
            Consistência
          </p>
          <p className={`text-sm ${
            consistenciaVermelha
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}>
            {alertaConsistencia ?? "Nenhum roteiro encontrado."}
          </p>
          {consistenciaVermelha && (
            <Link
              href="/gerar"
              className="inline-block mt-3 text-xs text-red-700 dark:text-red-300 underline underline-offset-2 hover:text-red-500 dark:hover:text-red-200 transition-colors"
            >
              Gerar agora →
            </Link>
          )}
        </div>
      </div>

      {/* Resumo do dia — chama a Edge Function */}
      <div className="mt-6">
        <button
          onClick={gerarResumo}
          disabled={loadingResumo}
          className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
          style={{ minHeight: "48px" }}
        >
          {loadingResumo ? "Gerando resumo..." : "Gerar resumo do dia"}
        </button>

        {erroResumo && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-3 text-center">
            {erroResumo}
          </p>
        )}

        {textoResumo && (
          <div className="mt-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {textoResumo}
            </p>
            <button
              onClick={copiarResumo}
              className={`mt-4 w-full font-semibold py-3 rounded-xl transition-all text-sm border ${
                copiadoResumo
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300"
                  : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {copiadoResumo ? "Copiado! ✓" : "Copiar resumo"}
            </button>
          </div>
        )}
      </div>
      {/* Meus Roteiros */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Meus Roteiros</h2>

        {/* Campo de busca */}
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por tema..."
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-sm mb-3"
        />

        {/* 3 filtros em linha */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2 py-2 text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="todos">Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="aprovado">Aprovado</option>
          </select>

          <select
            value={filtroObjetivo}
            onChange={(e) => setFiltroObjetivo(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2 py-2 text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="todos">Objetivo</option>
            <option value="descoberta">Seguidores</option>
            <option value="relacionamento">Interação</option>
            <option value="conversao">Vendas</option>
            <option value="remarketing">Remarketing</option>
          </select>

          <select
            value={filtroFormato}
            onChange={(e) => setFiltroFormato(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2 py-2 text-zinc-700 dark:text-zinc-300 text-xs focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="todos">Formato</option>
            <option value="reels">Reels</option>
            <option value="post">Post</option>
            <option value="carrossel">Carrossel</option>
            <option value="stories">Stories</option>
          </select>
        </div>

        {/* Lista de cards */}
        {roteiros.length === 0 ? (
          <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-6">
            Você ainda não gerou nenhum roteiro.
          </p>
        ) : roteiros_filtrados.length === 0 ? (
          <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-6">
            Nenhum roteiro encontrado com esses filtros.
          </p>
        ) : (
          <div className="space-y-3">
            {roteiros_filtrados.map((r) => {
              const subLabel = SUBTEMAS_MATRIZ.find((s) => s.id === r.subtema_matriz)?.label ?? r.subtema_matriz;
              const [ano, mes, dia] = r.criado_em.split("T")[0].split("-");
              const dataFormatada = `${dia}/${mes}/${ano}`;
              const statusAtivo = r.status === "aprovado";

              return (
                <div
                  key={r.id}
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
                >
                  {/* Linha de topo: tema + badge de status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-zinc-900 dark:text-zinc-50 text-sm font-semibold leading-snug">
                      {r.topico}
                    </p>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusAtivo
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {LABELS_STATUS[r.status] ?? r.status}
                    </span>
                  </div>

                  {/* Metadados em linha */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500 mb-3">
                    <span>{LABELS_OBJETIVO[r.objetivo] ?? r.objetivo}</span>
                    <span>·</span>
                    <span>{LABELS_FORMATO[r.formato] ?? r.formato}</span>
                    <span>·</span>
                    <span>{subLabel}</span>
                    <span>·</span>
                    <span>{dataFormatada}</span>
                  </div>

                  {/* Botão duplicar */}
                  <Link
                    href={`/gerar?duplicar=${r.id}`}
                    className="inline-block text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors underline underline-offset-2"
                  >
                    Duplicar e gerar novo →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
