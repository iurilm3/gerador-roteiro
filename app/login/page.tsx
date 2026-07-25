"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function traduzErro(mensagem: string): string {
  if (mensagem.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (mensagem.includes("User already registered"))
    return "Este e-mail já tem uma conta. Clique em Entrar.";
  if (mensagem.includes("Password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (mensagem.includes("Unable to validate email address"))
    return "E-mail inválido. Verifique e tente de novo.";
  if (mensagem.includes("Email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  return "Algo deu errado. Tente novamente.";
}

export default function LoginPage() {
  const [modo, setModo] = useState<"entrar" | "cadastro">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    setErro("");
    setConfirmacao("");
    if (!email || !senha) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }
    setCarregando(true);

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro(traduzErro(error.message));
      } else {
        router.push("/perfil");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password: senha });
      if (error) {
        setErro(traduzErro(error.message));
      } else {
        setConfirmacao(
          "Conta criada! Verifique seu e-mail para confirmar antes de entrar."
        );
      }
    }
    setCarregando(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <header className="px-6 py-5 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <Link
          href="/"
          className="text-violet-600 dark:text-violet-400 font-semibold text-sm tracking-widest uppercase"
        >
          Rotex Master Ads
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 py-16 w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
          {modo === "entrar"
            ? "Acesse com seu e-mail e senha."
            : "Preencha os dados para criar sua conta."}
        </p>

        {erro && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-700 dark:text-red-300 text-sm">{erro}</p>
          </div>
        )}

        {confirmacao && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3 mb-5">
            <p className="text-emerald-700 dark:text-emerald-300 text-sm">{confirmacao}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors text-base"
              style={{ minHeight: "44px" }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={carregando}
          className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base"
          style={{ minHeight: "48px" }}
        >
          {carregando
            ? modo === "entrar" ? "Entrando..." : "Criando conta..."
            : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center mt-6">
          {modo === "entrar" ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => {
              setModo(modo === "entrar" ? "cadastro" : "entrar");
              setErro("");
              setConfirmacao("");
            }}
            className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors"
          >
            {modo === "entrar" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </main>
    </div>
  );
}
