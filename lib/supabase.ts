import { createClient } from "@supabase/supabase-js";

// Endereço do projeto Supabase e chave pública.
// NEXT_PUBLIC_ permite que o Next.js exponha essas variáveis
// no navegador — seguro porque o RLS protege os dados no banco.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);
