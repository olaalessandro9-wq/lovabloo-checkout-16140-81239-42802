-- Migration: Modificar trigger para permitir exclusão de produto
-- Data: 2025-10-22
-- Descrição: Permite que checkout_links sejam excluídos quando o checkout está sendo excluído

-- Remover trigger antigo
DROP TRIGGER IF EXISTS prevent_orphaned_links_trigger ON checkout_links;
DROP FUNCTION IF EXISTS prevent_orphaned_links();

-- Criar nova função que permite exclusão se o checkout está sendo excluído
CREATE OR REPLACE FUNCTION prevent_orphaned_links()
RETURNS TRIGGER AS $$
DECLARE
  v_remaining_count INTEGER;
  v_checkout_exists BOOLEAN;
BEGIN
  -- Verificar se o checkout ainda existe
  SELECT EXISTS(
    SELECT 1 FROM checkouts WHERE id = OLD.checkout_id
  ) INTO v_checkout_exists;
  
  -- Se o checkout não existe mais, permitir a exclusão
  -- (significa que está sendo excluído em cascata)
  IF NOT v_checkout_exists THEN
    RETURN OLD;
  END IF;
  
  -- Contar quantas associações restam para este link
  SELECT COUNT(*) INTO v_remaining_count
  FROM checkout_links
  WHERE link_id = OLD.link_id
    AND id != OLD.id;
  
  -- Se esta é a última associação, bloquear
  IF v_remaining_count = 0 THEN
    RAISE EXCEPTION 'Cannot remove link from last checkout. Links must be associated with at least one checkout.'
      USING ERRCODE = 'P0001';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
CREATE TRIGGER prevent_orphaned_links_trigger
  BEFORE DELETE ON checkout_links
  FOR EACH ROW
  EXECUTE FUNCTION prevent_orphaned_links();

COMMENT ON FUNCTION prevent_orphaned_links() IS 
'Previne que links fiquem órfãos, mas permite exclusão em cascata quando checkout é excluído';

