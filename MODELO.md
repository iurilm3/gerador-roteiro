# Modelo de Dados — Gerador de Roteiro

> Este documento descreve as tabelas do sistema e os campos de cada uma.
> O banco de dados ainda não existe no MVP — por enquanto os dados ficam no navegador (localStorage).
> Este modelo é o destino: quando o banco for criado, ele nasce já com a forma certa, sem precisar ser remodelado.

---

## Por que toda tabela tem um campo `user_id`

**O dono nasce junto com o dado porque dado sem dono é dado perdido.**
Se você adicionar o `user_id` só quando o login chegar, cada linha já existente no banco ficará órfã — sem dono, sem proteção, impossível de filtrar. Criar o campo agora custa nada; não criar agora custa uma migração dolorosa depois.

---

## Tabela 1 — `perfil`

Guarda a identidade da criadora. Uma pessoa pode ter um perfil. O perfil é a base de todo roteiro gerado.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | texto (UUID) | sim | Identificador único gerado automaticamente |
| `user_id` | texto (UUID) | sim | Quem é o dono deste perfil |
| `nome_ou_marca` | texto | não | Nome pessoal ou nome da marca |
| `nicho` | texto | sim | Área de atuação (ex: educação financeira para autônomos e freelancers) |
| `publico` | texto | sim | Para quem fala (ex: autônomos de 28 a 45 anos que ganham bem mas vivem no aperto) |
| `produto` | texto | sim | O que vende (ex: curso "Do Caos ao Controle", planilha "Fluxo Sem Susto") |
| `tom_de_voz` | texto | sim | Como fala (ex: direto, prático, sem jargão de mercado financeiro) |
| `preferencias_estilo` | texto | sim | O que evita e prefere (ex: nunca promessa de enriquecimento rápido, sempre exemplo concreto de número e situação real) |
| `cta_principal` | texto | não | O que ela pede no final dos vídeos (ex: salva esse vídeo) |
| `criado_em` | data e hora | sim | Quando o perfil foi criado |
| `atualizado_em` | data e hora | sim | Quando o perfil foi editado pela última vez |

---

## Tabela 2 — `roteiro`

Guarda cada roteiro gerado. Um perfil pode ter muitos roteiros. Esta tabela não será implementada no MVP (histórico está fora de escopo), mas o modelo já prevê sua existência para quando chegar a hora.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | texto (UUID) | sim | Identificador único gerado automaticamente |
| `user_id` | texto (UUID) | sim | Quem pediu este roteiro |
| `perfil_id` | texto (UUID) | sim | Qual perfil foi usado como base |
| `objetivo` | lista fechada | sim | Uma de quatro opções: `descoberta`, `relacionamento`, `conversao`, `remarketing` |
| `tipo_trafego` | lista fechada | sim | Origem do tráfego: `organico` ou `pago` |
| `formato` | lista fechada | sim | Formato do conteúdo: `reels`, `post`, `carrossel` ou `stories` |
| `topico` | texto | sim | O tema digitado pela pessoa (ex: culpa materna) |
| `categoria_matriz` | lista fechada | sim | Categoria da Matriz de Ângulos: `urgencia_oculta`, `oportunidade` ou `prontidao`. As opções disponíveis dependem do objetivo. |
| `subtema_matriz` | lista fechada | sim | Subtema da Matriz de Ângulos: um dos 18 valores fixos (ex: `clickbait`, `historia`, `prova`). Sempre os mesmos 18, independente do objetivo ou categoria. |
| `roteiro_gerado` | texto longo | sim | O roteiro completo devolvido pela IA |
| `texto_bruto` | texto longo | não | O texto cru que a pessoa colou, se houver — para a IA entender o estilo dela por amostras reais |
| `confianca` | número (0 a 1) | não | O quanto a IA confia que o roteiro gerado corresponde ao perfil e objetivo — 0 é incerto, 1 é muito confiante |
| `status` | lista fechada | sim | Etapa do roteiro no fluxo de uso: `rascunho`, `aprovado` ou `publicado`. Nasce sempre como `rascunho`. |
| `criado_em` | data e hora | sim | Quando o roteiro foi gerado |

---

## Relação entre as tabelas

```
perfil (1) ──────── (N) roteiro
   │                        │
user_id ←──────────── user_id
```

Um perfil pertence a uma pessoa (`user_id`).
Cada roteiro pertence ao mesmo dono do perfil que o originou.
Quando o login existir, o sistema filtra automaticamente: cada pessoa só vê seus próprios dados.

---

## Valores possíveis do campo `objetivo`

| Valor | Significado | Quando usar |
|---|---|---|
| `descoberta` | Novo público | Quer alcançar pessoas que ainda não a conhecem |
| `relacionamento` | Aprofundar conexão | Quer engajar quem já a segue |
| `conversao` | Venda direta | Quer converter quem já confia nela |
| `remarketing` | Segunda chance | Quer falar com quem viu mas não comprou |

---

## Valores possíveis do campo `tipo_trafego`

> **Para quem não conhece o termo:** "tráfego" é simplesmente de onde vêm as pessoas que vão ver o conteúdo. Orgânico = você postou e quem te segue (ou o algoritmo) distribuiu, sem pagar nada. Pago = você colocou dinheiro para o conteúdo aparecer como anúncio para pessoas que talvez nem te conheçam.

| Valor | Significado | Exemplo prático |
|---|---|---|
| `organico` | Conteúdo publicado sem impulsionamento | Um Reels postado no perfil que vai ser distribuído pelo algoritmo do Instagram |
| `pago` | Conteúdo usado como criativo em anúncio | O mesmo Reels sendo veiculado como anúncio no Meta Ads para um público frio |

