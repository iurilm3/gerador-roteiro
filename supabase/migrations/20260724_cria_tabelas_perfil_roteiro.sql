-- ============================================================
-- MIGRATION: cria as tabelas perfil e roteiro
-- Data: 2026-07-24
-- Regra permanente: RLS ligado no mesmo bloco da criação.
-- A fechadura entra junto com a prateleira — nunca depois.
-- ============================================================


-- ============================================================
-- TABELA: perfil
-- Guarda a identidade da criadora (nicho, público, produto,
-- tom de voz, preferências de estilo e CTA principal).
-- Uma criadora tem um perfil.
-- ============================================================
CREATE TABLE IF NOT EXISTS perfil (
  -- Identificador único gerado automaticamente
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dono da linha: preenchido automaticamente com o id
  -- de quem está logado no momento do insert.
  -- auth.uid() é a função do Supabase que devolve o id
  -- do usuário autenticado na sessão atual.
  user_id          UUID NOT NULL DEFAULT auth.uid()
                   REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Campos de identidade (vindos do MODELO.md)
  nome_ou_marca        TEXT,
  nicho                TEXT NOT NULL,
  publico              TEXT NOT NULL,
  produto              TEXT NOT NULL,
  tom_de_voz           TEXT NOT NULL,
  preferencias_estilo  TEXT NOT NULL,
  cta_principal        TEXT,

  -- Datas preenchidas automaticamente pelo banco
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ligue a fechadura imediatamente.
-- Com RLS ativo, nenhuma linha é visível nem gravável
-- até que uma política de acesso diga o contrário.
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;

-- Regra de dono — tabela perfil:
-- USING: controla quem pode LER. Só a própria dona vê o seu perfil.
-- WITH CHECK: controla quem pode GRAVAR (INSERT e UPDATE).
--   Impede que alguém escreva um perfil com user_id diferente do dela.
CREATE POLICY "dona_le_e_grava_perfil"
  ON perfil
  FOR ALL                          -- vale para SELECT, INSERT, UPDATE, DELETE
  TO authenticated                 -- só usuários logados; anônimos são bloqueados
  USING       (auth.uid() = user_id)
  WITH CHECK  (auth.uid() = user_id);


-- ============================================================
-- TABELA: roteiro
-- Guarda cada roteiro gerado. Um perfil pode ter muitos
-- roteiros. Fora de escopo no MVP, mas o modelo já existe
-- para quando o histórico for implementado.
-- ============================================================
CREATE TABLE IF NOT EXISTS roteiro (
  -- Identificador único gerado automaticamente
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dono da linha (mesma lógica do perfil)
  user_id     UUID NOT NULL DEFAULT auth.uid()
              REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Referência ao perfil usado na geração
  perfil_id   UUID NOT NULL REFERENCES perfil(id) ON DELETE CASCADE,

  -- Campos do roteiro (vindos do MODELO.md)
  -- objetivo: lista fechada com os 4 valores da mandala OMT
  objetivo    TEXT NOT NULL
              CHECK (objetivo IN ('descoberta','relacionamento','conversao','remarketing')),

  topico           TEXT NOT NULL,
  roteiro_gerado   TEXT NOT NULL,

  -- Campos para uso futuro da IA (já previstos no MODELO.md)
  texto_bruto  TEXT,              -- texto cru que a criadora colou, se houver
  confianca    NUMERIC(3,2)       -- 0.00 a 1.00 — confiança da IA na geração
               CHECK (confianca IS NULL OR (confianca >= 0 AND confianca <= 1)),

  -- Data preenchida automaticamente
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fechadura ligada imediatamente, junto com a tabela.
ALTER TABLE roteiro ENABLE ROW LEVEL SECURITY;

-- Regra de dono — tabela roteiro:
-- Mesma lógica do perfil: só a dona vê e grava os seus roteiros.
CREATE POLICY "dona_le_e_grava_roteiro"
  ON roteiro
  FOR ALL
  TO authenticated
  USING       (auth.uid() = user_id)
  WITH CHECK  (auth.uid() = user_id);


-- ============================================================
-- TRIGGER: mantém atualizado_em atualizado a cada UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION atualiza_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_perfil_atualizado_em
  BEFORE UPDATE ON perfil
  FOR EACH ROW
  EXECUTE FUNCTION atualiza_timestamp();
