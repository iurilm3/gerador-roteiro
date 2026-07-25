"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const OBJETIVOS = [
  { id: "descoberta",     label: "+ Seguidores" },
  { id: "relacionamento", label: "+ Interação" },
  { id: "conversao",      label: "+ Vendas" },
  { id: "remarketing",    label: "+ Remarketing" },
];

const STATUS_BADGE: Record<string, { label: string; classe: string }> = {
  rascunho:  { label: "Rascunho",  classe: "bg-zinc-800 text-zinc-400" },
  aprovado:  { label: "Aprovado",  classe: "bg-violet-950/60 text-violet-300" },
  publicado: { label: "Publicado", classe: "bg-emerald-950/60 text-emerald-300" },
};

type Roteiro = {
  id: string;
  objetivo: string;
  topico: string;
  status: string;
  criado_em: string;
};

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type Props = {
  email: string;
  fechar: () => void;
};

export default function Drawer({ email, fechar }: Props) {
  const router = useRouter();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [secaoAberta, setSecaoAberta] = useState<Record<string, boolean>>({
    descoberta: true,
    relacionamento: true,
    conversao: true,
    remarketing: true,
  });
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora do painel
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        fechar();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [fechar]);

  // Fecha com Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [fechar]);

  // Busca roteiros ao abrir
  useEffect(() => {
    async function buscarRoteiros() {
      const { data } = await supabase
        .from("roteiro")
        .select("id, objetivo, topico, status, criado_em")
        .order("criado_em", { ascending: false });
      setRoteiros(data ?? []);
      setCarregando(false);
    }
    buscarRoteiros();
  }, []);

  const termoBusca = normalizar(busca);

  const roteiros_filtrados = termoBusca
    ? roteiros.filter((r) => normalizar(r.topico).includes(termoBusca))
    : roteiros;

  function abrirRoteiro(id: string) {
    fechar();
    router.push(`/resultado?id=${id}`);
  }

  function toggleSecao(id: string) {
    setSecaoAberta((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      {/* Overlay escuro atrás do painel */}
      <div className="fixed inset-0 z-20 bg-black/50" aria-hidden="true" />

      {/* Painel lateral */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 z-30 h-full w-full max-w-xs sm:max-w-sm bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl"
      >
        {/* Topo do drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <span className="text-zinc-400 text-xs truncate max-w-[200px]">{email}</span>
          <button
            onClick={fechar}
            className="text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
            aria-label="Fechar painel"
          >
            ✕
          </button>
        </div>

        {/* Botão novo roteiro */}
        <div className="px-4 py-3 border-b border-zinc-800/60">
          <Link
            href="/gerar"
            onClick={fechar}
            className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <span className="text-lg leading-none">+</span>
            Novo roteiro
          </Link>
        </div>

        {/* Campo de busca */}
        <div className="px-4 py-3 border-b border-zinc-800/60">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por tema..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
          />
        </div>

        {/* Lista de roteiros */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {carregando ? (
            <p className="text-zinc-500 text-sm text-center py-10">
              Carregando roteiros...
            </p>
          ) : roteiros.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-zinc-400 text-sm mb-1">Nenhum roteiro ainda.</p>
              <p className="text-zinc-600 text-xs">
                Clique em "+ Novo roteiro" para criar o primeiro.
              </p>
            </div>
          ) : (
            OBJETIVOS.map((obj) => {
              const grupo = roteiros_filtrados.filter(
                (r) => r.objetivo === obj.id
              );
              if (grupo.length === 0) return null;
              const aberta = secaoAberta[obj.id];

              return (
                <div key={obj.id} className="mb-1">
                  {/* Cabeçalho da seção */}
                  <button
                    onClick={() => toggleSecao(obj.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors group"
                  >
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      {obj.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 text-xs">{grupo.length}</span>
                      <span className="text-zinc-600 text-xs transition-transform duration-200" style={{ display: "inline-block", transform: aberta ? "rotate(0deg)" : "rotate(-90deg)" }}>
                        ▾
                      </span>
                    </div>
                  </button>

                  {/* Roteiros da seção */}
                  {aberta && (
                    <div className="ml-1">
                      {grupo.map((r) => {
                        const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.rascunho;
                        return (
                          <button
                            key={r.id}
                            onClick={() => abrirRoteiro(r.id)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-900 transition-colors flex items-start justify-between gap-2 group"
                          >
                            <span className="text-zinc-300 text-sm leading-snug group-hover:text-zinc-100 transition-colors truncate">
                              {r.topico}
                            </span>
                            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full mt-0.5 ${badge.classe}`}>
                              {badge.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Busca sem resultado */}
          {!carregando && roteiros.length > 0 && roteiros_filtrados.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-10">
              Nenhum roteiro com esse tema.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
