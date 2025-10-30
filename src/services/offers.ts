import { supabase } from "@/integrations/supabase/client";

export type NormalizedOffer = {
  id: string;
  product_id: string;
  price: number;        // já normalizado pela view
  product_name?: string | null;
  updated_at?: string | null;
};

export async function fetchOffersByProduct(productId: string): Promise<NormalizedOffer[]> {
  const { data, error } = await supabase
    .from("v_offers_normalized" as any)
    .select("id, product_id, price, product_name, updated_at")
    .eq("product_id", productId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as NormalizedOffer[];
}
