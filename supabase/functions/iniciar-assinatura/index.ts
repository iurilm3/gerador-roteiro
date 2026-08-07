import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') ?? 'https://api-sandbox.asaas.com/v3'
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!
const APP_URL = Deno.env.get('APP_URL') ?? 'https://gerador-roteiro.pages.dev'

const PLANOS = {
  starter: { nome: 'Starter', precoMensal: 47, precoAnual: 470, limiteRoteirosDia: 5 },
  pro: { nome: 'Pro', precoMensal: 97, precoAnual: 970, limiteRoteirosDia: 20 },
} as const

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function formatarDataAsaas(data: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())} ${pad(data.getHours())}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Não autenticado' }, 401)

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()
    if (userError || !user) return json({ error: 'Sessão inválida' }, 401)

    const { plano, ciclo } = await req.json()
    if (!['starter', 'pro'].includes(plano)) return json({ error: 'Plano inválido' }, 400)
    if (!['mensal', 'anual'].includes(ciclo)) return json({ error: 'Ciclo inválido' }, 400)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: existente } = await supabaseAdmin
      .from('assinatura')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existente) {
      return json({ error: 'Usuário já possui uma assinatura', status: existente.status }, 409)
    }

    const config = PLANOS[plano as keyof typeof PLANOS]
    const valor = ciclo === 'mensal' ? config.precoMensal : config.precoAnual
    const cycleAsaas = ciclo === 'mensal' ? 'MONTHLY' : 'YEARLY'

    const trialTerminaEm = new Date()
    trialTerminaEm.setDate(trialTerminaEm.getDate() + 7)
    const nextDueDate = formatarDataAsaas(trialTerminaEm)

    const { data: novaAssinatura, error: insertError } = await supabaseAdmin
      .from('assinatura')
      .insert({
        user_id: user.id,
        plano,
        ciclo,
        limite_roteiros_dia: config.limiteRoteirosDia,
        status: 'aguardando_pagamento',
        trial_termina_em: trialTerminaEm.toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar assinatura local:', insertError)
      return json({ error: 'Erro ao criar assinatura' }, 500)
    }

    const checkoutResponse = await fetch(`${ASAAS_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
        'User-Agent': 'RotexMasterAds',
      },
      body: JSON.stringify({
        billingTypes: ['CREDIT_CARD'],
        chargeTypes: ['RECURRENT'],
        minutesToExpire: 60,
        externalReference: novaAssinatura.id,
        callback: {
          successUrl: `${APP_URL}/dashboard?assinatura=sucesso`,
          cancelUrl: `${APP_URL}/planos?assinatura=cancelada`,
          expiredUrl: `${APP_URL}/planos?assinatura=expirada`,
        },
        items: [
          {
            name: `Rotex Master Ads - ${config.nome}`,
            description: `Assinatura ${ciclo} - plano ${config.nome}`,
            quantity: 1,
            value: valor,
          },
        ],
        subscription: {
          cycle: cycleAsaas,
          nextDueDate,
        },
      }),
    })

    const checkoutData = await checkoutResponse.json()

    if (!checkoutResponse.ok) {
      console.error('Erro ao criar checkout no Asaas:', checkoutData)
      await supabaseAdmin.from('assinatura').delete().eq('id', novaAssinatura.id)
      return json({ error: 'Erro ao criar checkout de pagamento' }, 500)
    }

    await supabaseAdmin
      .from('assinatura')
      .update({ asaas_checkout_id: checkoutData.id })
      .eq('id', novaAssinatura.id)

    return json({ checkoutUrl: checkoutData.link }, 200)
  } catch (err) {
    console.error('Erro inesperado:', err)
    return json({ error: 'Erro inesperado' }, 500)
  }
})
