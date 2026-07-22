# Especificação do MVP — Gerador de Roteiro

> Regra permanente: tudo precisa funcionar primeiro no celular.

---

## O PROBLEMA

Infoprodutores com negócio rodando e audiência formada perdem consistência porque travam na hora de transformar um assunto que dominam em conteúdo pronto para postar. Quando tentam usar IA por conta própria, escrevem prompts vagos e recebem texto genérico que não tem nada a ver com a voz deles. O resultado é o mesmo: pulam o post do dia.

---

## QUEM USA

Infoprodutores convidados manualmente — grupo pequeno, com produto digital vendendo e audiência formada no Instagram. Não são iniciantes. Entram pelo link direto, sem cadastro e sem senha. O que querem sair tendo feito: gravado (ou pronto para gravar) um vídeo no próprio estilo, sem ter travado na hora de começar.

---

## O QUE A PESSOA FAZ HOJE

Produz na intuição quando o dia está inspirado, ou simplesmente pula o post. Às vezes tenta o ChatGPT ou o Claude escrevendo um prompt vago ("me faz um roteiro sobre culpa materna"), recebe um texto genérico com hook de copywriter e frases que nunca diria, descarta tudo e volta ao zero.

---

## O QUE É SUCESSO

Com o perfil já preenchido, a pessoa escolhe o objetivo e digita o tema — e em até **30 segundos** tem um roteiro de fala na tela do celular que ela sente que pode gravar sem reescrever quase nada.

---

## A FEATURE DE IA

A IA recebe o perfil de identidade (nicho, público, produto, tom de voz, preferências de estilo), o objetivo escolhido e o tema do dia, e devolve um roteiro de fala no tom único da pessoa, sem fórmulas genéricas — o humano lê, confere e decide se grava antes de usar o resultado.

---

## FORA DE ESCOPO

- Histórico de roteiros gerados
- Login, conta, senha
- Cobrança ou planos pagos
- Carrossel, stories, posts estáticos
- Prompt para geração de imagens
- Qualquer formato além do roteiro de fala para vídeo

---

## CASOS DE BORDA

**1. A pessoa tenta gerar sem preencher o perfil**
O botão "Gerar roteiro" fica bloqueado (desabilitado) enquanto os campos obrigatórios do perfil estiverem vazios. A tela mostra uma mensagem clara: "Preencha seu perfil antes de gerar o roteiro."

**2. A IA demora mais do que o esperado ou a conexão cai durante a geração**
A tela mostra um indicador de carregamento. Se passar de 30 segundos sem resposta, exibe a mensagem: "A geração demorou mais que o esperado. Tente novamente." — sem travar a tela nem perder o que foi digitado.

**3. O link vai parar em gente além do grupo convidado**
A lógica de geração (os prompts e a chamada de IA) fica inteiramente no servidor. Quem abre o link no navegador nunca vê o "motor" por trás — só recebe o roteiro pronto. Não há proteção por senha no MVP, mas o segredo está protegido pela arquitetura.

**4. A pessoa usa o sistema com o celular em conexão instável (3G, sinal fraco)**
O sistema aguarda a resposta sem timeout agressivo. Se a conexão cair antes de completar, exibe mensagem de erro amigável e mantém o tema digitado no campo para ela tentar de novo sem redigitar.
