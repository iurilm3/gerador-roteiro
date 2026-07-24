"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [clicado, setClicado] = useState(false);
  const router = useRouter();

  function handleEntrar() {
    setClicado(true);
    setTimeout(() => {
      router.push("/perfil");
    }, 1500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="px-6 py-5 border-b border-zinc-800/60">
        <Link
          href="/"
          className="text-violet-400 font-semibold text-sm tracking-widest uppercase"
        >
          Rotex Master Ads
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 py-16 w-full max-w-sm mx-auto">
        {/* Aviso de protótipo */}
        <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl px-4 py-3 mb-8">
          <p className="text-amber-300 text-sm">
            <span className="font-semibold">Dia 5 →</span> Login real com
            e-mail entra no Dia 5. Por hoje, clique em Entrar para explorar o
            protótipo.
          </p>
        </div>

        <h1 className="text-2xl font-bold text-zinc-50 mb-2">Entrar</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Digite seu e-mail e enviaremos um link de acesso direto — sem senha.
        </p>

        <div className="mb-4">
          <label className="block text-zinc-400 text-sm font-medium mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base"
            style={{ minHeight: "44px" }}
          />
        </div>

        <button
          onClick={handleEntrar}
          disabled={clicado}
          className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors text-base mt-2"
        >
          {clicado ? "Acessando..." : "Receber link de acesso"}
        </button>

        <Link
          href="/"
          className="block text-center text-zinc-500 text-sm mt-6 hover:text-zinc-400 transition-colors"
        >
          ← Voltar
        </Link>
      </main>
    </div>
  );
}
