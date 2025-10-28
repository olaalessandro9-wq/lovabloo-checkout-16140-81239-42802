import { removeAllUnderPrefix } from "@/lib/supabase/storageHelpers";

export async function deleteProductCascade(supabase: any, productId: number): Promise<void> {
  // Limpa imagens do produto (organizadas por prefixo)
  await removeAllUnderPrefix(supabase, "product-images", `checkouts/${productId}`);
  // Deleta produto; FKs com ON DELETE CASCADE limpam checkouts/links
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error("Falha ao excluir produto: " + error.message);
}
