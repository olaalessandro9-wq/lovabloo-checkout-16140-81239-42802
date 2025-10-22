-- Migração 7: Criar trigger para gerar slug automaticamente em checkouts criados manualmente

-- Função para gerar slug se não existir
CREATE OR REPLACE FUNCTION generate_slug_for_checkout()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o slug não foi fornecido ou está vazio, gera um novo
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_checkout_slug();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa ANTES de inserir um checkout
DROP TRIGGER IF EXISTS trigger_generate_checkout_slug ON checkouts;
CREATE TRIGGER trigger_generate_checkout_slug
  BEFORE INSERT ON checkouts
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_for_checkout();

-- Comentário
COMMENT ON FUNCTION generate_slug_for_checkout() IS 'Gera slug automaticamente para checkouts criados manualmente';
COMMENT ON TRIGGER trigger_generate_checkout_slug ON checkouts IS 'Garante que todo checkout tenha um slug único';

