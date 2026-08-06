'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PLANOS = {
  starter: {
    nome: 'Starter',
    precoMensal: 47,
    precoAnual: 470,
    roteiros: '5 roteiros por dia',
  },
  pro: {
    nome: 'Pro',
    precoMensal: 97,
    precoAnual: 970,
    roteiros: 'Roteiros ilimitados',
    popular: true,
  },
} as const

export default function PlanosPage() {
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal')
  const [carregando, setCarregando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const assinaturaCancelada = searchParams.get('assinatura') === 'cancelada'

  async function escolherPlano(plano: 'starter' | 'pro') {
    setErro(null)
    setCarregando(plano)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase.functions.invoke('iniciar-assinatura', {
      body: { plano, ciclo },
    })

    setCarregando(null)

    if (error) {
      setErro('Não foi possível iniciar o trial. Tenta de novo em instantes.')
      return
    }

    if (data?.error) {
      if (data.error === 'Usuário já possui uma assinatura') {
        router.push('/dashboard')
        return
      }
      setErro(data.error)
      return
    }

    window.location.href = data.checkoutUrl
  }

  return (
    <div className="pb-12">
      {/* Cabeçalho */}
      <div className="text-center mb-10">
        <h1
          className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2"
          style={{ textShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
        >
          Escolha pelo ritmo de criação
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          7 dias grátis, sem cartão. Cancele quando quiser.
        </p>

        {/* Toggle mensal / anual */}
        <div className="inline-flex items-center gap-1 mt-6 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setCiclo('mensal')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              ciclo === 'mensal'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setCiclo('anual')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              ciclo === 'anual'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            Anual — 2 meses grátis
          </button>
        </div>
      </div>

      {/* Assinatura cancelada */}
      {assinaturaCancelada && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 mb-6">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm text-center">
            Sua assinatura foi cancelada. Escolha um novo plano quando quiser voltar.
          </p>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 mb-6">
          <p className="text-red-700 dark:text-red-300 text-sm text-center">{erro}</p>
        </div>
      )}

      {/* Cards de plano */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(Object.entries(PLANOS) as [keyof typeof PLANOS, typeof PLANOS[keyof typeof PLANOS]][]).map(
          ([id, plano]) => {
            const preco = ciclo === 'mensal' ? plano.precoMensal : plano.precoAnual
            const sufixo = ciclo === 'mensal' ? '/mês' : '/ano'
            const isPopular = 'popular' in plano && plano.popular

            return (
              <div
                key={id}
                className={`relative rounded-2xl border p-6 transition-all ${
                  isPopular
                    ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-5 bg-violet-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                    Mais popular
                  </span>
                )}

                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                  {plano.nome}
                </h2>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    R${preco}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm">{sufixo}</span>
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                  {plano.roteiros}
                </p>

                <button
                  onClick={() => escolherPlano(id)}
                  disabled={carregando !== null}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                >
                  {carregando === id ? 'Iniciando...' : 'Começar teste grátis'}
                </button>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}
