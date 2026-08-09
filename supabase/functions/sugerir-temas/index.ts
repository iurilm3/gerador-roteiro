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

  const prompt = `Você é um estrategista de conteúdo digital. Gere exatamente 5 sugestões de tema para posts no Instagram, baseadas no perfil abaixo.

Nicho: ${perfil.nicho}
Público: ${perfil.publico}
Produto: ${perfil.produto}

Cada sugestão deve ser um assunto completamente diferente das outras — como se fossem temas para 5 dias distintos da semana. Varie entre: um problema que o público enfrenta, uma crença comum que merece ser questionada, um resultado ou transformação possível, e temas relevantes do nicho.

Responda APENAS com um array JSON válido contendo exatamente 5 strings. Sem texto antes, sem texto depois, sem markdown, sem bloco de código. Exemplo do formato esperado:
["Tema um aqui", "Tema dois aqui", "Tema três aqui", "Tema quatro aqui", "Tema cinco aqui"]`;

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
  console.log("[sugerir-temas] resposta bruta:", JSON.stringify(texto));

  // Extrai o array JSON da resposta — remove possível markdown ```json ... ```
  const jsonStr = texto.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  let temas: string[] = [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      temas = parsed.map((t: unknown) => String(t).trim()).filter((t) => t.length > 0).slice(0, 5);
    }
  } catch {
    // fallback: tenta parsear linha a linha se o JSON falhar
    temas = texto
      .split(/\n+/)
      .map((l: string) => l.replace(/^\s*[\d]+[.)]\s*/, "").replace(/^\s*[-*•"]\s*/,"").replace(/"/g,"").trim())
      .filter((l: string) => l.length > 8)
      .slice(0, 5);
  }

  console.log("[sugerir-temas] temas parseados:", JSON.stringify(temas));

  if (temas.length === 0) {
    return erroJson(502, "Não conseguimos gerar sugestões. Tente novamente.");
  }

  return new Response(JSON.stringify({ temas }), {
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
});
