"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXEMPLO = {
  nome_ou_marca: "Jhonielly Oliveira",
  nicho: "Maternidade cristã",
  publico: "Mães cristãs com filhos pequenos (0 a 10 anos)",
  produto: "Guia devocional Enquanto Eles Crescem",
  tom_de_voz: "Acolhedor, direto e sem academicismo — como uma amiga que entende",
  preferencias_estilo:
    "Gosto de fala direta e conversacional, sem hook engessado, sem trend, sem clichê de copywriter. Prefiro começar pelo sentimento real, não por uma pergunta retórica.",
  cta_principal: "Salva esse vídeo para quando você precisar",
};

type Campos = typeof EXEMPLO;
type CampoKey = keyof Campos;

const OBRIGATORIOS: CampoKey[] = [
  "nicho",
  "publico",
  "produto",
  "tom_de_voz",
  "preferencias_estilo",
];

export default function PerfilPage() {
  const [dados, setDados] = useState<Campos>(EXEMPLO);
  const router = useRouter();

  const tudo_preenchido = OBRIGATORIOS.every(
    (k) => dados[k].trim() !== ""
  );

  function atualizar(campo: CampoKey, valor: string) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function salvar() {
    if (!tudo_preenchido) return;
    router.push("/gerar");
  }

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-zinc-50 mb-1">Seu perfil</h1>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
        Preencha uma vez. O roteiro vai nascer daqui — cada campo vai direto
        para a IA.
      </p>

      <div className="space-y-5">
        <Campo
          label="Nome ou marca"
          dica="opcional"
          placeholder="Ex: Jhonielly Oliveira"
          value={dados.nome_ou_marca}
          onChange={(v) => atualizar("nome_ou_marca", v)}
        />

        <Campo
          label="Nicho"
          placeholder="Ex: maternidade cristã"
          value={dados.nicho}
          onChange={(v) => atualizar("nicho", v)}
          obrigatorio
        />

        <Campo
          label="Para quem você fala"
          placeholder="Ex: mães cristãs com filhos pequenos"
          value={dados.publico}
          onChange={(v) => atualizar("publico", v)}
          obrigatorio
        />

        <Campo
          label="Seu produto principal"
          placeholder="Ex: guia devocional Enquanto Eles Crescem"
          value={dados.produto}
          onChange={(v) => atualizar("produto", v)}
          obrigatorio
        />

        <Campo
          label="Seu tom de voz"
          placeholder="Ex: acolhedor, direto, sem academicismo"
          value={dados.tom_de_voz}
          onChange={(v) => atualizar("tom_de_voz", v)}
          obrigatorio
        />

        <Campo
          label="Como você prefere falar"
          placeholder="Ex: gosto de fala direta, sem hook engessado, sem trend"
          value={dados.preferencias_estilo}
          onChange={(v) => atualizar("preferencias_estilo", v)}
          linhas={3}
          obrigatorio
        />

        <Campo
          label="CTA principal"
          dica="opcional"
          placeholder="Ex: salva esse vídeo para quando você precisar"
          value={dados.cta_principal}
          onChange={(v) => atualizar("cta_principal", v)}
        />
      </div>

      <button
        onClick={salvar}
        disabled={!tudo_preenchido}
        className="w-full mt-8 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
        style={{ minHeight: "48px" }}
      >
        Salvar e continuar →
      </button>

      {!tudo_preenchido && (
        <p className="text-zinc-500 text-xs text-center mt-3">
          Preencha os campos obrigatórios (*) para continuar.
        </p>
      )}
    </div>
  );
}

function Campo({
  label,
  placeholder,
  value,
  onChange,
  obrigatorio = false,
  dica,
  linhas = 1,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  obrigatorio?: boolean;
  dica?: string;
  linhas?: number;
}) {
  const base =
    "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-zinc-300 text-sm font-medium">{label}</label>
        {obrigatorio && (
          <span className="text-violet-500 text-xs">*</span>
        )}
        {dica && <span className="text-zinc-600 text-xs">{dica}</span>}
      </div>

      {linhas > 1 ? (
        <textarea
          rows={linhas}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} py-3 resize-none`}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
          style={{ minHeight: "44px" }}
        />
      )}
    </div>
  );
}
