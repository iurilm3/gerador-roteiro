"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OBJETIVOS = [
  {
    id: "descoberta",
    label: "+ Seguidores",
    descricao: "Alcançar pessoas novas",
  },
  {
    id: "relacionamento",
    label: "+ Interação",
    descricao: "Conexão com quem já te segue",
  },
  {
    id: "conversao",
    label: "+ Vendas",
    descricao: "$$$ no caixa",
  },
  {
    id: "remarketing",
    label: "+ Remarketing",
    descricao: "Quem viu mas não comprou",
  },
];

export default function GerarPage() {
  const [objetivo, setObjetivo] = useState("relacionamento");
  const [topico, setTopico] = useState("culpa materna");
  const [gerando, setGerando] = useState(false);
  const router = useRouter();

  const pode_gerar = objetivo !== "" && topico.trim() !== "";

  function gerar() {
    if (!pode_gerar || gerando) return;
    setGerando(true);
    setTimeout(() => {
      router.push("/resultado");
    }, 2000);
  }

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-50 mb-1">Gerar roteiro</h1>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
        Escolha o objetivo e diga o tema. O roteiro chega em segundos.
      </p>

      {/* Objetivo */}
      <div className="mb-7">
        <p className="text-zinc-300 text-sm font-medium mb-3">
          Escolha o que você quer que sua audiência faça hoje <span className="text-violet-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {OBJETIVOS.map((obj) => {
            const ativo = objetivo === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => setObjetivo(obj.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  ativo
                    ? "border-violet-500 bg-violet-950/40"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
                style={{ minHeight: "80px" }}
              >
                <p
                  className={`font-semibold text-sm mb-1 ${
                    ativo ? "text-violet-300" : "text-zinc-300"
                  }`}
                >
                  {obj.label}
                </p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {obj.descricao}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tópico */}
      <div className="mb-8">
        <label className="block text-zinc-300 text-sm font-medium mb-1.5">
          Tema de hoje <span className="text-violet-500">*</span>
        </label>
        <input
          type="text"
          value={topico}
          onChange={(e) => setTopico(e.target.value)}
          placeholder="Ex: culpa materna"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base"
          style={{ minHeight: "44px" }}
        />
      </div>

      {/* Botão */}
      <button
        onClick={gerar}
        disabled={!pode_gerar || gerando}
        className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
        style={{ minHeight: "48px" }}
      >
        {gerando ? "Gerando seu roteiro..." : "Gerar roteiro"}
      </button>

      {gerando && (
        <p className="text-zinc-500 text-xs text-center mt-3 animate-pulse">
          Pode levar alguns segundos...
        </p>
      )}

      {!pode_gerar && !gerando && (
        <p className="text-zinc-500 text-xs text-center mt-3">
          Escolha um objetivo e escreva o tema para continuar.
        </p>
      )}
    </div>
  );
}
