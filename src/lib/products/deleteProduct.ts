import { removeAllUnderPrefix } from "@/lib/supabase/storageHelpers";

export async function deleteProductCascade(supabase: any, productId: number): Promise<void> {
  await removeAllUnderPrefix(supabase, "product-images", `checkouts/${productId}`);
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error("Falha ao excluir produto: " + error.message);
}
