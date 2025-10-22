-- Migration: Corrigir associação automática de link ao checkout padrão
-- Data: 2025-10-22
-- Descrição: Garantir que o link da oferta padrão seja associado ao checkout padrão automaticamente

-- Remover trigger antigo
DROP TRIGGER IF EXISTS create_default_checkout_trigger ON offers;
DROP FUNCTION IF EXISTS create_default_checkout_for_offer();

-- Criar nova função que aguarda o link ser criado
CREATE OR REPLACE FUNCTION create_default_checkout_and_associate_link()
RETURNS TRIGGER AS $$
DECLARE
  v_product_name TEXT;
  v_checkout_id UUID;
  v_link_id UUID;
  v_checkout_count INTEGER;
  v_max_attempts INTEGER := 10;
  v_attempt INTEGER := 0;
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
      VALUES (NEW.product_id, v_product_name || ' - Checkout Padrão', true)
      RETURNING id INTO v_checkout_id;
      
      -- Aguardar o link ser criado (com timeout)
      WHILE v_attempt < v_max_attempts LOOP
        SELECT id INTO v_link_id
        FROM payment_links
        WHERE offer_id = NEW.id;
        
        EXIT WHEN v_link_id IS NOT NULL;
        
        v_attempt := v_attempt + 1;
        PERFORM pg_sleep(0.1); -- Aguardar 100ms
      END LOOP;
      
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

-- Criar trigger AFTER INSERT (após o link ser criado)
CREATE TRIGGER create_default_checkout_and_link_trigger
  AFTER INSERT ON offers
  FOR EACH ROW
  EXECUTE FUNCTION create_default_checkout_and_associate_link();

-- Criar função para associar link existente quando checkout é criado manualmente
CREATE OR REPLACE FUNCTION associate_default_link_on_checkout_creation()
RETURNS TRIGGER AS $$
DECLARE
  v_default_offer_id UUID;
  v_link_id UUID;
BEGIN
  -- Buscar oferta padrão do produto
  SELECT id INTO v_default_offer_id
  FROM offers
  WHERE product_id = NEW.product_id
    AND is_default = true
  LIMIT 1;
  
  -- Se encontrou oferta padrão, buscar seu link
  IF v_default_offer_id IS NOT NULL THEN
    SELECT id INTO v_link_id
    FROM payment_links
    WHERE offer_id = v_default_offer_id;
    
    -- Associar link ao checkout
    IF v_link_id IS NOT NULL THEN
      INSERT INTO checkout_links (checkout_id, link_id)
      VALUES (NEW.id, v_link_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para associar link quando checkout é criado
CREATE TRIGGER associate_default_link_trigger
  AFTER INSERT ON checkouts
  FOR EACH ROW
  EXECUTE FUNCTION associate_default_link_on_checkout_creation();

-- Comentários
COMMENT ON FUNCTION create_default_checkout_and_associate_link() IS 
'Cria checkout padrão e associa o link da oferta padrão automaticamente';

COMMENT ON FUNCTION associate_default_link_on_checkout_creation() IS 
'Associa automaticamente o link da oferta padrão quando um checkout é criado';

