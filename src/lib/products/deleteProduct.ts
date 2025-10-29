import { removeAllUnderPrefix } from "@/lib/supabase/storageHelpers";

export async function deleteProductCascade(supabase: any, rawProductId: string | number): Promise<void> {
  // Garantir que productId é numérico
  const productId = Number(rawProductId);
  
  if (!productId || isNaN(productId)) {
    console.error('[deleteProductCascade] Invalid product ID:', rawProductId);
    throw new Error("ID do produto inválido");
  }

  console.log('[deleteProductCascade] Starting deletion for product:', productId);

  // Limpa imagens do produto (organizadas por prefixo)
  await removeAllUnderPrefix(supabase, "product-images", `checkouts/${productId}`);
  
  // Deleta produto; FKs com ON DELETE CASCADE limpam checkouts/links
  const { error } = await supabase.from("products").delete().eq("id", productId);
  
  if (error) {
    console.error('[deleteProductCascade] Delete failed:', error);
    throw new Error("Falha ao excluir produto: " + error.message);
  }
  
  console.log('[deleteProductCascade] Product deleted successfully');
}
