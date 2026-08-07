import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN')!
const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') ?? 'https://api-sandbox.asaas.com/v3'
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!

async function buscarClientePorEmail(email: string): Promise<string | null> {
  const url = `${ASAAS_API_URL}/customers?email=${encodeURIComponent(email)}`
  const resposta = await fetch(url, { headers: { 'access_token': ASAAS_API_KEY } })
  const dados = await resposta.json()
  console.log('Busca de cliente por e-mail no Asaas:', {
    status: resposta.status,
    totalCount: dados?.totalCount,
    id: dados?.data?.[0]?.id ?? null,
  })
  return dados?.data?.[0]?.id ?? null
}

Deno.serve(async (req) => {
  try {
    const tokenRecebido = req.headers.get('asaas-access-token')
    if (tokenRecebido !== ASAAS_WEBHOOK_TOKEN) {
      console.error('Webhook com token inválido ou ausente')
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 })
    }

    const payload = await req.json()
    const evento = payload.event

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Eventos de Checkout (trial começando) ──────────────────────────────
    const checkout = payload.checkout
    if (checkout?.id) {
      if (evento === 'CHECKOUT_PAID') {
        // Busca a linha local pelo checkout.id, pra saber de qual usuário é
        const { data: assinaturaExistente } = await supabaseAdmin
          .from('assinatura')
          .select('id, user_id')
          .eq('asaas_checkout_id', checkout.id)
          .eq('status', 'aguardando_pagamento')
          .maybeSingle()

        if (!assinaturaExistente) {
          console.error('CHECKOUT_PAID sem assinatura correspondente:', checkout.id)
          return new Response(JSON.stringify({ ok: true }), { status: 200 })
        }

        // checkout.customer quase sempre vem null — busca pelo e-mail do
        // usuário no nosso próprio banco em vez de depender desse campo
        let customerId: string | null = checkout.customer ?? null

        if (!customerId) {
          const { data: usuario } = await supabaseAdmin.auth.admin.getUserById(
            assinaturaExistente.user_id
          )
          if (usuario?.user?.email) {
            customerId = await buscarClientePorEmail(usuario.user.email)
          }
        }

        const { error } = await supabaseAdmin
          .from('assinatura')
          .update({
            status: 'trial',
            asaas_customer_id: customerId,
          })
          .eq('id', assinaturaExistente.id)

        if (error) console.error('Erro ao ativar trial via webhook:', error)
      }

      if (evento === 'CHECKOUT_CANCELED' || evento === 'CHECKOUT_EXPIRED') {
        const { error } = await supabaseAdmin
          .from('assinatura')
          .delete()
          .eq('asaas_checkout_id', checkout.id)
          .eq('status', 'aguardando_pagamento')

        if (error) console.error('Erro ao limpar checkout cancelado/expirado:', error)
      }
    }

    // ── Eventos de Cobrança (ciclo pós-trial) ───────────────────────────────
    // Correlaciona por customer, buscado de forma confiável no CHECKOUT_PAID
    // acima (mais simples que depender de externalReference, que não
    // propaga do checkout pra assinatura/cobrança do lado do Asaas).
    const payment = payload.payment
    if (payment?.customer) {
      if (evento === 'PAYMENT_CONFIRMED') {
        const dadosParaAtualizar: Record<string, unknown> = { status: 'ativa' }
        if (payment.subscription) dadosParaAtualizar.asaas_subscription_id = payment.subscription

        const { error } = await supabaseAdmin
          .from('assinatura')
          .update(dadosParaAtualizar)
          .eq('asaas_customer_id', payment.customer)
          .in('status', ['trial', 'ativa', 'atrasada'])

        if (error) console.error('Erro ao ativar assinatura via webhook:', error)
      }

      if (evento === 'PAYMENT_OVERDUE') {
        const { error } = await supabaseAdmin
          .from('assinatura')
          .update({ status: 'atrasada' })
          .eq('asaas_customer_id', payment.customer)
          .in('status', ['trial', 'ativa'])

        if (error) console.error('Erro ao marcar assinatura atrasada via webhook:', error)
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('Erro inesperado no webhook:', err)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }
})
