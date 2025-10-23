-- Migration: Criar oferta padrão automaticamente ao criar produto
-- Data: 2025-10-22
-- Descrição: Garante que todo produto tenha uma oferta padrão com o nome do produto

-- Função para criar oferta padrão quando produto é criado ou atualizado
CREATE OR REPLACE FUNCTION auto_create_default_offer()
RETURNS TRIGGER AS $$
DECLARE
  v_offer_count INTEGER;
  v_offer_id UUID;
BEGIN
  -- Verificar se o produto já tem alguma oferta
  SELECT COUNT(*) INTO v_offer_count
  FROM offers
  WHERE product_id = NEW.id;
  
  -- Se não tem nenhuma oferta, criar uma padrão
  IF v_offer_count = 0 THEN
    INSERT INTO offers (product_id, name, price, is_default)
    VALUES (NEW.id, NEW.name, NEW.price, true)
    RETURNING id INTO v_offer_id;
    
    -- Log para debug
    RAISE NOTICE 'Oferta padrão criada para produto % com nome %', NEW.id, NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar após inserção ou atualização de produto
DROP TRIGGER IF EXISTS auto_create_default_offer_trigger ON products;
CREATE TRIGGER auto_create_default_offer_trigger
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_default_offer();

-- Comentário
COMMENT ON FUNCTION auto_create_default_offer() IS 
'Cria automaticamente uma oferta padrão com o nome do produto quando um produto é criado';

-- Criar ofertas padrão para produtos existentes que não têm ofertas
INSERT INTO offers (product_id, name, price, is_default)
SELECT 
  p.id,
  p.name,
  p.price,
  true
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM offers WHERE product_id = p.id
);

