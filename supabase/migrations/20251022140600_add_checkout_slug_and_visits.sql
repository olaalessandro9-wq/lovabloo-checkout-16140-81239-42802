-- Migração 1: Adicionar campos slug, visits_count e is_default em checkouts

-- Adicionar novos campos
ALTER TABLE checkouts 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS visits_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false NOT NULL;

-- Criar índice para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_checkouts_slug ON checkouts(slug);

-- Criar índice para buscar checkout padrão de um produto
CREATE INDEX IF NOT EXISTS idx_checkouts_product_default ON checkouts(product_id, is_default);

-- Adicionar comentários
COMMENT ON COLUMN checkouts.slug IS 'Slug único para gerar URLs de pagamento (ex: 397jozo_577062)';
COMMENT ON COLUMN checkouts.visits_count IS 'Contador de visitas ao checkout';
COMMENT ON COLUMN checkouts.is_default IS 'Indica se é o checkout padrão do produto';

