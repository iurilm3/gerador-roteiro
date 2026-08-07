"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
  const pathname = usePathname();

  useEffect(() => {
    async function verificarAcesso() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setEmailUsuario(data.session.user.email ?? "");

      // /planos e /perfil ficam fora das verificações — evita loop de redirecionamento
      if (pathname === "/planos" || pathname === "/perfil") {
        setVerificando(false);
        return;
      }

      // Verifica se o usuário já tem ao menos uma linha na tabela assinatura
      const [{ count: countAssinatura }, { count: countPerfil }] = await Promise.all([
        supabase.from("assinatura").select("*", { count: "exact", head: true }),
        supabase.from("perfil").select("*", { count: "exact", head: true }),
      ]);

      if ((countAssinatura ?? 0) === 0) {
        router.replace("/planos");
        return;
      }

      if ((countPerfil ?? 0) === 0) {
        router.replace("/perfil");
        return;
      }

      setVerificando(false);
    }

    verificarAcesso();
  }, [router, pathname]);

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">Verificando acesso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-200/60 dark:border-zinc-800/60 px-6 py-4 flex items-center justify-between">
        <Link
          href="/gerar"
          className="text-violet-600 dark:text-violet-400 font-semibold text-sm tracking-widest uppercase cursor-pointer"
          style={{ textShadow: "0 0 12px rgba(139, 92, 246, 0.45)" }}
        >
          Rotex Master Ads
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={sair}
            className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 text-sm transition-colors"
          >
            Sair
          </button>

          <div className="relative group">
            <button
              onClick={() => setDrawerAberto(true)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors p-1"
              aria-label="Meus roteiros"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
            <span className="hidden sm:block absolute right-0 top-full mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Meus roteiros
            </span>
          </div>
        </div>
      </header>

      {drawerAberto && (
        <Drawer email={emailUsuario} fechar={() => setDrawerAberto(false)} />
      )}

      <main className="flex-1 w-full max-w-sm mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
