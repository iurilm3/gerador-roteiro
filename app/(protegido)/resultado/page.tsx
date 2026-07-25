"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const LABELS_OBJETIVO: Record<string, string> = {
  descoberta:     "+ Seguidores",
  relacionamento: "+ Interação",
  conversao:      "+ Vendas",
  remarketing:    "+ Remarketing",
};

const STATUS_OPCOES: { valor: string; label: string }[] = [
  { valor: "rascunho",  label: "Rascunho" },
  { valor: "aprovado",  label: "Aprovado" },
  { valor: "publicado", label: "Publicado" },
];

type Roteiro = {
  id: string;
  objetivo: string;
  topico: string;
  roteiro_gerado: string;
  tipo_trafego: string;
  formato: string;
  status: string;
  criado_em: string;
};

export default function ResultadoPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [roteiro, setRoteiro] = useState<Roteiro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [erroStatus, setErroStatus] = useState("");
  const [sucessoStatus, setSucessoStatus] = useState("");

  const buscar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    let query = supabase.from("roteiro").select("*");

    if (id) {
      query = query.eq("id", id);
    } else {
      // Sem id: busca o mais recente
      query = query.order("criado_em", { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      setErro("Roteiro não encontrado.");
    } else {
      setRoteiro(data);
    }
    setCarregando(false);
  }, [id]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  function copiar() {
    if (!roteiro) return;
    navigator.clipboard.writeText(roteiro.roteiro_gerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  async function mudarStatus(novoStatus: string) {
    if (!roteiro || salvandoStatus) return;
    if (novoStatus === roteiro.status) return;

    setSalvandoStatus(true);
    setErroStatus("");
    setSucessoStatus("");

    const { error } = await supabase
      .from("roteiro")
      .update({ status: novoStatus })
      .eq("id", roteiro.id);

    if (error) {
      setErroStatus("Não foi possível salvar o status. Tente de novo.");
    } else {
      setRoteiro((r) => r ? { ...r, status: novoStatus } : r);
      const labelNovo = STATUS_OPCOES.find((s) => s.valor === novoStatus)?.label ?? novoStatus;
      setSucessoStatus(`Status atualizado para "${labelNovo}".`);
      setTimeout(() => setSucessoStatus(""), 3000);
    }
    setSalvandoStatus(false);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500 text-sm">Carregando roteiro...</p>
      </div>
    );
  }

  if (erro || !roteiro) {
    return (
      <div className="pb-8">
        <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-300 text-sm mb-2">
            {erro || "Nenhum roteiro encontrado."}
          </p>
          <button
            onClick={buscar}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
          >
            Tentar de novo
          </button>
        </div>
        <Link
          href="/gerar"
          className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 rounded-xl transition-colors text-base"
          style={{ minHeight: "48px", lineHeight: "48px" }}
        >
          Gerar meu primeiro roteiro
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Cabeçalho do resultado */}
      <div className="mb-6">
        <span className="inline-block bg-violet-950/60 text-violet-300 text-xs font-medium px-3 py-1 rounded-full border border-violet-800/40 mb-3">
          {LABELS_OBJETIVO[roteiro.objetivo] ?? roteiro.objetivo}
        </span>
        <h1 className="text-xl font-bold text-zinc-50">{roteiro.topico}</h1>
      </div>

      {/* Aviso de protótipo */}
      <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl px-4 py-3 mb-6">
        <p className="text-amber-300 text-xs">
          <span className="font-semibold">Dia 9 →</span> A IA real entra no
          Dia 9. Este é um roteiro de exemplo para você ver como ficará.
        </p>
      </div>

      {/* O roteiro */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <p className="text-zinc-200 text-base leading-[1.85] whitespace-pre-wrap">
          {roteiro.roteiro_gerado}
        </p>
      </div>

      {/* Controle de status */}
      <div className="mb-5">
        <p className="text-zinc-500 text-xs mb-2">Status do roteiro</p>
        <div className="flex gap-2">
          {STATUS_OPCOES.map((s) => {
            const ativo = roteiro.status === s.valor;
            return (
              <button
                key={s.valor}
                onClick={() => mudarStatus(s.valor)}
                disabled={salvandoStatus}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  ativo
                    ? "border-violet-500 bg-violet-950/40 text-violet-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Feedback de status */}
        {erroStatus && (
          <p className="text-red-300 text-xs mt-2">{erroStatus}</p>
        )}
        {sucessoStatus && (
          <p className="text-emerald-400 text-xs mt-2">{sucessoStatus}</p>
        )}
      </div>

      {/* Botões */}
      <div className="space-y-3">
        <button
          onClick={copiar}
          className={`w-full font-semibold py-4 rounded-xl transition-all text-base border ${
            copiado
              ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-300"
              : "bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
          }`}
          style={{ minHeight: "48px" }}
        >
          {copiado ? "Copiado! ✓" : "Copiar roteiro"}
        </button>

        <Link
          href="/gerar"
          className="block w-full text-center border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 font-medium py-4 rounded-xl transition-colors text-base"
          style={{ minHeight: "48px", lineHeight: "1" }}
        >
          <span className="flex items-center justify-center h-full">
            Gerar de novo
          </span>
        </Link>
      </div>
    </div>
  );
}
