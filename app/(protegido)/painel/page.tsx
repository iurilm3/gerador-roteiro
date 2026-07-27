"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SUBTEMAS: { valor: string; label: string }[] = [
  { valor: "clickbait",        label: "Clickbait" },
  { valor: "sensacao",         label: "Sensação" },
  { valor: "mito",             label: "Mito" },
  { valor: "contraste",        label: "Contraste" },
  { valor: "prova",            label: "Prova" },
  { valor: "dilema",           label: "Dilema" },
  { valor: "visual",           label: "Visual" },
  { valor: "certo_vs_errado",  label: "Certo vs Errado" },
  { valor: "apelo_emocional",  label: "Apelo Emocional" },
  { valor: "comparacao",       label: "Comparação" },
  { valor: "curiosidade",      label: "Curiosidade" },
  { valor: "demonstracao",     label: "Demonstração" },
  { valor: "oportunidade",     label: "Oportunidade" },
  { valor: "ultra_segmentado", label: "Ultra Segmentado" },
  { valor: "historia",         label: "História" },
  { valor: "reflexao",         label: "Reflexão" },
  { valor: "explicacao",       label: "Explicação" },
  { valor: "problema_solucao", label: "Problema/Solução" },
];

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

type Item = {
  id: string;
  objetivo: string;
  subtema_matriz: string;
  criado_em: string;
};

type Diagnostico = {
  proporcoes: {
    objetivo: string;
    label: string;
    count: number;
    pct: number;
    meta: number | null;
    status: "ok" | "abaixo" | "acima" | "sem_meta";
  }[];
  subtemaEsquecido: { label: string; nunca: boolean } | null;
  diasDesdeUltimo: number | null;
};

function calcular(roteiros: Item[]): Diagnostico {
  const total = roteiros.length;

  // Proporções
  const contagemObj: Record<string, number> = {};
  for (const r of roteiros) {
    contagemObj[r.objetivo] = (contagemObj[r.objetivo] ?? 0) + 1;
  }

  const totalSemRemark = (contagemObj["descoberta"] ?? 0)
    + (contagemObj["relacionamento"] ?? 0)
    + (contagemObj["conversao"] ?? 0);

  const proporcoes = ["descoberta", "relacionamento", "conversao", "remarketing"].map((obj) => {
    const count = contagemObj[obj] ?? 0;
    const meta = METAS[obj] ?? null;

    let pct = 0;
    if (meta !== null) {
      pct = totalSemRemark > 0 ? count / totalSemRemark : 0;
    }

    let status: "ok" | "abaixo" | "acima" | "sem_meta" = "sem_meta";
    if (meta !== null) {
      const diff = pct - meta;
      if (diff < -0.05) status = "abaixo";
      else if (diff > 0.05) status = "acima";
      else status = "ok";
    }

    return { objetivo: obj, label: LABELS_OBJETIVO[obj], count, pct, meta, status };
  });

  // Subtema esquecido
  const contagemSub: Record<string, { count: number; ultimaVez: string | null }> = {};
  for (const s of SUBTEMAS) {
    contagemSub[s.valor] = { count: 0, ultimaVez: null };
  }
  for (const r of roteiros) {
    if (contagemSub[r.subtema_matriz]) {
      contagemSub[r.subtema_matriz].count += 1;
      const atual = contagemSub[r.subtema_matriz].ultimaVez;
      if (!atual || r.criado_em > atual) {
        contagemSub[r.subtema_matriz].ultimaVez = r.criado_em;
      }
    }
  }

  let subtemaEsquecido: Diagnostico["subtemaEsquecido"] = null;
  if (total > 0) {
    const nunca = SUBTEMAS.find((s) => contagemSub[s.valor].count === 0);
    if (nunca) {
      subtemaEsquecido = { label: nunca.label, nunca: true };
    } else {
      const menosUsado = SUBTEMAS.reduce((acc, s) => {
        const ultima = contagemSub[s.valor].ultimaVez ?? "";
        const accUltima = contagemSub[acc.valor].ultimaVez ?? "";
        return ultima < accUltima ? s : acc;
      });
      subtemaEsquecido = { label: menosUsado.label, nunca: false };
    }
  }

  // Dias desde o último roteiro
  let diasDesdeUltimo: number | null = null;
  if (total > 0) {
    const mais_recente = roteiros.reduce((acc, r) =>
      r.criado_em > acc.criado_em ? r : acc
    );
    const diff = Date.now() - new Date(mais_recente.criado_em).getTime();
    diasDesdeUltimo = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  return { proporcoes, subtemaEsquecido, diasDesdeUltimo };
}

function StatusIcon({ status }: { status: "ok" | "abaixo" | "acima" | "sem_meta" }) {
  if (status === "ok")    return <span title="Dentro da meta">🟢</span>;
  if (status === "abaixo") return <span title="Abaixo da meta">🔴</span>;
  if (status === "acima")  return <span title="Acima da meta">🟡</span>;
  return null;
}

export default function PainelPage() {
  const [roteiros, setRoteiros] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscar() {
      const { data, error } = await supabase
        .from("roteiro")
        .select("id, objetivo, subtema_matriz, criado_em");

      if (error) {
        setErro("Não conseguimos carregar os dados. Tente recarregar a página.");
      } else {
        setRoteiros(data ?? []);
      }
      setCarregando(false);
    }
    buscar();
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">Carregando painel...</p>
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Painel do dia</h1>
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

  const { proporcoes, subtemaEsquecido, diasDesdeUltimo } = calcular(roteiros);

  const alertaConsistencia =
    diasDesdeUltimo === null ? null
    : diasDesdeUltimo === 0 ? "Você gerou um roteiro hoje."
    : diasDesdeUltimo === 1 ? "Seu último roteiro foi ontem."
    : `Seu último roteiro foi há ${diasDesdeUltimo} dias.`;

  const consistenciaVermelha = diasDesdeUltimo !== null && diasDesdeUltimo > 3;

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Painel do dia</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
        Diagnóstico da sua produção de roteiros.
      </p>

      <div className="space-y-4">
        {/* Bloco 1 — Régua de proporção */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-1">
            Régua de proporção
          </p>
          <p className="text-zinc-400 dark:text-zinc-600 text-xs mb-4">
            Meta: 70% seguidores · 20% interação · 10% vendas
          </p>

          <div className="space-y-3">
            {proporcoes.map(({ objetivo, label, count, pct, meta, status }) => (
              <div key={objetivo}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {meta !== null && <StatusIcon status={status} />}
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs">{label}</span>
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-500 text-xs">
                    {meta !== null
                      ? `${Math.round(pct * 100)}% · meta ${Math.round(meta * 100)}%`
                      : `${count} roteiro${count !== 1 ? "s" : ""}`}
                  </span>
                </div>
                {meta !== null && (
                  <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${Math.min(Math.round(pct * 100), 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bloco 2 — Subtema esquecido */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-1">
            Subtema esquecido
          </p>
          {subtemaEsquecido ? (
            <>
              <p className="text-zinc-400 dark:text-zinc-600 text-xs mb-3">
                {subtemaEsquecido.nunca
                  ? "Você ainda não usou este subtema nenhuma vez:"
                  : "Este subtema não aparece nos seus roteiros mais recentes:"}
              </p>
              <p className="text-violet-600 dark:text-violet-400 text-base font-semibold">
                {subtemaEsquecido.label}
              </p>
            </>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-1">
              Nenhum subtema identificado ainda.
            </p>
          )}
        </div>

        {/* Bloco 3 — Alerta de consistência */}
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
    </div>
  );
}
