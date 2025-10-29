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
  const tries = opts?.tries ?? 25;
  const delayMs = opts?.delayMs ?? 200;

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
    const { data } = await supabase
      .from("checkouts")
      .select("id")
      .eq("product_id", id)
      .order("created_at", { ascending: true })
      .limit(1);
    if (data?.length) return data[0];
    await new Promise((r) => setTimeout(r, delayMs));
  }

  // fallback: cria 1 checkout padrão
  const { data: created, error: e1 } = await supabase
    .from("checkouts")
    .insert({ product_id: id, title: "Checkout padrão", settings: {} })
    .select("id")
    .single();
  if (e1) throw e1;
  return created!;
}
