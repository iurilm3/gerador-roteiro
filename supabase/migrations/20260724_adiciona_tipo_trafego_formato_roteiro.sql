-- ============================================================
-- MIGRATION: adiciona colunas tipo_trafego e formato na tabela roteiro
-- Data: 2026-07-24
-- Usa ALTER TABLE porque a tabela já existe em produção.
-- DEFAULT obrigatório: a tabela já tem linhas — sem padrão o
-- Postgres rejeitaria o comando por não saber o que preencher.
-- ============================================================

ALTER TABLE roteiro
  ADD COLUMN tipo_trafego TEXT NOT NULL DEFAULT 'organico'
             CHECK (tipo_trafego IN ('organico', 'pago'));

ALTER TABLE roteiro
  ADD COLUMN formato TEXT NOT NULL DEFAULT 'reels'
             CHECK (formato IN ('reels', 'post', 'carrossel'));
