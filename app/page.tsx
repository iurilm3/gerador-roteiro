import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="px-6 py-5 border-b border-zinc-800/60">
        <span className="text-violet-400 font-semibold text-sm tracking-widest uppercase">
          Rotex Master Ads
        </span>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 py-16 w-full max-w-sm mx-auto">
        <div className="mb-10">
          <span className="inline-block bg-violet-950/60 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full border border-violet-800/40 mb-6">
            Estratégia + Copy + Vendas
          </span>

          <ul className="space-y-4 mb-2">
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-0.5 shrink-0">▸</span>
              <p className="text-zinc-50 text-lg font-semibold leading-snug">
                Transforme ideias rasas em Reels e Carrosséis que convertem.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-0.5 shrink-0">▸</span>
              <p className="text-zinc-50 text-lg font-semibold leading-snug">
                Roteiros infinitos com o seu estilo.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-violet-400 mt-0.5 shrink-0">▸</span>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A única ferramenta que gera ganchos persuasivos, roteiros de Reels e carrosséis estratégicos alinhados à sua esteira de produtos em menos de 30 segundos.
              </p>
            </li>
          </ul>
        </div>

        <Link
          href="/login"
          className="block w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-center py-4 rounded-xl transition-colors text-base"
        >
          Entrar
        </Link>

        <p className="text-zinc-600 text-xs text-center mt-6">
          Teste grátis por 7 dias.
        </p>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-zinc-700 text-xs">Rotex Master Ads · Protótipo</p>
      </footer>
    </div>
  );
}
