"use client";

import { useState } from "react";
import Link from "next/link";

const ROTEIRO_EXEMPLO = `Eu precisava te contar uma coisa sobre culpa materna que muita gente não fala.

Quando você grita, quando perde a paciência, quando passa o dia no automático — a culpa que vem depois não significa que você é uma mãe ruim. Significa que você se importa. Mãe que não liga não sente culpa.

O problema não é sentir culpa. O problema é quando ela fica parada, só te punindo, sem virar nada. Aí ela drena ao invés de construir.

O que eu aprendi depois de muito choro e muita conversa com Deus é isso: culpa que vira ação é graça. É o que separa a mãe que cresce da mãe que só sobrevive. Você não precisa ser perfeita. Precisa ser presente e honesta com você mesma.

Se esse peso está pesado demais, o guia devocional Enquanto Eles Crescem tem um capítulo inteiro que me ajudou a transformar culpa em propósito. O link está na bio.

Salva esse vídeo para quando você precisar lembrar que está fazendo melhor do que pensa.`;

export default function ResultadoPage() {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(ROTEIRO_EXEMPLO).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <div className="pb-8">
      {/* Cabeçalho do resultado */}
      <div className="mb-6">
        <span className="inline-block bg-violet-950/60 text-violet-300 text-xs font-medium px-3 py-1 rounded-full border border-violet-800/40 mb-3">
          Relacionamento
        </span>
        <h1 className="text-xl font-bold text-zinc-50">culpa materna</h1>
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
          {ROTEIRO_EXEMPLO}
        </p>
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
