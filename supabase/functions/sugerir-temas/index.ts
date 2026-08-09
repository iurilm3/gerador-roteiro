import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "https://gerador-roteiro.pages.dev",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function erroJson(status: number, mensagem: string): Response {
  return new Response(
    JSON.stringify({ erro: mensagem }),
    { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } }
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: erroAuth } = await supabase.auth.getUser();
  if (erroAuth || !user) {
    return erroJson(401, "Sessão inválida. Faça login novamente.");
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from("perfil")
    .select("nicho, publico, produto")
    .single();

  if (erroPerfil || !perfil) {
    return erroJson(400, "Perfil não encontrado. Preencha seu perfil antes de pedir sugestões.");
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    return erroJson(500, "Configuração interna incompleta.");
  }

  const prompt = `Você é um estrategista de conteúdo digital especializado no nicho abaixo.

Nicho: ${perfil.nicho}
Público-alvo: ${perfil.publico}
Produto ou serviço: ${perfil.produto}

Sugira exatamente 5 temas para conteúdo no Instagram ou Facebook. Regras obrigatórias:
- Cada tema é uma frase afirmativa simples, máximo 12 palavras. Sem subtítulo, sem parênteses, sem dois-pontos, sem barra (/), sem "x" de comparação, sem colchetes.
- Frase única por tema — nunca duas ideias separadas por "ou", "x", "/" ou "vs" no mesmo tema.
- Misture temas evergreen com pelo menos 2 temas ligados a debates ou dúvidas que ciclicamente voltam a performar bem neste nicho.
- Cada tema deve ser específico o suficiente para gerar um roteiro direto — nada genérico.
- Sem numeração, sem bullet points, sem aspas, sem texto introdutório ou final.

Retorne APENAS os 5 temas, um por linha.`;

  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`;

  let geminiResp: Response;
  try {
    geminiResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 512 },
      }),
    });
  } catch {
    return erroJson(502, "Não foi possível conectar ao serviço de IA. Tente novamente.");
  }

  if (!geminiResp.ok) {
    return erroJson(502, "O serviço de IA retornou um erro. Tente novamente.");
  }

  const geminiData = await geminiResp.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const texto = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const temas = texto
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0)
    .slice(0, 5);

  if (temas.length === 0) {
    return erroJson(502, "Não conseguimos gerar sugestões. Tente novamente.");
  }

  return new Response(JSON.stringify({ temas }), {
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
});
