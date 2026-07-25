"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Drawer from "@/components/Drawer";

export default function ProtegidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [verificando, setVerificando] = useState(true);
  const [emailUsuario, setEmailUsuario] = useState("");
  const [drawerAberto, setDrawerAberto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setEmailUsuario(data.session.user.email ?? "");
        setVerificando(false);
      }
    });
  }, [router]);

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Verificando acesso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Cabeçalho fixo */}
      <header className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
        <span className="text-violet-400 font-semibold text-sm tracking-widest uppercase">
          Rotex Master Ads
        </span>

        <div className="flex items-center gap-4">
          <button
            onClick={sair}
            className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
          >
            Sair
          </button>

          {/* Ícone que abre o drawer */}
          <div className="relative group">
            <button
              onClick={() => setDrawerAberto(true)}
              className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
              aria-label="Meus roteiros"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
            {/* Tooltip desktop */}
            <span className="hidden sm:block absolute right-0 top-full mt-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Meus roteiros
            </span>
          </div>
        </div>
      </header>

      {/* Drawer lateral */}
      {drawerAberto && (
        <Drawer
          email={emailUsuario}
          fechar={() => setDrawerAberto(false)}
        />
      )}

      {/* Conteúdo da página */}
      <main className="flex-1 w-full max-w-sm mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
