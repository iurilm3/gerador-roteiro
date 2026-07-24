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
            Para infoprodutoras
          </span>

          <h1 className="text-[2rem] font-bold text-zinc-50 leading-snug mb-4">
            Seu roteiro de vídeo,<br />no seu tom,<br />em 30 segundos.
          </h1>

          <p className="text-zinc-400 text-base leading-relaxed">
            Preencha seu perfil uma vez. Digite o tema do dia. Receba um roteiro pronto para gravar — sem hook engessado, sem clichê.
          </p>
        </div>

        <Link
          href="/login"
          className="block w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-center py-4 rounded-xl transition-colors text-base"
        >
          Entrar
        </Link>

        <p className="text-zinc-600 text-xs text-center mt-6">
          Acesso por convite — grupo fechado
        </p>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-zinc-700 text-xs">Rotex Master Ads · Protótipo</p>
      </footer>
    </div>
  );
}
