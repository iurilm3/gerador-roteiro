import Link from "next/link";

export default function ProtegidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Faixa de protótipo */}
      <div className="bg-amber-950/40 border-b border-amber-800/30 px-4 py-2.5 text-center">
        <p className="text-amber-300 text-xs">
          <span className="font-semibold">Modo protótipo</span> — Login real
          entra no Dia 5. Navegando como convidada.
        </p>
      </div>

      {/* Cabeçalho fixo */}
      <header className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
        <span className="text-violet-400 font-semibold text-sm tracking-widest uppercase">
          Rotex Master Ads
        </span>
        <Link
          href="/perfil"
          className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
        >
          Editar perfil
        </Link>
      </header>

      {/* Conteúdo da página */}
      <main className="flex-1 w-full max-w-sm mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
