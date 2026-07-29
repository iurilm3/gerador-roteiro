-- ============================================================
-- MIGRATION: cria a tabela geracoes_log
-- Data: 2026-07-28
-- Finalidade: contar tentativas de geração de roteiro por hora,
-- independente de o roteiro ter sido salvo ou não.
-- Regra permanente: RLS ligado no mesmo bloco da criação.
-- ============================================================

CREATE TABLE IF NOT EXISTS geracoes_log (
  -- Identificador único gerado automaticamente
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dono da linha: preenchido automaticamente com o id
  -- de quem está logado no momento do insert.
  user_id     UUID NOT NULL DEFAULT auth.uid()
              REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Momento exato da tentativa de geração.
  -- Usado para filtrar os últimos 60 minutos no rate limit.
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ligue a fechadura imediatamente.
-- Com RLS ativo, nenhuma linha é visível nem gravável
-- até que uma política de acesso diga o contrário.
ALTER TABLE geracoes_log ENABLE ROW LEVEL SECURITY;

-- Regra de dono — tabela geracoes_log:
-- USING: só o próprio usuário lê as suas linhas.
-- WITH CHECK: só o próprio usuário insere linhas com o seu user_id.
CREATE POLICY "dono_le_e_grava_geracoes_log"
  ON geracoes_log
  FOR ALL
  TO authenticated
  USING       (auth.uid() = user_id)
  WITH CHECK  (auth.uid() = user_id);
