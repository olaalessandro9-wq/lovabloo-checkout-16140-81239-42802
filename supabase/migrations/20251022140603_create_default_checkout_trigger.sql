-- Migração 4: Criar trigger para criar checkout padrão automaticamente ao criar produto

-- Função que cria checkout padrão
CREATE OR REPLACE FUNCTION create_default_checkout()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar checkout padrão para o novo produto
  INSERT INTO checkouts (
    product_id,
    name,
    slug,
    is_default,
    seller_name
  ) VALUES (
    NEW.id,
    'Checkout Principal',
    generate_checkout_slug(),
    true,
    NEW.support_name
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa após inserir produto
CREATE TRIGGER trigger_create_default_checkout
AFTER INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION create_default_checkout();

-- Comentários
COMMENT ON FUNCTION create_default_checkout() IS 'Cria checkout padrão automaticamente ao criar produto';
COMMENT ON TRIGGER trigger_create_default_checkout ON products IS 'Trigger que cria checkout padrão ao inserir produto';

