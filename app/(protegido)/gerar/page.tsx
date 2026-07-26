"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const TIPOS_TRAFEGO = [
  { id: "organico", label: "Orgânico", descricao: "Conteúdo espontâneo, sem impulsionamento" },
  { id: "pago",     label: "Pago",     descricao: "Anúncio, pode ser pra vendas, engajamento ou mensagens no direct" },
];

const OBJETIVOS = [
  { id: "descoberta",     label: "+ Seguidores",  descricao: "Alcançar pessoas novas" },
  { id: "relacionamento", label: "+ Interação",   descricao: "Conexão com quem já te segue" },
  { id: "conversao",      label: "+ Vendas",      descricao: "$$$ no caixa" },
  { id: "remarketing",    label: "+ Remarketing", descricao: "Quem viu mas não comprou" },
];

const CATEGORIAS_MATRIZ = [
  { id: "urgencia_oculta", label: "Urgência Oculta", descricao: "Problema real que o público ainda não vê como urgente" },
  { id: "oportunidade",    label: "Oportunidade",    descricao: "Uma vantagem ou caminho que o público ainda não viu" },
  { id: "prontidao",       label: "Prontidão",       descricao: "Já sabe que precisa, falta empurrar pra decisão" },
];

function categoriasPorObjetivo(obj: string) {
  if (obj === "conversao" || obj === "remarketing") return CATEGORIAS_MATRIZ;
  return CATEGORIAS_MATRIZ.filter((c) => c.id !== "prontidao");
}

const SUBTEMAS_MATRIZ = [
  { id: "clickbait",        label: "Clickbait",        descricao: "Quebra de padrão pra tráfego frio" },
  { id: "sensacao",         label: "Sensação",          descricao: "Ativa gatilho emocional final" },
  { id: "mito",             label: "Mito",              descricao: "Derruba a crença limitante que travou a compra" },
  { id: "contraste",        label: "Contraste",         descricao: "Antes/depois reforça valor percebido" },
  { id: "prova",            label: "Prova",             descricao: "Sustenta autoridade" },
  { id: "dilema",           label: "Dilema",            descricao: "Força a escolha no momento de decisão" },
  { id: "visual",           label: "Visual",            descricao: "Reforço visual novo pra reengajar quem já viu o anúncio" },
  { id: "certo_vs_errado",  label: "Certo vs Errado",   descricao: "Posiciona a marca como autoridade" },
  { id: "apelo_emocional",  label: "Apelo Emocional",   descricao: "Constrói vínculo antes da venda" },
  { id: "comparacao",       label: "Comparação",        descricao: "Muda o ângulo pra quebrar a objeção nº 1" },
  { id: "curiosidade",      label: "Curiosidade",       descricao: "Gancho puro pra parar o scroll de público frio" },
  { id: "demonstracao",     label: "Demonstração",      descricao: "Mostra o mecanismo solução funcionando" },
  { id: "oportunidade",     label: "Oportunidade",      descricao: "Ativa urgência real, o reason why" },
  { id: "ultra_segmentado", label: "Ultra Segmentado",  descricao: "Fala direto com a dor específica de quem nunca viu a marca" },
  { id: "historia",         label: "História",           descricao: "Principal ferramenta de aquecimento via storytelling" },
  { id: "reflexao",         label: "Reflexão",           descricao: "Aprofunda identificação emocional" },
  { id: "explicacao",       label: "Explicação",         descricao: "Educa sobre um padrão que a audiência ainda não percebeu" },
  { id: "problema_solucao", label: "Problema/Solução",  descricao: "Estrutura direta ao mecanismo de solução" },
];

const FORMATOS = [
  { id: "reels",     label: "Reels",     descricao: "Vídeo vertical curto" },
  { id: "post",      label: "Post",      descricao: "Imagem estática" },
  { id: "carrossel", label: "Carrossel", descricao: "8 slides" },
  { id: "stories",   label: "Stories",   descricao: "Telas rápidas" },
];

