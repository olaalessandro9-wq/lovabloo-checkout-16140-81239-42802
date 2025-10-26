-- Migration: Corrigir criação duplicada de checkouts
-- Data: 2025-10-26
-- Problema: Dois triggers estão criando checkouts (um no produto, outro na oferta)
-- Solução: Remover trigger antigo que cria checkout ao inserir produto

-- ============================================
-- 1. REMOVER TRIGGER ANTIGO
-- ============================================
-- Este trigger criava checkout quando produto era inserido
-- Agora o checkout é criado pelo trigger da oferta padrão
DROP TRIGGER IF EXISTS trigger_create_default_checkout ON products;
DROP FUNCTION IF EXISTS create_default_checkout();

-- ============================================
-- 2. COMENTÁRIOS
-- ============================================
COMMENT ON TRIGGER create_default_checkout_trigger ON offers IS 
'Cria automaticamente um checkout padrão quando uma oferta padrão é criada. Este é o único trigger que deve criar checkouts.';

-- ============================================
-- 3. VERIFICAÇÃO
-- ============================================
-- Após esta migration, o fluxo será:
-- 1. Usuário cria produto
-- 2. Trigger auto_create_default_offer cria oferta padrão
-- 3. Trigger auto_create_payment_link cria link para a oferta
-- 4. Trigger create_default_checkout_trigger cria checkout E associa ao link
-- Resultado: 1 produto → 1 oferta → 1 link → 1 checkout ✅

-- ============================================
-- 4. LIMPEZA (OPCIONAL)
-- ============================================
-- Se quiser limpar checkouts duplicados existentes, descomente:
/*
DELETE FROM checkouts
WHERE id IN (
  SELECT c.id
  FROM checkouts c
  INNER JOIN (
    SELECT product_id, MIN(created_at) as first_created
    FROM checkouts
    GROUP BY product_id
    HAVING COUNT(*) > 1
  ) duplicates ON c.product_id = duplicates.product_id
  WHERE c.created_at > duplicates.first_created
);
*/

