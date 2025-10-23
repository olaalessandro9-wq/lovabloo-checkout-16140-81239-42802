-- Migration: Desabilitar criação automática de oferta padrão
-- Data: 2025-10-22
-- Descrição: Remove trigger que cria oferta padrão automaticamente
--            Produto = Oferta principal (não precisa de oferta separada)
--            Ofertas adicionais são criadas apenas quando usuário ativa o toggle

-- Remover trigger que cria oferta padrão automaticamente
DROP TRIGGER IF EXISTS auto_create_default_offer_trigger ON products;

-- Remover função que cria oferta padrão
DROP FUNCTION IF EXISTS auto_create_default_offer();

-- Comentário
COMMENT ON TABLE offers IS 
'Ofertas adicionais do produto. O produto em si já é a oferta principal. 
Ofertas nesta tabela são criadas apenas quando o usuário ativa o toggle de Ofertas.';

-- Limpar ofertas padrão que foram criadas automaticamente
-- (manter apenas ofertas que têm nome diferente do produto, indicando que foram criadas manualmente)
DELETE FROM offers 
WHERE is_default = true 
AND name = (SELECT name FROM products WHERE products.id = offers.product_id);

