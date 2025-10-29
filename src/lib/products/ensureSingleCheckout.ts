import { supabase } from "@/integrations/supabase/client";

/**
 * Aguarda checkout auto-criado (se houver automação/trigger), e só cria 1 checkout
 * caso não apareça nenhum após o timeout. Idempotente.
 */
export async function ensureSingleCheckout(
  productId: string | number,
  opts?: { tries?: number; delayMs?: number }
) {
  const id = String(productId);
  const tries = opts?.tries ?? 50;
  const delayMs = opts?.delayMs ?? 300;

  console.log('[ensureSingleCheckout] Waiting for auto-created checkout for product:', id);

  // se já existir, retorna o primeiro
  {
    const { data, error } = await supabase
      .from("checkouts")
      .select("id")
      .eq("product_id", id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) return data[0];
  }

  // aguarda checkout auto-criado
  for (let i = 0; i < tries; i++) {
    const { data, error } = await supabase
      .from("checkouts")
      .select("id")
      .eq("product_id", id)
      .order("created_at", { ascending: true })
      .limit(1);
    
    if (error) {
      console.error('[ensureSingleCheckout] Query error:', error);
      throw error;
    }
    
    if (data?.length) {
      console.log('[ensureSingleCheckout] Found auto-created checkout:', data[0].id);
      return data[0];
    }
    
    await new Promise((r) => setTimeout(r, delayMs));
  }

  // Se após todas as tentativas não encontrou, algo está errado com o trigger
  throw new Error(
    `Timeout: Nenhum checkout foi criado automaticamente para o produto ${id}. ` +
    `Verifique o trigger create_default_checkout no banco.`
  );
}
