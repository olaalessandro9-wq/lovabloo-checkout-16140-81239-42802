// Helper para carregar candidatos de Order Bump direto do Supabase.
// Mantém a tipagem enxuta e independe de rotas /api inexistentes.
// Uso típico no modal: fetchOrderBumpCandidates().then(setProdutos)

import { supabase } from "@/integrations/supabase/client";

// Se o projeto já tiver um tipo Product/ProductLite em src/types/product,
// você pode trocar por esse import:
// import type { ProductLite } from "@/types/product";

export type OrderBumpCandidate = {
  id: string;
  name: string;
  price: number; // Preço normalizado da view
  status?: string | null;
};

/**
 * Busca produtos para serem candidatos de Order Bump.
 * @param excludeProductId opcionalmente exclui o produto atual da lista
 */
export async function fetchOrderBumpCandidates(opts?: {
  excludeProductId?: string;
}): Promise<OrderBumpCandidate[]> {
  const excludeId = opts?.excludeProductId;

  // Monta a query base a partir da VIEW canônica (filtrada no servidor)
  let query = supabase
    .from("v_order_bump_products" as any)
    .select("id,name,price,updated_at"); // 'price' já normalizado na view

  // Se quiser excluir o produto atual:
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  // Dica: se quiser filtrar só ativos, descomente:
  // query = query.eq("status", "active");

  const { data, error } = await query;

  if (error) {
    // Deixe o throw para o chamador lidar (toast, etc.)
    throw error;
  }

  // Defesa extra: view já filtra, mas garantimos sanidade no cliente
  return (data ?? []).filter((p: any) => p && p.id && p.name) as unknown as OrderBumpCandidate[];
}
