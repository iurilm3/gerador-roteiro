export type SubtemaMatriz = {
  id: string;
  label: string;
  descricao: string;
};

export const SUBTEMAS_MATRIZ: SubtemaMatriz[] = [
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
