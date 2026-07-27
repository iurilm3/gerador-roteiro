"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";

const OBJETIVOS = [
  { id: "descoberta",     label: "+ Seguidores" },
  { id: "relacionamento", label: "+ Interação" },
  { id: "conversao",      label: "+ Vendas" },
  { id: "remarketing",    label: "+ Remarketing" },
];

const STATUS_BADGE: Record<string, { label: string; classe: string }> = {
  rascunho:  { label: "Rascunho",  classe: "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  aprovado:  { label: "Aprovado",  classe: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  publicado: { label: "Publicado", classe: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
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
  const { tema, toggleTema } = useTheme();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroDrawer, setErroDrawer] = useState(false);
  const [busca, setBusca] = useState("");
  const [secaoAberta, setSecaoAberta] = useState<Record<string, boolean>>({
    descoberta: false,
    relacionamento: false,
    conversao: false,
    remarketing: false,
  });
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        fechar();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [fechar]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [fechar]);

  useEffect(() => {
    buscarRoteiros();
  }, []);

  async function buscarRoteiros() {
    setCarregando(true);
    setErroDrawer(false);
    const { data, error } = await supabase
      .from("roteiro")
      .select("id, objetivo, topico, status, criado_em")
      .order("criado_em", { ascending: false });
    if (error) {
      setErroDrawer(true);
      setCarregando(false);
      return;
    }
    const lista = data ?? [];
    setRoteiros(lista);
    if (lista.length > 0) {
      setSecaoAberta((prev) => ({ ...prev, [lista[0].objetivo]: true }));
    }
    setCarregando(false);
  }

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
      {/* Overlay */}
      <div className="fixed inset-0 z-20 bg-black/50" aria-hidden="true" />

      {/* Painel lateral */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 z-30 h-full w-full max-w-xs sm:max-w-sm bg-zinc-50 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl"
      >
        {/* Topo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-[160px]">{email}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTema}
              className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
              aria-label={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              title={tema === "dark" ? "Tema claro" : "Tema escuro"}
            >
              {tema === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button
              onClick={fechar}
              className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-lg leading-none"
              aria-label="Fechar painel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Botão novo roteiro */}
        <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <Link
            href="/gerar"
            onClick={fechar}
            className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <span className="text-lg leading-none">+</span>
            Novo roteiro
          </Link>
        </div>

        {/* Link painel */}
        <div className="px-4 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <Link
            href="/painel"
            onClick={fechar}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Painel do dia
          </Link>
        </div>

        {/* Campo de busca */}
        <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por tema..."
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
          />
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {carregando ? (
            <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center py-10">
              Carregando roteiros...
            </p>
          ) : erroDrawer ? (
            <div className="text-center py-10 px-4">
              <p className="text-red-600 dark:text-red-300 text-sm mb-3">
                Não conseguimos carregar seus roteiros.
              </p>
              <button
                onClick={buscarRoteiros}
                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors underline underline-offset-2"
              >
                Tentar de novo
              </button>
            </div>
          ) : roteiros.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-1">Nenhum roteiro ainda.</p>
              <p className="text-zinc-400 dark:text-zinc-600 text-xs">
                Clique em "+ Novo roteiro" para criar o primeiro.
              </p>
            </div>
          ) : (
            OBJETIVOS.map((obj) => {
              const grupo = roteiros_filtrados.filter((r) => r.objetivo === obj.id);
              if (grupo.length === 0) return null;
              const aberta = secaoAberta[obj.id];

              return (
                <div key={obj.id} className="mb-1">
                  <button
                    onClick={() => toggleSecao(obj.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      {obj.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 dark:text-zinc-600 text-xs">{grupo.length}</span>
                      <span
                        className="text-zinc-400 dark:text-zinc-600 text-xs transition-transform duration-200"
                        style={{ display: "inline-block", transform: aberta ? "rotate(0deg)" : "rotate(-90deg)" }}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  {aberta && (
                    <div className="ml-1">
                      {grupo.map((r) => {
                        const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.rascunho;
                        return (
                          <button
                            key={r.id}
                            onClick={() => abrirRoteiro(r.id)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-2 group"
                          >
                            <span className="text-zinc-700 dark:text-zinc-300 text-sm leading-snug group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors truncate">
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

          {!carregando && roteiros.length > 0 && roteiros_filtrados.length === 0 && (
            <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center py-10">
              Nenhum roteiro com esse tema.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
