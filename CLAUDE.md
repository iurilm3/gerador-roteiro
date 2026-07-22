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
