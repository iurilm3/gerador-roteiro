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

  const prompt = `Escreva 5 temas para posts no Instagram. Um tema por linha. Sem números, sem travessões, sem explicações, sem texto antes ou depois.

Nicho: ${perfil.nicho}
Público: ${perfil.publico}
Produto: ${perfil.produto}

Os 5 temas (cada um em sua própria linha):
`;

  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`;

  let geminiResp: Response;
  try {
    geminiResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 400 },
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

  console.log("[sugerir-temas] resposta bruta:", JSON.stringify(texto));

  const temas = texto
    .split(/\n/)
    .map((l: string) =>
      l.replace(/^\s*[\d]+[.)]\s*/, "").replace(/^\s*[-*•]\s*/, "").replace(/\*\*/g, "").trim()
    )
    .filter((l: string) => l.length > 5)
    .slice(0, 5);

  console.log("[sugerir-temas] temas:", JSON.stringify(temas));

  if (temas.length === 0) {
    return erroJson(502, "Não conseguimos gerar sugestões. Tente novamente.");
  }

  return new Response(JSON.stringify({ temas }), {
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
});
