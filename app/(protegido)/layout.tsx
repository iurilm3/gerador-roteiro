"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProtegidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [verificando, setVerificando] = useState(true);
  const [emailUsuario, setEmailUsuario] = useState("");
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
          <Link
            href="/perfil"
            className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
          >
            Editar perfil
          </Link>
          {emailUsuario && (
            <span className="text-zinc-600 text-xs hidden sm:block truncate max-w-[140px]">
              {emailUsuario}
            </span>
          )}
          <button
            onClick={sair}
            className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo da página */}
      <main className="flex-1 w-full max-w-sm mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
