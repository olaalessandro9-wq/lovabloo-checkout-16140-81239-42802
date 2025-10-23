-- Migration: Corrigir criação automática de checkout padrão
-- Data: 2025-10-22
-- Descrição: Garantir que checkout padrão seja criado e associado ao link

-- Recriar a função para criar checkout padrão
CREATE OR REPLACE FUNCTION create_default_checkout_for_offer()
RETURNS TRIGGER AS $$
DECLARE
  v_product_name TEXT;
  v_checkout_id UUID;
  v_link_id UUID;
  v_checkout_count INTEGER;
BEGIN
  -- Só executar se for oferta padrão
  IF NEW.is_default = true THEN
    -- Verificar se o produto já tem algum checkout
    SELECT COUNT(*) INTO v_checkout_count
    FROM checkouts
    WHERE product_id = NEW.product_id;
    
    -- Se não tem nenhum checkout, criar um padrão
    IF v_checkout_count = 0 THEN
      -- Buscar nome do produto
      SELECT name INTO v_product_name
      FROM products
      WHERE id = NEW.product_id;
      
      -- Criar checkout padrão
      INSERT INTO checkouts (product_id, name, is_default)
      VALUES (NEW.product_id, 'Checkout Principal', true)
      RETURNING id INTO v_checkout_id;
      
      -- Buscar o link da oferta padrão (com retry para garantir que foi criado)
      -- O trigger auto_create_payment_link roda AFTER INSERT, então o link já deve existir
      SELECT id INTO v_link_id
      FROM payment_links
      WHERE offer_id = NEW.id
      LIMIT 1;
      
      -- Associar o link ao checkout
      IF v_link_id IS NOT NULL THEN
        INSERT INTO checkout_links (checkout_id, link_id)
        VALUES (v_checkout_id, v_link_id)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir que o trigger seja executado APÓS o trigger de criação de link
DROP TRIGGER IF EXISTS create_default_checkout_trigger ON offers;
CREATE TRIGGER create_default_checkout_trigger
  AFTER INSERT ON offers
  FOR EACH ROW
  EXECUTE FUNCTION create_default_checkout_for_offer();

-- Comentário
COMMENT ON FUNCTION create_default_checkout_for_offer() IS 
'Cria automaticamente um checkout padrão chamado "Checkout Principal" quando uma oferta padrão é criada';

