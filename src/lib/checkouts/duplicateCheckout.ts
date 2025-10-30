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

  // 1) Ler checkout de origem (liste apenas colunas REAIS)
  const { data: src, error: eSrc } = await supabase
    .from("checkouts")
    .select("id, product_id, name, is_default, components, design")
    .eq("id", srcId)
    .single();
  if (eSrc || !src) throw eSrc ?? new Error("Checkout origem não encontrado");

  // 2) Gerar nome único no MESMO produto
  const baseName = `${src.name} (Cópia)`;
  const newName = await ensureUniqueCheckoutName(supabase, src.product_id, baseName);

  // 3) Montar insert do ZERO (sem cores/slug/id/etc.)
  const insertCk = {
    product_id: src.product_id,
    name: newName,
    is_default: false,
    components: src.components ?? null, // copia layout
    design: src.design ?? null,         // copia design/tema
  };

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
