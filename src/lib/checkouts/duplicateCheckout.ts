import { supabase } from "@/integrations/supabase/client";
import { ensureUniqueCheckoutName } from "@/lib/utils/uniqueCheckoutName";
import { cloneCheckoutDeep } from "@/lib/checkouts/cloneCheckoutDeep";

/**
 * Duplica um checkout de um produto.
 * - Cria checkout esqueleto com nome único
 * - Chama RPC clone_checkout_deep para copiar layout completo
 * - Retorna o ID do novo checkout e a URL de edição
 */
export async function duplicateCheckout(checkoutId: string) {
  // Sanitiza caso venha "checkout-<id>" de algum lugar
  const srcId = checkoutId.replace(/^checkout-/, "");

  // 1) Ler checkout de origem (apenas o mínimo necessário)
  const { data: src, error: eSrc } = await supabase
    .from("checkouts")
    .select("id, product_id, name")
    .eq("id", srcId)
    .single();
  if (eSrc || !src) throw eSrc ?? new Error("Checkout origem não encontrado");

  // 2) Gerar nome único no MESMO produto
  const baseName = `${src.name} (Cópia)`;
  const newName = await ensureUniqueCheckoutName(supabase, src.product_id, baseName);

  // 3) Criar esqueleto do checkout destino
  const { data: created, error: eIns } = await supabase
    .from("checkouts")
    .insert({ product_id: src.product_id, name: newName, is_default: false })
    .select("id")
    .single();
  if (eIns || !created) throw eIns ?? new Error("Falha ao duplicar checkout");

  // 4) 🔧 Clonar "deep" usando RPC V5
  await cloneCheckoutDeep(supabase, src.id, created.id);

  const editUrl = `/produtos/checkout/personalizar?id=${created.id}`;
  return { id: created.id, editUrl };
}