const ROTEIRO_EXEMPLO = `Eu precisava te contar uma coisa sobre culpa materna que muita gente não fala.

Quando você grita, quando perde a paciência, quando passa o dia no automático — a culpa que vem depois não significa que você é uma mãe ruim. Significa que você se importa. Mãe que não liga não sente culpa.

O problema não é sentir culpa. O problema é quando ela fica parada, só te punindo, sem virar nada. Aí ela drena ao invés de construir.

O que eu aprendi depois de muito choro e muita conversa com Deus é isso: culpa que vira ação é graça. É o que separa a mãe que cresce da mãe que só sobrevive. Você não precisa ser perfeita. Precisa ser presente e honesta com você mesma.

Se esse peso está pesado demais, o guia devocional Enquanto Eles Crescem tem um capítulo inteiro que me ajudou a transformar culpa em propósito. O link está na bio.

Salva esse vídeo para quando você precisar lembrar que está fazendo melhor do que pensa.`;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Combobox de subtema com busca
function SubtemaCombobox({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selecionado = SUBTEMAS_MATRIZ.find((s) => s.id === valor);

  const filtrados = busca.trim()
    ? SUBTEMAS_MATRIZ.filter((s) =>
        normalizar(s.label).includes(normalizar(busca)) ||
        normalizar(s.descricao).includes(normalizar(busca))
      )
    : SUBTEMAS_MATRIZ;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setAberto(false); setBusca(""); }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function abrir() {
    setAberto(true);
    setBusca("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function selecionar(id: string) {
    onChange(id);
    setAberto(false);
    setBusca("");
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Campo fechado */}
      {!aberto ? (
        <button
          onClick={abrir}
          className="w-full flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-left transition-colors hover:border-violet-400 focus:outline-none focus:border-violet-500"
          style={{ minHeight: "44px" }}
        >
          <svg className="shrink-0 text-zinc-400 dark:text-zinc-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {selecionado ? (
            <span className="text-zinc-900 dark:text-zinc-50 text-sm font-medium">{selecionado.label}</span>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-600 text-sm">Buscar subtema... (ex: Clickbait, Prova, Contraste)</span>
          )}
        </button>
      ) : (
        /* Campo de busca aberto */
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-violet-500 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4" style={{ minHeight: "44px" }}>
            <svg className="shrink-0 text-violet-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar subtema..."
              className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none py-3"
            />
          </div>

          {/* Lista de resultados */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 overflow-y-auto" style={{ maxHeight: "260px" }}>
            {filtrados.length === 0 ? (
              <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-4">
                Nenhum subtema encontrado.
              </p>
            ) : (
              filtrados.map((s) => {
                const ativo = valor === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => selecionar(s.id)}
                    className={`w-full text-left px-4 py-3 transition-colors border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 ${
                      ativo
                        ? "bg-violet-50 dark:bg-violet-950/30"
                        : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <p className={`text-sm font-medium ${ativo ? "text-violet-700 dark:text-violet-300" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">
                      {s.descricao}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GerarPage() {
  const [tipo_trafego, setTipoTrafego] = useState("organico");
  const [topico, setTopico] = useState("");
  const [objetivo, setObjetivo] = useState("relacionamento");
  const [categoria_matriz, setCategoriaMatriz] = useState("urgencia_oculta");
  const [subtema_matriz, setSubtemaMatriz] = useState("clickbait");
  const [formato, setFormato] = useState("reels");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroPerfil, setErroPerfil] = useState(false);
  const router = useRouter();

  const pode_gerar =
    tipo_trafego !== "" && topico.trim() !== "" && objetivo !== "" &&
    categoria_matriz !== "" && subtema_matriz !== "" && formato !== "";

  function handleObjetivo(novo: string) {
    setObjetivo(novo);
    const disponiveis = categoriasPorObjetivo(novo).map((c) => c.id);
    if (!disponiveis.includes(categoria_matriz)) setCategoriaMatriz("urgencia_oculta");
  }

  async function gerar() {
    if (gerando) return;
    setErro("");
    setErroPerfil(false);

    if (!tipo_trafego)     { setErro("Escolha se o tráfego é orgânico ou pago antes de continuar."); return; }
    if (!topico.trim())    { setErro("Escreva o tema do roteiro antes de continuar."); return; }
    if (!objetivo)         { setErro("Escolha um objetivo antes de continuar."); return; }
    if (!categoria_matriz) { setErro("Escolha a categoria da Matriz de Ângulos antes de continuar."); return; }
    if (!subtema_matriz)   { setErro("Escolha o subtema da Matriz de Ângulos antes de continuar."); return; }
    if (!formato)          { setErro("Escolha o formato de entrega antes de continuar."); return; }

    setGerando(true);

    const { data: perfil, error: erroPerfil_ } = await supabase
      .from("perfil").select("id, nicho").single();

    if (erroPerfil_) {
      if (erroPerfil_.code === "PGRST116") {
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

    const { error: erroRoteiro } = await supabase.from("roteiro").insert({
      perfil_id: perfil.id,
      tipo_trafego, objetivo, topico,
      categoria_matriz, subtema_matriz, formato,
      roteiro_gerado: ROTEIRO_EXEMPLO,
    });

    if (erroRoteiro) {
      setErro("Não foi possível salvar o roteiro. Verifique sua conexão e tente de novo.");
      setGerando(false);
      return;
    }

    router.push("/resultado");
  }

  const cardAtivo    = "border-violet-500 bg-violet-100/60 dark:bg-violet-950/40";
  const cardInativo  = "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700";
  const labelAtivo   = "text-violet-700 dark:text-violet-300";
  const labelInativo = "text-zinc-700 dark:text-zinc-300";

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Gerar roteiro</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
        Preencha cada etapa e o roteiro chega em segundos.
      </p>

      {erro && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 mb-6">
          <p className="text-red-700 dark:text-red-300 text-sm mb-2">{erro}</p>
          {erroPerfil && (
            <Link href="/perfil" className="inline-block text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors underline underline-offset-2">
              Preencher perfil agora →
            </Link>
          )}
        </div>
      )}

      {/* 1. Tráfego */}
      <Section titulo="Tráfego orgânico ou pago?">
        <div className="grid grid-cols-2 gap-3">
          {TIPOS_TRAFEGO.map((t) => (
            <CardOpcao key={t.id} ativo={tipo_trafego === t.id} onClick={() => setTipoTrafego(t.id)}
              label={t.label} descricao={t.descricao}
              cardAtivo={cardAtivo} cardInativo={cardInativo} labelAtivo={labelAtivo} labelInativo={labelInativo} />
          ))}
        </div>
      </Section>

      {/* 2. Tema */}
      <div className="mb-7">
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-3">
          Tema de hoje <span className="text-violet-500">*</span>
        </p>
        <input
          type="text"
          value={topico}
          onChange={(e) => setTopico(e.target.value)}
          placeholder="Ex: culpa materna"
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base"
          style={{ minHeight: "44px" }}
        />
      </div>

      {/* 3. Objetivo */}
      <Section titulo="O que você quer que sua audiência faça hoje?">
        <div className="grid grid-cols-2 gap-3">
          {OBJETIVOS.map((obj) => (
            <CardOpcao key={obj.id} ativo={objetivo === obj.id} onClick={() => handleObjetivo(obj.id)}
              label={obj.label} descricao={obj.descricao}
              cardAtivo={cardAtivo} cardInativo={cardInativo} labelAtivo={labelAtivo} labelInativo={labelInativo} />
          ))}
        </div>
      </Section>

      {/* 4. Categoria da Matriz — cards menores */}
      <Section titulo="Qual o ângulo do roteiro?">
        <div className={`grid gap-2 ${categoriasPorObjetivo(objetivo).length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {categoriasPorObjetivo(objetivo).map((c) => {
            const ativo = categoria_matriz === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategoriaMatriz(c.id)}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all w-full h-full ${ativo ? cardAtivo : cardInativo}`}
              >
                <p className={`font-semibold text-sm mb-1 ${ativo ? labelAtivo : labelInativo}`}>
                  {c.label}
                </p>
                <p className="text-xs leading-snug text-zinc-400 dark:text-zinc-500">{c.descricao}</p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 5. Subtema — combobox com busca */}
      <Section titulo="Qual o subtema?">
        <SubtemaCombobox valor={subtema_matriz} onChange={setSubtemaMatriz} />
      </Section>

      {/* 6. Formato */}
      <Section titulo="Qual o formato de entrega?">
        <div className="grid grid-cols-2 gap-3">
          {FORMATOS.map((f) => (
            <CardOpcao key={f.id} ativo={formato === f.id} onClick={() => setFormato(f.id)}
              label={f.label} descricao={f.descricao}
              cardAtivo={cardAtivo} cardInativo={cardInativo} labelAtivo={labelAtivo} labelInativo={labelInativo} />
          ))}
        </div>
      </Section>

      {/* Botão */}
      <button
        onClick={gerar}
        disabled={!pode_gerar || gerando}
        className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
        style={{ minHeight: "48px" }}
      >
        {gerando ? "Gerando seu roteiro..." : "Gerar roteiro"}
      </button>

      {gerando && (
        <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center mt-3 animate-pulse">
          Pode levar alguns segundos...
        </p>
      )}
      {!pode_gerar && !gerando && (
        <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center mt-3">
          Preencha todas as etapas para continuar.
        </p>
      )}
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-3">
        {titulo} <span className="text-violet-500">*</span>
      </p>
      {children}
    </div>
  );
}

function CardOpcao({ ativo, onClick, label, descricao, cardAtivo, cardInativo, labelAtivo, labelInativo }: {
  ativo: boolean; onClick: () => void;
  label: string; descricao: string;
  cardAtivo: string; cardInativo: string;
  labelAtivo: string; labelInativo: string;
}) {
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all ${ativo ? cardAtivo : cardInativo}`}
      style={{ minHeight: "80px" }}>
      <p className={`font-semibold text-sm mb-1 ${ativo ? labelAtivo : labelInativo}`}>{label}</p>
      <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">{descricao}</p>
    </button>
  );
}
