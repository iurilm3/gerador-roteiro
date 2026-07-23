# Arquitetura do Sistema — Gerador de Roteiro

> Este documento descreve onde cada parte do sistema mora e onde cada segredo vive.
> A arquitetura é o alvo: o MVP implementa só o Bloco 1 e parte do Bloco 3 por enquanto.

---

## Visão geral — três blocos

```
┌─────────────────────────────────────────────────────────────────┐
│  BLOCO 1 — NAVEGADOR (o celular da usuária)                     │
│                                                                  │
│  Next.js · Tailwind CSS · mobile-first                          │
│  Publicado no Cloudflare Pages                                   │
│                                                                  │
│  O que roda aqui:                                               │
│  · Tela de perfil (formulário de identidade)                    │
│  · Tela de geração (objetivo + tópico + botão)                  │
│  · Tela de resultado (roteiro + botão copiar)                   │
│  · Perfil salvo no localStorage (temporário, só no MVP)         │
│                                                                  │
│  O que NUNCA fica aqui:                                         │
│  · Chave da IA (GEMINI_API_KEY)                                 │
│  · Chave de administrador do banco (SERVICE_ROLE_KEY)           │
│  · Lógica de montagem do prompt                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (pedido e resposta)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  BLOCO 2 — BANCO DE DADOS E LOGIN (Supabase)                    │
│                                                                  │
│  PostgreSQL · Supabase Auth                                      │
│  Fica nos servidores do Supabase (fora do nosso controle)       │
│                                                                  │
│  O que vive aqui:                                               │
│  · Tabela perfil                                                │
│  · Tabela roteiro (quando o histórico for implementado)         │
│  · Contas e sessões de login (quando o login for implementado)  │
│                                                                  │
│  Ainda não implementado no MVP.                                 │
│  Por enquanto o perfil fica no localStorage do celular.         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  BLOCO 3 — EDGE FUNCTION (o cofre)                              │
│                                                                  │
│  Next.js API Route · roda no servidor do Cloudflare             │
│                                                                  │
│  O que faz:                                                     │
│  · Recebe perfil + objetivo + tópico vindos do navegador        │
│  · Monta o prompt internamente (nunca exposto ao navegador)     │
│  · Chama a API do Gemini com a chave secreta                    │
│  · Devolve só o roteiro pronto — nada mais                      │
│                                                                  │
│  Já implementado no MVP (é aqui que a GEMINI_API_KEY mora).     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Onde cada segredo vive

| Segredo | O que é | Onde fica | Por quê |
|---|---|---|---|
| `GEMINI_API_KEY` | Chave da IA (Gemini) | Cloudflare Pages → variável de ambiente (servidor) | Nunca pode aparecer no navegador. Se vazar, qualquer pessoa usa a sua cota e você paga a conta. |
| `SUPABASE_URL` | Endereço do banco | Navegador (pode aparecer no código público) | É só o endereço — não abre nada sem uma chave junto. |
| `SUPABASE_ANON_KEY` | Chave pública do Supabase | Navegador (pode aparecer no código público) | É a chave de "visitante" — dá acesso limitado, só ao que as regras de segurança do banco permitirem. **Só é seguro expô-la se o RLS (Row Level Security, a trava de segurança por linha) estiver ativado em todas as tabelas.** Sem RLS, qualquer pessoa com essa chave lê tudo. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de administrador do Supabase | Edge Function (servidor) — NUNCA no navegador | Tem poder total sobre o banco, ignora todas as travas de segurança. Se vazar, o banco inteiro fica exposto. |

---

## Controle de mudanças no banco de dados

Toda mudança no banco de dados — criar uma tabela, adicionar um campo, ativar uma regra de segurança — vira um arquivo de SQL salvo na pasta `supabase/migrations/` e guardado no Git junto com o resto do código.

Isso garante três coisas:
1. **Histórico**: sabemos exatamente o que mudou, quando e por quê.
2. **Reversibilidade**: se algo der errado, temos o passo anterior documentado e podemos desfazer.
3. **Consistência**: qualquer ambiente novo (teste, produção, outra máquina) pode ser recriado rodando as migrations na ordem certa.

O nome de cada arquivo segue o padrão `YYYYMMDD_descricao.sql` — por exemplo, `20260722_cria_tabela_perfil.sql`.

---

## Fluxo de uma geração de roteiro

```
Usuária no celular
       │
       │ 1. Abre o link, preenche perfil (salvo no localStorage)
       │
       │ 2. Escolhe objetivo + digita tópico + clica "Gerar"
       │
       ▼
  Navegador (Bloco 1)
       │
       │ 3. Envia: { perfil, objetivo, tópico }
       │    via HTTPS para a Edge Function
       │
       ▼
  Edge Function (Bloco 3)
       │
       │ 4. Monta o prompt com os dados recebidos
       │ 5. Chama o Gemini com a GEMINI_API_KEY (secreta)
       │ 6. Recebe o roteiro cru
       │ 7. Devolve apenas o roteiro para o navegador
       │
       ▼
  Navegador (Bloco 1)
       │
       │ 8. Exibe o roteiro na tela
       │ 9. Usuária lê, confere e decide se grava
       │
       ▼
  (futuro) Bloco 2 — Supabase
       │
       └─ 10. Salva roteiro + metadados no banco (fora do escopo do MVP)
```

---

## O que é MVP e o que é futuro

| Componente | MVP (agora) | Futuro |
|---|---|---|
| Tela de perfil | Sim — localStorage | Sim — banco de dados |
| Tela de geração | Sim | Sim |
| Edge Function com IA | Sim | Sim (aprimorada) |
| Banco de dados (Supabase) | Não | Sim |
| Login e contas | Não | Sim |
| Histórico de roteiros | Não | Sim |
