-- Adicionar colunas faltantes na tabela checkouts
ALTER TABLE checkouts 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS visits_count integer NOT NULL DEFAULT 0;

-- Criar índice único para slug se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkouts_slug_key') THEN
    ALTER TABLE checkouts ADD CONSTRAINT checkouts_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Criar índices para melhor performance se não existirem
CREATE INDEX IF NOT EXISTS idx_checkouts_slug ON checkouts(slug);
CREATE INDEX IF NOT EXISTS idx_checkouts_product_id ON checkouts(product_id);
CREATE INDEX IF NOT EXISTS idx_checkout_links_checkout_id ON checkout_links(checkout_id);
CREATE INDEX IF NOT EXISTS idx_checkout_links_link_id ON checkout_links(link_id);

-- Atualizar checkouts existentes sem slug
UPDATE checkouts 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;