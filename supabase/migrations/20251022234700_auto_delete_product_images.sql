-- Migration: Deletar imagens automaticamente ao excluir produtos
-- Data: 2025-10-22
-- Descrição: Remove imagens do Storage quando um produto é excluído

-- Habilitar extensão para manipular Storage
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Função para deletar imagem do produto
CREATE OR REPLACE FUNCTION delete_product_image()
RETURNS TRIGGER AS $$
DECLARE
  v_image_path TEXT;
  v_bucket_name TEXT := 'product-images';
BEGIN
  -- Verificar se o produto tem imagem
  IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
    -- Extrair o caminho da imagem da URL
    -- Formato esperado: https://xxx.supabase.co/storage/v1/object/public/product-images/user_id/filename.ext
    -- Ou: product-images/user_id/filename.ext (caminho relativo)
    
    -- Tentar extrair o caminho após 'product-images/'
    v_image_path := substring(OLD.image_url from 'product-images/(.*)');
    
    -- Se não encontrou, tentar extrair apenas o nome do arquivo
    IF v_image_path IS NULL OR v_image_path = '' THEN
      v_image_path := substring(OLD.image_url from '[^/]+\.[^/]+$');
      IF v_image_path IS NOT NULL THEN
        v_image_path := OLD.user_id || '/' || v_image_path;
      END IF;
    END IF;
    
    -- Se conseguiu extrair o caminho, deletar do Storage
    IF v_image_path IS NOT NULL AND v_image_path != '' THEN
      -- Deletar do bucket usando storage.delete
      PERFORM storage.delete(v_bucket_name, v_image_path);
      
      RAISE NOTICE 'Imagem deletada: % do bucket %', v_image_path, v_bucket_name;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar ANTES de deletar produto
DROP TRIGGER IF EXISTS delete_product_image_trigger ON products;
CREATE TRIGGER delete_product_image_trigger
  BEFORE DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION delete_product_image();

-- Comentários
COMMENT ON FUNCTION delete_product_image() IS 
'Deleta automaticamente a imagem do Storage quando um produto é excluído';

COMMENT ON TRIGGER delete_product_image_trigger ON products IS 
'Garante que imagens de produtos sejam removidas do Storage ao excluir produtos';

