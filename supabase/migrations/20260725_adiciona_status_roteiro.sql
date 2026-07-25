-- ============================================================
-- MIGRATION: adiciona coluna status na tabela roteiro
-- Data: 2026-07-25
-- Usa ALTER TABLE porque a tabela já existe em produção.
-- DEFAULT obrigatório: a tabela já tem linhas — o Postgres
-- preenche as linhas existentes com 'rascunho' automaticamente.
-- Nenhuma política de RLS precisa mudar: a policy existente
-- já cobre toda a tabela, incluindo colunas novas.
-- ============================================================

ALTER TABLE roteiro
  ADD COLUMN status TEXT NOT NULL DEFAULT 'rascunho'
             CHECK (status IN ('rascunho', 'aprovado', 'publicado'));
