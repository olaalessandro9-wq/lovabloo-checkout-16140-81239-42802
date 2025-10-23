-- Migration: Garantir que payment_links sejam criados com status 'active'
-- Data: 2025-10-22
-- Descrição: Atualiza o trigger para criar links com status ativo por padrão

-- Atualizar função de criação de link para incluir status 'active'
CREATE OR REPLACE FUNCTION auto_create_payment_link()
RETURNS TRIGGER AS $$
DECLARE
  v_slug TEXT;
  v_base_url TEXT;
  v_link_id UUID;
BEGIN
  -- Gerar slug único
  v_slug := generate_link_slug(NEW.name, NEW.price);
  
  -- URL base da aplicação
  v_base_url := 'https://risecheckout.lovable.app/c/';
  
  -- Inserir o link com status 'active'
  INSERT INTO payment_links (offer_id, slug, url, status)
  VALUES (NEW.id, v_slug, v_base_url || v_slug, 'active')
  RETURNING id INTO v_link_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentário
COMMENT ON FUNCTION auto_create_payment_link() IS 
'Cria automaticamente um payment_link com status ativo quando uma oferta é criada';

