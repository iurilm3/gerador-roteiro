"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SUBTEMAS_MATRIZ } from "@/lib/matriz";
import BannerAssinatura from "@/components/BannerAssinatura";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

const FORMATOS = [
  { id: "reels",     label: "Reels",     descricao: "Vídeo vertical curto" },
  { id: "post",      label: "Post",      descricao: "Imagem estática" },
  { id: "carrossel", label: "Carrossel", descricao: "8 slides" },
  { id: "stories",   label: "Stories",   descricao: "Telas rápidas" },
];

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

type OpcaoCombobox = { id: string; label: string; descricao: string };

function Combobox({
  opcoes,
  valor,
  onChange,
  placeholder,
}: {
  opcoes: OpcaoCombobox[];
  valor: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selecionado = opcoes.find((s) => s.id === valor);

  const filtrados = busca.trim()
    ? opcoes.filter((s) =>
        normalizar(s.label).includes(normalizar(busca)) ||
        normalizar(s.descricao).includes(normalizar(busca))
      )
    : opcoes;

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

  const IconeLupa = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );

  return (
    <div ref={containerRef} className="relative">
      {!aberto ? (
        <button
          onClick={abrir}
          className="w-full flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-left transition-colors hover:border-violet-400 focus:outline-none focus:border-violet-500"
          style={{ minHeight: "44px" }}
        >
          <span className="shrink-0 text-zinc-400 dark:text-zinc-500"><IconeLupa /></span>
          {selecionado ? (
            <span className="text-zinc-900 dark:text-zinc-50 text-sm font-medium">{selecionado.label}</span>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-600 text-sm">{placeholder}</span>
          )}
        </button>
      ) : (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-violet-500 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4" style={{ minHeight: "44px" }}>
            <span className="shrink-0 text-violet-400"><IconeLupa /></span>
            <input
              ref={inputRef}
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none py-3"
            />
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 overflow-y-auto" style={{ maxHeight: "260px" }}>
            {filtrados.length === 0 ? (
              <p className="text-zinc-400 dark:text-zinc-600 text-sm text-center py-4">
                Nenhuma opção encontrada.
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

  const [cta_especifico, setCtaEspecifico] = useState("");

  // Estados de sugestão de temas
  const [sugerindo, setSugerindo]       = useState(false);
  const [sugestoes, setSugestoes]       = useState<string[]>([]);
  const [erroSugestao, setErroSugestao] = useState(false);

  // Estados de geração e revisão
  const [gerando, setGerando]           = useState(false);
  const [progresso, setProgresso]       = useState(0);
  const [salvando, setSalvando]         = useState(false);
  const [etapa, setEtapa]               = useState<"formulario" | "revisando">("formulario");
  const [roteiroGerado, setRoteiroGerado] = useState("");
  const [erro, setErro]                 = useState("");
  const [erroPerfil, setErroPerfil]     = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const obj      = searchParams.get("objetivo");
    const sub      = searchParams.get("subtema");
    const duplicar = searchParams.get("duplicar");

    if (obj && OBJETIVOS.some((o) => o.id === obj)) setObjetivo(obj);
    if (sub && SUBTEMAS_MATRIZ.some((s) => s.id === sub)) setSubtemaMatriz(sub);

    if (duplicar) {
      supabase
        .from("roteiro")
        .select("tipo_trafego, objetivo, topico, categoria_matriz, subtema_matriz, formato")
        .eq("id", duplicar)
        .single()
        .then(({ data }) => {
          if (!data) return;
          if (data.tipo_trafego) setTipoTrafego(data.tipo_trafego);
          if (data.objetivo && OBJETIVOS.some((o) => o.id === data.objetivo)) setObjetivo(data.objetivo);
          if (data.topico)   setTopico(data.topico);
          if (data.categoria_matriz) setCategoriaMatriz(data.categoria_matriz);
          if (data.subtema_matriz && SUBTEMAS_MATRIZ.some((s) => s.id === data.subtema_matriz)) setSubtemaMatriz(data.subtema_matriz);
          if (data.formato)  setFormato(data.formato);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gerando) {
      setProgresso(0);
      return;
    }
    setProgresso(0);
    const inicio = Date.now();
    const duracao = 18_000; // avança até 90% em 18 segundos
    const timer = setInterval(() => {
      const decorrido = Date.now() - inicio;
      const pct = Math.min(90, (decorrido / duracao) * 90);
      setProgresso(pct);
      if (pct >= 90) clearInterval(timer);
    }, 150);
    return () => clearInterval(timer);
  }, [gerando]);

  async function sugerirTemas() {
    if (sugerindo) return;
    setSugerindo(true);
    setSugestoes([]);
    setErroSugestao(false);

    const { data, error } = await supabase.functions.invoke("sugerir-temas");

    setSugerindo(false);

    if (error || !data?.temas?.length) {
      setErroSugestao(true);
      return;
    }
    setSugestoes((data.temas as string[]).slice(0, 3));
  }

  const pode_gerar =
    tipo_trafego !== "" && topico.trim() !== "" && objetivo !== "" &&
    categoria_matriz !== "" && subtema_matriz !== "" && formato !== "";

  function handleObjetivo(novo: string) {
    setObjetivo(novo);
    const disponiveis = categoriasPorObjetivo(novo).map((c) => c.id);
    if (!disponiveis.includes(categoria_matriz)) setCategoriaMatriz("urgencia_oculta");
  }

  // ── Chama a Edge Function e exibe o roteiro para revisão ──────────────────
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

    // Pega o token de sessão — necessário para autenticar na Edge Function
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setErro("Sessão expirada. Faça login novamente.");
      setGerando(false);
      return;
    }

    let resp: Response;
    try {
      resp = await fetch(`${SUPABASE_URL}/functions/v1/gerar-roteiro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          tipo_trafego, objetivo, topico: topico.trim(),
          categoria_matriz, subtema_matriz, formato,
          cta_especifico: cta_especifico.trim(),
        }),
      });
    } catch {
      setErro("Sem conexão com o servidor. Verifique sua internet e tente novamente.");
      setGerando(false);
      return;
    }

    if (!resp.ok) {
      // Erros da função chegam como JSON { erro: "mensagem" }
      const corpo = await resp.json().catch(() => ({})) as { erro?: string };
      setErro(corpo.erro ?? "Não foi possível gerar o roteiro. Tente novamente.");
      setGerando(false);
      return;
    }

    const texto = await resp.text();
    if (!texto.trim()) {
      setErro("O roteiro veio vazio. Tente novamente.");
      setGerando(false);
      return;
    }

    setRoteiroGerado(texto.trim());
    setEtapa("revisando");
    setGerando(false);
  }

  // ── Salva o roteiro aprovado no banco e redireciona ───────────────────────
  async function salvar() {
    if (salvando) return;
    setSalvando(true);
    setErro("");

    const { data: perfil, error: erroPerfil_ } = await supabase
      .from("perfil").select("id, nicho").single();

    if (erroPerfil_) {
      if (erroPerfil_.code === "PGRST116") {
        setErro("Você ainda não preencheu seu perfil. Preencha o perfil antes de salvar o roteiro.");
        setErroPerfil(true);
      } else {
        setErro("Não conseguimos verificar seu perfil. Verifique sua conexão e tente de novo.");
      }
      setSalvando(false);
      return;
    }

    if (!perfil) {
      setErro("Você ainda não preencheu seu perfil. Preencha o perfil antes de salvar o roteiro.");
      setErroPerfil(true);
      setSalvando(false);
      return;
    }

    const { error: erroRoteiro } = await supabase.from("roteiro").insert({
      perfil_id: perfil.id,
      tipo_trafego, objetivo, topico: topico.trim(),
      categoria_matriz, subtema_matriz, formato,
      roteiro_gerado: roteiroGerado,
    });

    if (erroRoteiro) {
      setErro("Não foi possível salvar o roteiro. Verifique sua conexão e tente de novo.");
      setSalvando(false);
      return;
    }

    router.push("/resultado");
  }

  const cardAtivo    = "border-violet-500 bg-violet-100/60 dark:bg-violet-950/40";
  const cardInativo  = "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700";
  const labelAtivo   = "text-violet-700 dark:text-violet-300";
  const labelInativo = "text-zinc-700 dark:text-zinc-300";

  // ── Tela de revisão do roteiro gerado ────────────────────────────────────
  if (etapa === "revisando") {
    return (
      <div className="pb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Seu roteiro</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
          Leia, ajuste se quiser e salve quando estiver pronto.
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

        <textarea
          value={roteiroGerado}
          onChange={(e) => setRoteiroGerado(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-4 text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed focus:outline-none focus:border-violet-500 transition-colors resize-none mb-6"
          style={{ minHeight: "340px" }}
        />

        <button
          onClick={salvar}
          disabled={salvando || !roteiroGerado.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base mb-3"
          style={{ minHeight: "48px" }}
        >
          {salvando ? "Salvando..." : "Salvar roteiro"}
        </button>

        <button
          onClick={() => { setEtapa("formulario"); setErro(""); setErroPerfil(false); }}
          disabled={salvando}
          className="w-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300 font-semibold py-4 rounded-xl transition-colors text-base"
          style={{ minHeight: "48px" }}
        >
          Gerar de novo
        </button>
      </div>
    );
  }

  // ── Formulário de geração ─────────────────────────────────────────────────
  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Gerar roteiro</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-5 leading-relaxed">
        Preencha cada etapa e o roteiro chega em segundos.
      </p>

      <BannerAssinatura />

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
          onChange={(e) => { setTopico(e.target.value); setSugestoes([]); }}
          placeholder="Qual o assunto de hoje? Seja específico(a)."
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base"
          style={{ minHeight: "44px" }}
        />

        {sugestoes.length === 0 && (
          <div className="mt-2">
            <button
              onClick={sugerirTemas}
              disabled={sugerindo}
              className="text-xs text-violet-500 dark:text-violet-400 hover:text-violet-400 dark:hover:text-violet-300 disabled:opacity-50 transition-colors"
            >
              {sugerindo ? "Buscando ideias..." : "Está sem ideia hoje? Clique aqui e eu te ajudo"}
            </button>
            {erroSugestao && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Não conseguimos buscar sugestões. Tente de novo.
              </p>
            )}
          </div>
        )}

        {sugestoes.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {sugestoes.map((tema, i) => (
              <button
                key={i}
                onClick={() => { setTopico(tema); setSugestoes([]); }}
                className="text-left w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-500 rounded-xl px-4 py-3 text-zinc-800 dark:text-zinc-200 text-sm transition-colors"
              >
                {tema}
              </button>
            ))}
            <button
              onClick={() => setSugestoes([])}
              className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-500 transition-colors mt-1"
            >
              Fechar sugestões
            </button>
          </div>
        )}
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

      {/* 4. Categoria da Matriz */}
      <Section titulo="Qual o ângulo do roteiro?">
        <Combobox
          opcoes={categoriasPorObjetivo(objetivo)}
          valor={categoria_matriz}
          onChange={setCategoriaMatriz}
          placeholder="Buscar ângulo... (ex: Urgência, Oportunidade)"
        />
      </Section>

      {/* 5. Subtema */}
      <Section titulo="Qual o subtema?">
        <Combobox
          opcoes={SUBTEMAS_MATRIZ}
          valor={subtema_matriz}
          onChange={setSubtemaMatriz}
          placeholder="Buscar subtema... (ex: Clickbait, Prova, Contraste)"
        />
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

      {/* 7. CTA específico (opcional) */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">CTA específico</p>
          <span className="text-zinc-400 dark:text-zinc-600 text-xs">opcional</span>
        </div>
        <input
          type="text"
          value={cta_especifico}
          onChange={(e) => setCtaEspecifico(e.target.value)}
          placeholder="Ex: salva esse vídeo para quando você precisar"
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base"
          style={{ minHeight: "44px" }}
        />
        <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-2 leading-relaxed">
          Se preenchido, substitui a lógica automática de CTA por objetivo.
        </p>
      </div>

      {/* Erro + Botão */}
      {erro && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm mb-2">{erro}</p>
          {erroPerfil && (
            <Link href="/perfil" className="inline-block text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors underline underline-offset-2">
              Preencher perfil agora →
            </Link>
          )}
        </div>
      )}

      <button
        onClick={gerar}
        disabled={!pode_gerar || gerando}
        className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
        style={{ minHeight: "48px" }}
      >
        {gerando ? "Gerando seu roteiro..." : "Gerar roteiro"}
      </button>

      {gerando && (
        <div className="mt-4">
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-150 ease-linear"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs text-center mt-3 leading-relaxed">
            Gerando seu roteiro... isso pode levar até 20 segundos
          </p>
        </div>
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
