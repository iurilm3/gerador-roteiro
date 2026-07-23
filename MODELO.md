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
| `nicho` | texto | sim | Área de atuação (ex: maternidade cristã) |
| `publico` | texto | sim | Para quem ela fala (ex: mães cristãs com filhos pequenos) |
| `produto` | texto | sim | O que ela vende (ex: guia devocional Enquanto Eles Crescem) |
| `tom_de_voz` | texto | sim | Como ela fala (ex: acolhedor, direto, sem academicismo) |
| `preferencias_estilo` | texto | sim | O que ela evita e prefere (ex: sem hook engessado, sem trend, fala conversacional) |
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
| `topico` | texto | sim | O tema digitado pela pessoa (ex: culpa materna) |
| `roteiro_gerado` | texto longo | sim | O roteiro completo devolvido pela IA |
| `texto_bruto` | texto longo | não | O texto cru que a pessoa colou, se houver — para a IA entender o estilo dela por amostras reais |
| `confianca` | número (0 a 1) | não | O quanto a IA confia que o roteiro gerado corresponde ao perfil e objetivo — 0 é incerto, 1 é muito confiante |
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
