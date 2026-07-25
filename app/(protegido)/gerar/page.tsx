"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const OBJETIVOS = [
  { id: "descoberta",     label: "+ Seguidores",  descricao: "Alcançar pessoas novas" },
  { id: "relacionamento", label: "+ Interação",   descricao: "Conexão com quem já te segue" },
  { id: "conversao",      label: "+ Vendas",      descricao: "$$$ no caixa" },
  { id: "remarketing",    label: "+ Remarketing", descricao: "Quem viu mas não comprou" },
];

const TIPOS_TRAFEGO = [
  { id: "organico", label: "Orgânico", descricao: "Conteúdo espontâneo, sem impulsionamento" },
  { id: "pago",     label: "Pago",     descricao: "Anúncio, pode ser pra vendas, engajamento ou mensagens no direct" },
];

const FORMATOS = [
  { id: "reels",     label: "Reels",     descricao: "Vídeo vertical curto" },
  { id: "post",      label: "Post",      descricao: "Imagem estática" },
  { id: "carrossel", label: "Carrossel", descricao: "8 slides" },
];

// Roteiro de exemplo até a IA real entrar no Dia 9
const ROTEIRO_EXEMPLO = `Eu precisava te contar uma coisa sobre culpa materna que muita gente não fala.

Quando você grita, quando perde a paciência, quando passa o dia no automático — a culpa que vem depois não significa que você é uma mãe ruim. Significa que você se importa. Mãe que não liga não sente culpa.

O problema não é sentir culpa. O problema é quando ela fica parada, só te punindo, sem virar nada. Aí ela drena ao invés de construir.

O que eu aprendi depois de muito choro e muita conversa com Deus é isso: culpa que vira ação é graça. É o que separa a mãe que cresce da mãe que só sobrevive. Você não precisa ser perfeita. Precisa ser presente e honesta com você mesma.

Se esse peso está pesado demais, o guia devocional Enquanto Eles Crescem tem um capítulo inteiro que me ajudou a transformar culpa em propósito. O link está na bio.

Salva esse vídeo para quando você precisar lembrar que está fazendo melhor do que pensa.`;

export default function GerarPage() {
  const [objetivo, setObjetivo] = useState("relacionamento");
  const [tipo_trafego, setTipoTrafego] = useState("organico");
  const [formato, setFormato] = useState("reels");
  const [topico, setTopico] = useState("");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroPerfil, setErroPerfil] = useState(false);
  const router = useRouter();

  const pode_gerar = objetivo !== "" && tipo_trafego !== "" && formato !== "" && topico.trim() !== "";

  async function gerar() {
    if (gerando) return;
    setErro("");

    // Validação explícita campo a campo — recusa antes de tentar salvar
    if (!objetivo) {
      setErro("Escolha um objetivo antes de continuar.");
      return;
    }
    if (!tipo_trafego) {
      setErro("Escolha se o tráfego é orgânico ou pago antes de continuar.");
      return;
    }
    if (!formato) {
      setErro("Escolha o formato de entrega antes de continuar.");
      return;
    }
    if (!topico.trim()) {
      setErro("Escreva o tema do roteiro antes de continuar.");
      return;
    }

    setGerando(true);

    // Busca o perfil_id de quem está logado
    const { data: perfil, error: erroPerfil } = await supabase
      .from("perfil")
      .select("id, nicho")
      .single();

    if (erroPerfil) {
      // PGRST116 = nenhuma linha encontrada = perfil nunca foi preenchido
      if (erroPerfil.code === "PGRST116") {
        setErro("Você ainda não preencheu seu perfil. Preencha o perfil antes de gerar o primeiro roteiro.");
        setErroPerfil(true);
      } else {
        setErro("Não conseguimos verificar seu perfil. Verifique sua conexão e tente de novo.");
      }
      setGerando(false);
      return;
    }

    if (!perfil) {
      setErro("Você ainda não preencheu seu perfil. Preencha o perfil antes de gerar o primeiro roteiro.");
      setErroPerfil(true);
      setGerando(false);
      return;
    }

    // Salva o roteiro no banco (roteiro de exemplo até o Dia 9)
    const { error: erroRoteiro } = await supabase.from("roteiro").insert({
      perfil_id: perfil.id,
      objetivo,
      tipo_trafego,
      formato,
      topico,
      roteiro_gerado: ROTEIRO_EXEMPLO,
    });

    if (erroRoteiro) {
      setErro("Não foi possível salvar o roteiro. Verifique sua conexão e tente de novo.");
      setGerando(false);
      return;
    }

    router.push("/resultado");
  }

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-50 mb-1">Gerar roteiro</h1>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
        Escolha o objetivo e diga o tema. O roteiro chega em segundos.
      </p>

      {erro && (
        <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 mb-6">
          <p className="text-red-300 text-sm mb-2">{erro}</p>
          {erroPerfil && (
            <Link
              href="/perfil"
              className="inline-block text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
            >
              Preencher perfil agora →
            </Link>
          )}
        </div>
      )}

      {/* Objetivo */}
      <div className="mb-7">
        <p className="text-zinc-300 text-sm font-medium mb-3">
          Escolha o que você quer que sua audiência faça hoje{" "}
          <span className="text-violet-500">*</span>
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
                <p className={`font-semibold text-sm mb-1 ${ativo ? "text-violet-300" : "text-zinc-300"}`}>
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

      {/* Tipo de tráfego */}
      <div className="mb-7">
        <p className="text-zinc-300 text-sm font-medium mb-3">
          Tráfego orgânico ou pago?{" "}
          <span className="text-violet-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {TIPOS_TRAFEGO.map((t) => {
            const ativo = tipo_trafego === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTipoTrafego(t.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  ativo
                    ? "border-violet-500 bg-violet-950/40"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
                style={{ minHeight: "80px" }}
              >
                <p className={`font-semibold text-sm mb-1 ${ativo ? "text-violet-300" : "text-zinc-300"}`}>
                  {t.label}
                </p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {t.descricao}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formato */}
      <div className="mb-7">
        <p className="text-zinc-300 text-sm font-medium mb-3">
          Qual o formato de entrega?{" "}
          <span className="text-violet-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {FORMATOS.map((f) => {
            const ativo = formato === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFormato(f.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  ativo
                    ? "border-violet-500 bg-violet-950/40"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
                style={{ minHeight: "80px" }}
              >
                <p className={`font-semibold text-sm mb-1 ${ativo ? "text-violet-300" : "text-zinc-300"}`}>
                  {f.label}
                </p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {f.descricao}
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
