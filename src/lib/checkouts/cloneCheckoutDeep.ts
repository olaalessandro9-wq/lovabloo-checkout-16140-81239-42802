import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Clona o layout completo de um checkout para outro usando a RPC V5.
 * 
 * @param supabase - Cliente Supabase
 * @param srcCheckoutId - ID do checkout origem
 * @param dstCheckoutId - ID do checkout destino (já deve estar criado)
 * @throws Error se a RPC falhar
 */
export async function cloneCheckoutDeep(
  supabase: SupabaseClient,
  srcCheckoutId: string,
  dstCheckoutId: string
): Promise<void> {
  console.log('[cloneCheckoutDeep] Calling RPC clone_checkout_deep_v5:', {
    p_src: srcCheckoutId,
    p_dst: dstCheckoutId,
  });

  const { error } = await supabase.rpc("clone_checkout_deep_v5", {
    p_src: srcCheckoutId,
    p_dst: dstCheckoutId,
  });

  if (error) {
    console.error("[cloneCheckoutDeep] RPC failed:", error);
    throw error;
  }

  console.log('[cloneCheckoutDeep] RPC succeeded');
}
