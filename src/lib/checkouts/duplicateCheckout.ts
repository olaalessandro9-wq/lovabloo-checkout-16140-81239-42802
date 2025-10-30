import { supabase } from "@/integrations/supabase/client";
import { ensureUniqueCheckoutName } from "@/lib/utils/uniqueCheckoutName";

/**
 * Duplica um checkout de um produto.
 * - Copia nome (com sufixo único), components e design
 * - Marca como não-default
 * - Retorna o ID do novo checkout e a URL de edição (sem prefixo "checkout-")
 */
export async function duplicateCheckout(checkoutId: string) {
  // Sanitiza caso venha "checkout-<id>" de algum lugar
  const srcId = checkoutId.replace(/^checkout-/, "");

  // 1) Ler checkout de origem (SELECT * para pegar todos os campos)
  const { data: src, error: eSrc } = await supabase
    .from("checkouts")
    .select("*")
    .eq("id", srcId)
    .single();
  if (eSrc || !src) throw eSrc ?? new Error("Checkout origem não encontrado");

  // 2) Gerar nome único no MESMO produto
  const baseName = `${src.name} (Cópia)`;
  const newName = await ensureUniqueCheckoutName(supabase, src.product_id, baseName);

  // 3) Montar insert do ZERO (sem cores/slug/id/etc.) + layout defensivo
  const insertCk: any = {
    product_id: src.product_id,
    name: newName,
    is_default: false,
  };
  const LAYOUT_KEYS = ["components","design","layout","lines","settings","theme","sections","schema","blocks"];
  for (const k of LAYOUT_KEYS) {
    if (k in src) insertCk[k] = (src as any)[k] ?? null;
  }

  const { data: created, error: eIns } = await supabase
    .from("checkouts")
    .insert(insertCk)
    .select("id")
    .single();
  if (eIns || !created) throw eIns ?? new Error("Falha ao duplicar checkout");

  const newId = created.id as string;
  const editUrl = `/produtos/checkout/personalizar?id=${newId}`; // ✅ sem 'checkout-'
  return { id: newId, editUrl };
}
