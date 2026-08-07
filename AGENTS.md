# Contrato de trabalho — Gerador de Roteiro

Leia este arquivo toda vez que abrir este projeto. Obedeça sem precisar ser lembrado.

---

## COMO VOCÊ TRABALHA COMIGO

- Eu nunca programei. Explique tudo em português claro, com acentuação correta, sem jargão. Se usar um termo técnico, explique na hora.
- Antes de escrever qualquer código, explique o plano em português e espere eu concordar.
- Construa em passos pequenos. A cada passo, diga o que eu vou ver na tela.
- Se der erro, explique a causa em português antes de corrigir, porque eu quero aprender junto.
- Nunca faça mais do que eu pedi. Se achar que falta algo, sugira e espere eu decidir.
- Se faltar informação, pergunte. Não invente.

---

## COMO A GENTE DECIDE O QUE FAZER COM CÓDIGO E O QUE FAZER COM IA

- Use inteligência artificial só onde uma regra fixa não resolve o problema.
- Tudo o que é regra clara vira código comum, que roda igual toda vez, sem custo e sem surpresa.

---

## REGRA DE SEGREDO E DE CELULAR

- Nenhuma chave secreta, senha ou token dentro do código que vai para o navegador do usuário. Segredo vive no servidor. Isso já está configurado: o projeto usa Next.js com a lógica de IA rodando no servidor (API route), nunca no navegador.
- Tudo tem que funcionar primeiro no celular.

---

## O PROJETO

- A especificação completa do que estamos construindo está em `ESPEC.md`. Leia antes de propor qualquer coisa.
- O projeto já está publicado em **https://gerador-roteiro.pages.dev** usando Next.js, conectado ao GitHub, com deploy automático pelo Cloudflare Pages.
- Não é necessário criar index.html, configurar Git, GitHub ou Cloudflare — isso já está pronto.
- A chave da API (`GEMINI_API_KEY`) já está configurada no Cloudflare Pages e no arquivo `.env.local` local (que não vai para o GitHub).

---

## ACESSO AO SUPABASE E REGRAS DE DEPLOY

A partir de 07/08/2026, o Claude Code tem acesso direto à conta do Supabase via token de API — pode tecnicamente fazer deploy de qualquer Edge Function sozinho. Antes disso, todo deploy era manual (Iuri colava o código no editor web do Supabase).

### Regra obrigatória antes de qualquer deploy

**Nunca fazer deploy de nenhuma Edge Function sem pedir confirmação explícita antes** — mesmo que o código já tenha sido editado e commitado no Git.

Fluxo correto:
1. Explicar exatamente o que vai mudar (diferença entre o código publicado e o novo)
2. Perguntar diretamente: **"Posso fazer o deploy agora?"** e esperar resposta explícita
3. Nunca presumir consentimento implícito — editar e commitar **não é** autorização pra publicar

### Atenção redobrada nas três funções de pagamento

`iniciar-assinatura`, `asaas-webhook` e `cancelar-assinatura` mexem com dinheiro real via Asaas e já tiveram bugs silenciosos no passado — código que respondia sucesso mas não fazia o que devia por trás. Cada uma dessas funções exige:
- Confirmação explícita e isolada antes do deploy (nunca agrupadas com outras mudanças)
- Confirmar que o comportamento esperado foi entendido, não só "posso fazer o deploy"

### Funções existentes

| Função | O que faz | Risco |
|---|---|---|
| `gerar-roteiro` | Gera roteiros via Gemini | Normal |
| `resumo-do-dia` | Resumo diário do usuário | Normal |
| `iniciar-assinatura` | Cria checkout de assinatura no Asaas | Crítica (pagamento) |
| `asaas-webhook` | Recebe eventos de pagamento do Asaas | Crítica (pagamento) |
| `cancelar-assinatura` | Cancela assinatura no Asaas | Crítica (pagamento) |

### Decisões já tomadas — não reverter sem entender o porquê

Vieram de bugs reais encontrados e corrigidos com testes em produção-de-teste:

- **`iniciar-assinatura` não coleta CPF/CNPJ no formulário do Rotex.** Proposital — o cliente preenche no checkout do Asaas, reduzindo fricção no cadastro.

- **`asaas-webhook` correlaciona o cliente do Asaas buscando por e-mail** (`GET /v3/customers?email=`), não por `externalReference` nem por `checkout.customer`. Os dois foram testados e confirmados que não propagam de verdade entre o checkout e a assinatura criada depois — mesmo a documentação do Asaas sugerindo o contrário.

- **`cancelar-assinatura` nunca marca o status local como "cancelada" sem confirmar antes que o cancelamento aconteceu no Asaas.** Uma versão anterior respondia "cancelado com sucesso" mesmo quando a assinatura continuava ativa e cobrando. Foi corrigido pra falhar visivelmente em vez de mentir.

### Em caso de dúvida

Se não tiver certeza se uma mudança é crítica ou se pode deployar sozinho: **perguntar antes**, nunca assumir.
