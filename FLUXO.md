# Fluxo de Telas — Gerador de Roteiro

> Este documento descreve em palavras o que a usuária vê e faz em cada tela.
> É a base para o mockup do Dia 4 e para o código do Dia 5.
> Regra permanente: tudo é desenhado primeiro para celular (tela de 390px de largura).

---

## Mapa geral — público vs. protegido

O sistema tem duas zonas. Qualquer pessoa pode chegar até a zona pública; a zona protegida só abre depois do login.

```
                        ZONA PÚBLICA
                   (qualquer pessoa acessa)
                            │
              ┌─────────────┴─────────────┐
              │                           │
      [Landing page]              [Tela de login]
      apresentação do             e-mail + senha
      sistema, convite            (ou link mágico)
      para entrar                        │
                                         │ login ok
                                         ▼
                        ZONA PROTEGIDA
                    (só quem está logado vê)
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        [Tela 1          [Tela 2       [Tela 3
         Perfil]          Geração]      Resultado]
```

**No MVP:** a zona pública não está implementada — a pessoa acessa o link direto para o perfil, sem landing page nem login. A separação já está mapeada aqui para que o código nasça preparado para receber as duas zonas quando chegar a hora.

---

## Telas da zona pública *(planejadas, fora do MVP)*

### Landing page
Apresenta o sistema, explica o que ele faz em uma frase, e tem um botão "Entrar" que leva para o login.

### Tela de login
Campo de e-mail e um botão "Receber link de acesso". O sistema envia um link por e-mail (sem senha — a pessoa clica no link e entra direto). Após confirmar, vai para a Tela 1 (Perfil).

---

## Mapa de telas da zona protegida

```
[Tela 1 — Perfil]  ──→  [Tela 2 — Geração]  ──→  [Tela 3 — Resultado]
        ↑                        │
        └────────────────────────┘
          (botão "Editar perfil" no topo)
```

---

## Tela 1 — Perfil

**Quando aparece:** na primeira vez que a pessoa abre o link, ou quando ela clica em "Editar perfil".

**O que a pessoa faz:** preenche os dados da sua identidade. Faz isso uma vez. Da segunda vez em diante, os campos já aparecem preenchidos com o que ela salvou.

**O que aparece na tela (de cima para baixo):**

1. **Cabeçalho** — título simples: "Seu perfil de criadora"
2. **Campo: Nicho** — texto curto. Exemplo dentro do campo para guiar: "Ex: maternidade cristã"
3. **Campo: Para quem você fala** — texto curto. Exemplo: "Ex: mães cristãs com filhos pequenos"
4. **Campo: Seu produto principal** — texto curto. Exemplo: "Ex: guia devocional Enquanto Eles Crescem"
5. **Campo: Seu tom de voz** — texto curto. Exemplo: "Ex: acolhedor, direto, sem academicismo"
6. **Campo: Como você prefere falar** — texto maior (duas linhas). Exemplo: "Ex: gosto de fala direta, sem hook engessado, sem trend, sem clichê de copywriter"
7. **Campo: CTA principal** *(opcional)* — texto curto. Exemplo: "Ex: salva esse vídeo"
8. **Botão: "Salvar e continuar"** — ocupa toda a largura da tela. Só fica ativo quando os cinco campos obrigatórios (nicho, público, produto, tom, preferências) estiverem preenchidos. Quando clica, salva no navegador e vai para a Tela 2.

**Caso de borda:** se a pessoa tentar avançar com campos vazios, o botão permanece cinza e desabilitado. Os campos obrigatórios ganham uma borda colorida indicando que precisam ser preenchidos.

---

## Tela 2 — Geração

**Quando aparece:** após salvar o perfil, ou sempre que a pessoa abre o link com perfil já salvo.

**O que a pessoa faz:** escolhe o objetivo do vídeo, digita o tema do dia e clica no botão para gerar o roteiro.

**O que aparece na tela (de cima para baixo):**

1. **Cabeçalho** — com link discreto "Editar perfil" no canto superior direito
2. **Seção: Objetivo do vídeo** — quatro opções em grade (dois por linha), cada uma com nome e descrição curta:
   - **Descoberta** — "Alcançar pessoas novas"
   - **Relacionamento** — "Aprofundar conexão com quem já te segue"
   - **Conversão** — "Convidar para comprar"
   - **Remarketing** — "Falar com quem viu mas não comprou"
   - Apenas uma opção pode estar selecionada por vez. A selecionada fica visualmente destacada.
3. **Campo: Tema de hoje** — texto livre, uma linha. Exemplo: "Ex: culpa materna". A pessoa digita o assunto que quer abordar.
4. **Botão: "Gerar roteiro"** — ocupa toda a largura. Fica desabilitado se nenhum objetivo estiver selecionado ou se o campo de tema estiver vazio. Quando clica, o botão vira um indicador de carregamento ("Gerando seu roteiro...") e o sistema chama a IA.

**Caso de borda:** se a geração demorar mais de 30 segundos, aparece uma mensagem: "A geração demorou mais que o esperado. Tente novamente." O campo de tema mantém o que foi digitado.

---

## Tela 3 — Resultado

**Quando aparece:** assim que a IA devolve o roteiro.

**O que a pessoa faz:** lê o roteiro, decide se está bom, copia e vai gravar.

**O que aparece na tela (de cima para baixo):**

1. **Cabeçalho** — objetivo escolhido + tema digitado (para ela saber de qual geração é)
2. **O roteiro** — texto completo, em fonte legível no celular, com boa altura de linha. Sem formatação especial — texto corrido, como ela falaria.
3. **Botão: "Copiar roteiro"** — copia o texto para a área de transferência. Ao copiar, o botão muda para "Copiado!" por dois segundos, depois volta ao normal.
4. **Botão: "Gerar de novo"** — volta para a Tela 2 com objetivo e tema mantidos, para ela tentar novamente se não gostar do resultado.

**Nota:** não há botão de salvar nem histórico — a pessoa copia o que quiser guardar.

---

## Princípios visuais para o mockup

- **Fundo:** branco ou cinza muito claro — fácil de ler ao sol
- **Texto:** escuro, fonte sem serifa, tamanho mínimo 16px nos campos e 18px no roteiro
- **Botões:** altura mínima de 48px (área de toque confortável com o polegar)
- **Campos:** altura mínima de 44px, espaçamento generoso entre eles
- **Nenhum elemento importante escondido atrás de scroll horizontal**
- **Uma ação principal por tela** — sem menus, sem abas, sem sidebar
