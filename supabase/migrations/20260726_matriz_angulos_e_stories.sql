-- ============================================================
-- MIGRATION: adiciona Matriz de Ângulos e Stories na tabela roteiro
-- Data: 2026-07-26
-- Usa ALTER TABLE porque a tabela já existe em produção.
-- DEFAULT obrigatório em colunas NOT NULL: a tabela já tem linhas.
-- Nenhuma política de RLS precisa mudar.
-- ============================================================

-- Coluna 1: categoria da Matriz de Ângulos
-- Valores: urgencia_oculta | oportunidade | prontidao
ALTER TABLE roteiro
  ADD COLUMN categoria_matriz TEXT NOT NULL DEFAULT 'urgencia_oculta'
             CHECK (categoria_matriz IN ('urgencia_oculta', 'oportunidade', 'prontidao'));

-- Coluna 2: subtema da Matriz de Ângulos
-- 18 valores possíveis — lista fechada
ALTER TABLE roteiro
  ADD COLUMN subtema_matriz TEXT NOT NULL DEFAULT 'clickbait'
             CHECK (subtema_matriz IN (
               'clickbait', 'sensacao', 'mito', 'contraste', 'prova', 'dilema',
               'visual', 'certo_vs_errado', 'apelo_emocional', 'comparacao',
               'curiosidade', 'demonstracao', 'oportunidade', 'ultra_segmentado',
               'historia', 'reflexao', 'explicacao', 'problema_solucao'
             ));

-- Coluna formato: remove constraint antiga e recria com 'stories' incluído
-- A constraint anterior só aceitava: reels, post, carrossel
ALTER TABLE roteiro DROP CONSTRAINT IF EXISTS roteiro_formato_check;

ALTER TABLE roteiro
  ADD CONSTRAINT roteiro_formato_check
  CHECK (formato IN ('reels', 'post', 'carrossel', 'stories'));
