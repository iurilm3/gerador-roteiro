-- ============================================================
-- MIGRATION: corrige RLS da tabela geracoes_log
-- Data: 2026-07-29
-- Problema: a policy FOR ALL permitia DELETE nas próprias linhas,
-- o que deixava o usuário zerar o próprio rate limit apagando
-- os registros de tentativas.
-- Correção: substituir por duas policies separadas — SELECT e
-- INSERT — sem nenhuma permissão de UPDATE ou DELETE.
-- ============================================================

-- Remove a policy antiga que cobria ALL (incluindo DELETE)
DROP POLICY IF EXISTS "dono_le_e_grava_geracoes_log" ON geracoes_log;

-- Permite que o usuário LEIA as próprias linhas
-- (necessário para a contagem de tentativas na última hora)
CREATE POLICY "dono_le_geracoes_log"
  ON geracoes_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Permite que o usuário INSIRA linhas com o próprio user_id
-- (necessário para registrar cada tentativa de geração)
CREATE POLICY "dono_insere_geracoes_log"
  ON geracoes_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE e DELETE não têm policy = bloqueados pelo RLS por padrão.
-- O usuário não consegue mais apagar ou modificar registros antigos.
