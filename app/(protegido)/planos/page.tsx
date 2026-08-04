'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Escolha pelo ritmo de criação</h1>
        <p className="text-neutral-400">7 dias grátis, sem cartão. Cancele quando quiser.</p>

        <div className="inline-flex items-center gap-1 mt-6 p-1 rounded-full bg-neutral-900 border border-neutral-800">
          <button
            onClick={() => setCiclo('mensal')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              ciclo === 'mensal' ? 'bg-white text-black' : 'text-neutral-400'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setCiclo('anual')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              ciclo === 'anual' ? 'bg-white text-black' : 'text-neutral-400'
            }`}
          >
            Anual — 2 meses grátis
          </button>
        </div>
      </div>

      {erro && (
        <div className="max-w-md mx-auto mb-6 text-center text-red-400 text-sm">{erro}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {(Object.entries(PLANOS) as [keyof typeof PLANOS, typeof PLANOS[keyof typeof PLANOS]][]).map(
          ([id, plano]) => {
            const preco = ciclo === 'mensal' ? plano.precoMensal : plano.precoAnual
            const sufixo = ciclo === 'mensal' ? '/mês' : '/ano'

            return (
              <div
                key={id}
                className={`relative rounded-2xl border p-6 ${
                  'popular' in plano && plano.popular
                    ? 'border-white bg-neutral-900'
                    : 'border-neutral-800'
                }`}
              >
                {'popular' in plano && plano.popular && (
                  <span className="absolute -top-3 left-6 bg-white text-black text-xs font-medium px-2 py-0.5 rounded-full">
                    Mais popular
                  </span>
                )}
                <h2 className="text-lg font-semibold mb-1">{plano.nome}</h2>
                <div className="mb-4">
                  <span className="text-3xl font-bold">R${preco}</span>
                  <span className="text-neutral-400 text-sm">{sufixo}</span>
                </div>
                <p className="text-sm text-neutral-400 mb-6">{plano.roteiros}</p>
                <button
                  onClick={() => escolherPlano(id)}
                  disabled={carregando !== null}
                  className="w-full py-2.5 rounded-lg bg-white text-black font-medium disabled:opacity-50"
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