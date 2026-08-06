"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


type Dados = {
  nome_ou_marca: string;
  nicho: string;
  publico: string;
  produto: string;
  tom_de_voz: string;
  preferencias_estilo: string;
};

const VAZIO: Dados = {
  nome_ou_marca: "",
  nicho: "",
  publico: "",
  produto: "",
  tom_de_voz: "",
  preferencias_estilo: "",
};

const OBRIGATORIOS: (keyof Dados)[] = [
  "nicho",
  "publico",
  "produto",
  "tom_de_voz",
  "preferencias_estilo",
];

export default function PerfilPage() {
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [assinaturaStatus, setAssinaturaStatus] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState("");
  const router = useRouter();

  const tudo_preenchido = OBRIGATORIOS.every((k) => dados[k].trim() !== "");

  useEffect(() => {
    async function carregar() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const [{ data, error }, { data: ass }] = await Promise.all([
        supabase.from("perfil").select("*").single(),
        supabase.from("assinatura").select("status").single(),
      ]);

      if (data) {
        setPerfilId(data.id);
        setDados({
          nome_ou_marca: data.nome_ou_marca ?? "",
          nicho: data.nicho ?? "",
          publico: data.publico ?? "",
          produto: data.produto ?? "",
          tom_de_voz: data.tom_de_voz ?? "",
          preferencias_estilo: data.preferencias_estilo ?? "",
        });
      }
      if (error && error.code !== "PGRST116") {
        setErro("Não conseguimos carregar seu perfil. Tente recarregar a página.");
      }
      if (ass) setAssinaturaStatus(ass.status);
      setCarregando(false);
    }
    carregar();
  }, []);

  async function cancelarAssinatura() {
    const confirmado = window.confirm(
      "Tem certeza que quer cancelar sua assinatura? Essa ação não pode ser desfeita e seu acesso será interrompido imediatamente."
    );
    if (!confirmado) return;

    setErroCancelamento("");
    setCancelando(true);

    const { error } = await supabase.functions.invoke("cancelar-assinatura");

    setCancelando(false);

    if (error) {
      setErroCancelamento("Não foi possível cancelar sua assinatura. Tente de novo em instantes.");
      return;
    }

    router.push("/planos?assinatura=cancelada");
  }

  async function salvar() {
    if (!tudo_preenchido || salvando) return;
    setErro("");
    setSucesso(false);
    setSalvando(true);

    let erro_supabase = null;

    if (perfilId) {
      const { error } = await supabase.from("perfil").update(dados).eq("id", perfilId);
      erro_supabase = error;
    } else {
      const { data, error } = await supabase.from("perfil").insert(dados).select("id").single();
      erro_supabase = error;
      if (data) setPerfilId(data.id);
    }

    if (erro_supabase) {
      setErro("Não foi possível salvar. Verifique sua conexão e tente de novo.");
    } else {
      setSucesso(true);
      setTimeout(() => router.push("/gerar"), 800);
    }
    setSalvando(false);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Seu perfil</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
        Preencha uma vez. O roteiro vai nascer daqui — cada campo vai direto
        para a IA.
      </p>

      {erro && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 mb-6">
          <p className="text-red-700 dark:text-red-300 text-sm">{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3 mb-6">
          <p className="text-emerald-700 dark:text-emerald-300 text-sm">Perfil salvo! Indo para a geração...</p>
        </div>
      )}

      <div className="space-y-5">
        <Campo label="Nome ou marca" dica="opcional" placeholder="Ex: Carlos Drummond Finanças"
          value={dados.nome_ou_marca} onChange={(v) => setDados((p) => ({ ...p, nome_ou_marca: v }))} />
        <Campo label="Nicho" placeholder="Ex: educação financeira para autônomos e freelancers"
          value={dados.nicho} onChange={(v) => setDados((p) => ({ ...p, nicho: v }))} obrigatorio />
        <Campo label="Para quem você fala" placeholder="Ex: autônomos e freelancers de 28 a 45 anos que ganham bem mas vivem no aperto por falta de organização financeira"
          value={dados.publico} onChange={(v) => setDados((p) => ({ ...p, publico: v }))} obrigatorio />
        <Campo label="Seu produto principal" placeholder='Ex: curso "Do Caos ao Controle", planilha "Fluxo Sem Susto", mentoria "Liberdade em 90 Dias"'
          value={dados.produto} onChange={(v) => setDados((p) => ({ ...p, produto: v }))} obrigatorio />
        <Campo label="Seu tom de voz" placeholder="Ex: direto, prático, sem jargão de mercado financeiro, tom de mentor que já passou pelo aperto"
          value={dados.tom_de_voz} onChange={(v) => setDados((p) => ({ ...p, tom_de_voz: v }))} obrigatorio />
        <Campo label="Como você prefere falar" placeholder="Ex: nunca linguagem genérica nem promessa de enriquecimento rápido. Sempre exemplo concreto de número e situação real, tom de conversa entre amigos que puxam a real um pro outro"
          value={dados.preferencias_estilo} onChange={(v) => setDados((p) => ({ ...p, preferencias_estilo: v }))} linhas={3} obrigatorio />
      </div>

      <button
        onClick={salvar}
        disabled={!tudo_preenchido || salvando}
        className="w-full mt-8 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
        style={{ minHeight: "48px" }}
      >
        {salvando ? "Salvando..." : "Salvar e continuar →"}
      </button>

      {!tudo_preenchido && !salvando && (
        <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center mt-3">
          Preencha os campos obrigatórios (*) para continuar.
        </p>
      )}

      {assinaturaStatus !== null && assinaturaStatus !== "cancelada" && (
        <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          {erroCancelamento && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-700 dark:text-red-300 text-sm">{erroCancelamento}</p>
            </div>
          )}
          <button
            onClick={cancelarAssinatura}
            disabled={cancelando}
            className="w-full py-3 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {cancelando ? "Cancelando..." : "Cancelar assinatura"}
          </button>
        </div>
      )}
    </div>
  );
}

function Campo({
  label, placeholder, value, onChange, obrigatorio = false, dica, linhas = 1,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; obrigatorio?: boolean; dica?: string; linhas?: number;
}) {
  const base =
    "w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">{label}</label>
        {obrigatorio && <span className="text-violet-500 text-xs">*</span>}
        {dica && <span className="text-zinc-400 dark:text-zinc-600 text-xs">{dica}</span>}
      </div>
      {linhas > 1 ? (
        <textarea rows={linhas} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} className={`${base} py-3 resize-none`} />
      ) : (
        <input type="text" placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} className={base} style={{ minHeight: "44px" }} />
      )}
    </div>
  );
}
