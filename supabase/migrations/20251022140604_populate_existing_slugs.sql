-- Migração 5: Gerar slugs para checkouts existentes (se houver)

-- Atualizar checkouts que não têm slug
DO $$
DECLARE
  checkout_record RECORD;
BEGIN
  FOR checkout_record IN 
    SELECT id FROM checkouts WHERE slug IS NULL
  LOOP
    UPDATE checkouts 
    SET slug = generate_checkout_slug()
    WHERE id = checkout_record.id;
  END LOOP;
END $$;

-- Comentário
COMMENT ON COLUMN checkouts.slug IS 'Slug único gerado automaticamente para URLs de pagamento';

