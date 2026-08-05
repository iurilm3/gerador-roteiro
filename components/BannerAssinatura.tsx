"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Assinatura = {
  status: string;
  trial_termina_em: string | null;
  plano: string;
  limite_roteiros_dia: number;
};

export default function BannerAssinatura() {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [usoHoje, setUsoHoje] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      // Busca os dados da assinatura e a contagem de gerações de hoje em paralelo
      const meiaNocteUTC = new Date();
      meiaNocteUTC.setUTCHours(0, 0, 0, 0);

      const [{ data: ass }, { count }] = await Promise.all([
        supabase
          .from("assinatura")
          .select("status, trial_termina_em, plano, limite_roteiros_dia")
          .single(),
        supabase
          .from("geracoes_log")
          .select("*", { count: "exact", head: true })
          .gte("criado_em", meiaNocteUTC.toISOString()),
      ]);

      setAssinatura(ass);
      setUsoHoje(count ?? 0);
      setCarregando(false);
    }

    carregar();
  }, []);

  // Não ocupa espaço enquanto carrega
  if (carregando || !assinatura) return null;

  const diasRestantes = assinatura.trial_termina_em
    ? Math.ceil(
        (new Date(assinatura.trial_termina_em).getTime() - Date.now()) / 86_400_000
      )
    : null;

  const isPro = assinatura.plano === "pro";

  // Texto de uso: Pro mostra contagem simples, outros mostram "X de Y"
  const usoTexto = isPro
    ? `${usoHoje} roteiro${usoHoje !== 1 ? "s" : ""} gerado${usoHoje !== 1 ? "s" : ""} hoje`
    : `${usoHoje} de ${assinatura.limite_roteiros_dia} roteiro${assinatura.limite_roteiros_dia !== 1 ? "s" : ""} usado${assinatura.limite_roteiros_dia !== 1 ? "s" : ""} hoje`;

  // ── Pagamento atrasado ──────────────────────────────────────────────────────
  if (assinatura.status === "atrasada") {
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 mb-6">
        <p className="text-red-700 dark:text-red-300 text-sm">
          <span className="font-semibold">Pagamento com problema.</span>{" "}
          <Link
            href="/planos"
            className="underline underline-offset-2 hover:text-red-600 dark:hover:text-red-200 transition-colors"
          >
            Atualize seu cartão
          </Link>{" "}
          para continuar usando o Rotex.
        </p>
      </div>
    );
  }

  // ── Trial com urgência (menos de 2 dias) ────────────────────────────────────
  if (assinatura.status === "trial" && diasRestantes !== null && diasRestantes < 2) {
    const labelDias =
      diasRestantes <= 0 ? "Teste encerrado" : "1 dia de teste restante";

    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-amber-700 dark:text-amber-300 text-sm font-semibold">
            {labelDias}
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-xs">{usoTexto}</p>
        </div>
        <Link
          href="/planos"
          className="inline-block mt-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-200 transition-colors"
        >
          Ver planos →
        </Link>
      </div>
    );
  }

  // ── Trial normal ────────────────────────────────────────────────────────────
  if (assinatura.status === "trial" && diasRestantes !== null) {
    return (
      <div className="bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-violet-700 dark:text-violet-300 text-sm">
            <span className="font-semibold">
              {diasRestantes} dia{diasRestantes !== 1 ? "s" : ""} de teste restante{diasRestantes !== 1 ? "s" : ""}
            </span>
          </p>
          <p className="text-violet-500 dark:text-violet-400 text-xs">{usoTexto}</p>
        </div>
      </div>
    );
  }

  // ── Assinatura ativa — só mostra o uso do dia ───────────────────────────────
  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 mb-6">
      <p className="text-zinc-500 dark:text-zinc-400 text-xs">{usoTexto}</p>
    </div>
  );
}
