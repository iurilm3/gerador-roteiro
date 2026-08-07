import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') ?? 'https://api-sandbox.asaas.com/v3'
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: assinatura, error: erroBusca } = await supabaseAdmin
      .from('assinatura')
      .select('id, status, asaas_customer_id, asaas_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (erroBusca) {
      console.error('Erro ao buscar assinatura:', erroBusca)
      return json({ error: 'Erro ao buscar assinatura' }, 500)
    }

    if (!assinatura) {
      return json({ error: 'Nenhuma assinatura encontrada' }, 404)
    }

    if (assinatura.status === 'cancelada') {
      return json({ ok: true, message: 'Assinatura já estava cancelada' }, 200)
    }

    // ── Checkout ainda não pago: não existe assinatura no Asaas, só apaga local ──
    if (assinatura.status === 'aguardando_pagamento') {
      const { error: erroDelete } = await supabaseAdmin
        .from('assinatura')
        .delete()
        .eq('id', assinatura.id)

      if (erroDelete) return json({ error: 'Erro ao cancelar' }, 500)
      return json({ ok: true }, 200)
    }

    // ── Sem asaas_customer_id, não tem como confirmar o cancelamento real ──────
    if (!assinatura.asaas_customer_id) {
      console.error(
        'Assinatura sem asaas_customer_id, não é possível cancelar no Asaas. assinatura.id:',
        assinatura.id
      )
      return json(
        { error: 'Não foi possível confirmar o cancelamento junto ao sistema de pagamento. Entre em contato com o suporte.' },
        500
      )
    }

    // ── Descobre o ID da assinatura no Asaas, se ainda não tivermos salvo ──────
    let subscriptionId = assinatura.asaas_subscription_id

    if (!subscriptionId) {
      const buscaUrl = `${ASAAS_API_URL}/subscriptions?customer=${assinatura.asaas_customer_id}`
      const buscaResponse = await fetch(buscaUrl, {
        headers: { 'access_token': ASAAS_API_KEY },
      })
      const buscaData = await buscaResponse.json()

      console.log('Busca de assinatura no Asaas por customer:', {
        url: buscaUrl,
        status: buscaResponse.status,
        totalCount: buscaData?.totalCount,
        primeiroResultado: buscaData?.data?.[0] ?? null,
      })

      subscriptionId = buscaData?.data?.[0]?.id ?? null
    }

    // ── CRÍTICO: se não achou a assinatura real, não finge que cancelou ─────────
    // Sem isso, a pessoa acredita que está protegida quando na verdade a
    // cobrança automática continua agendada do lado do Asaas.
    if (!subscriptionId) {
      console.error(
        'Assinatura não encontrada no Asaas para cancelamento. asaas_customer_id:',
        assinatura.asaas_customer_id
      )
      return json(
        {
          error:
            'Não foi possível confirmar o cancelamento junto ao sistema de pagamento. Entre em contato com o suporte antes de considerar cancelado.',
        },
        500
      )
    }

    // ── Cancela no Asaas ─────────────────────────────────────────────────────
    const cancelResponse = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: { 'access_token': ASAAS_API_KEY },
    })

    if (!cancelResponse.ok) {
      const cancelErro = await cancelResponse.text()
      console.error('Erro ao cancelar assinatura no Asaas:', cancelErro)
      return json({ error: 'Erro ao cancelar assinatura no Asaas' }, 500)
    }

    // ── Só marca local como cancelada DEPOIS de confirmar sucesso no Asaas ─────
    const { error: erroUpdate } = await supabaseAdmin
      .from('assinatura')
      .update({ status: 'cancelada' })
      .eq('id', assinatura.id)

    if (erroUpdate) {
      console.error('Erro ao atualizar status local:', erroUpdate)
      return json({ error: 'Cancelado no Asaas, mas erro ao atualizar localmente. Contate o suporte.' }, 500)
    }

    return json({ ok: true }, 200)
  } catch (err) {
    console.error('Erro inesperado:', err)
    return json({ error: 'Erro inesperado' }, 500)
  }
})