**Por que esse campo importa para o roteiro:** um conteúdo orgânico pode ser mais relacional e pressupor que a audiência já te conhece um pouco. Um conteúdo pago precisa funcionar do zero — a pessoa que vai ver talvez nunca tenha ouvido falar de você, então o roteiro precisa apresentar, gerar confiança e conduzir à ação em segundos.

---

## Valores possíveis do campo `formato`

> **Para quem não conhece os termos:** Reels é aquele vídeo vertical curto que roda no feed e no Explorer. Post é uma imagem ou vídeo mais parado, sem ser carrossel. Carrossel é aquele conjunto de imagens (ou cards) que a pessoa desliza com o dedo, um por vez — muito usado para listas, tutoriais e sequências de argumentos.

| Valor | Significado | Como o `roteiro_gerado` fica |
|---|---|---|
| `reels` | Vídeo vertical curto (até ~90s) | Texto corrido único — a pessoa lê ou decora como se fosse uma fala contínua |
| `post` | Publicação estática (imagem ou vídeo parado) | Texto corrido único — geralmente vai para a legenda ou para o texto sobreposto na imagem |
| `carrossel` | Sequência de slides deslizáveis | Exatamente 8 blocos de texto, cada um iniciado com `Slide 1:` até `Slide 8:` — essa marcação é uma convenção de formatação dentro do mesmo campo de texto, não uma tabela separada |
| `stories` | Sequência de telas rápidas nos Stories | Texto corrido único ou segmentado por tela, dependendo da instrução da IA |

---

## Valores possíveis do campo `status`

> **Para quem não conhece o termo:** "status" é simplesmente em que etapa aquele roteiro está. Pense como um post-it colado no roteiro impresso: ainda estou revisando, já aprovei para gravar, ou já gravei e postei.

| Valor | Significado | Quando usar |
|---|---|---|
| `rascunho` | Roteiro gerado, ainda não revisado | É o valor automático de todo roteiro novo — a pessoa ainda não decidiu se vai usar |
| `aprovado` | A pessoa leu e decidiu que vai gravar | Ela gostou do roteiro e marcou como aprovado antes de gravar |
| `publicado` | O conteúdo já foi ao ar | Ela gravou, editou e publicou — ciclo completo |

**Por que esse campo importa:** com o status registrado, é possível no futuro mostrar um histórico separado por etapa ("o que ainda preciso gravar", "o que já postei"), gerar relatórios e evitar regravações desnecessárias.

---

---

## Valores possíveis do campo `categoria_matriz`

> **O que é a Matriz de Ângulos:** é uma forma de refinar o ângulo do roteiro antes de gerar. Em vez de só dizer "quero falar sobre culpa materna", você define se quer abordar pelo ângulo da urgência, da oportunidade ou da prontidão do público. Isso muda a construção do argumento do roteiro.

**Atenção:** as opções disponíveis dependem do objetivo escolhido:
- **Descoberta ou Relacionamento** → 2 opções: Urgência Oculta e Oportunidade
- **Conversão ou Remarketing** → 3 opções: Urgência Oculta, Oportunidade e Prontidão

| Valor | Rótulo na tela | Quando usar |
|---|---|---|
| `urgencia_oculta` | Urgência Oculta | O público tem um problema que ainda não percebeu como urgente — o roteiro revela a urgência |
| `oportunidade` | Oportunidade | Existe uma janela, uma vantagem ou um caminho que o público ainda não viu — o roteiro apresenta |
| `prontidao` | Prontidão | O público já sabe que precisa, já considerou a solução — o roteiro empurra para a decisão final |

---

## Valores possíveis do campo `subtema_matriz`

> Os 18 subtemas aparecem sempre inteiros, em qualquer combinação de objetivo e categoria — eles não são filtrados. "Oportunidade" aparece aqui e também como categoria no campo acima: isso é intencional, os dois existem de forma independente.

| Valor no banco | Rótulo na tela |
|---|---|
| `clickbait` | Clickbait |
| `sensacao` | Sensação |
| `mito` | Mito |
| `contraste` | Contraste |
| `prova` | Prova |
| `dilema` | Dilema |
| `visual` | Visual |
| `certo_vs_errado` | Certo vs Errado |
| `apelo_emocional` | Apelo Emocional |
| `comparacao` | Comparação |
| `curiosidade` | Curiosidade |
| `demonstracao` | Demonstração |
| `oportunidade` | Oportunidade |
| `ultra_segmentado` | Ultra Segmentado |
| `historia` | História |
| `reflexao` | Reflexão |
| `explicacao` | Explicação |
| `problema_solucao` | Problema/Solução |

---

**Modelo de como fica um roteiro de carrossel dentro do campo `roteiro_gerado`:**

```
Slide 1: Você não está falhando como mãe. Você está exausta.
Slide 2: Existe uma diferença enorme entre as duas coisas — e ninguém te contou.
Slide 3: Mãe que falha não sente culpa. Mãe que está exausta sente tudo ao mesmo tempo.
Slide 4: A culpa que você sente é sinal de que você se importa. Isso tem nome: presença.
Slide 5: O problema não é a culpa. É quando ela fica parada só te punindo, sem virar ação.
Slide 6: Culpa que vira ação é graça. É o que separa sobreviver de crescer.
Slide 7: Você não precisa ser perfeita. Precisa ser honesta com você mesma.
Slide 8: Salva esse carrossel para quando precisar lembrar disso. O link do guia está na bio.
```
