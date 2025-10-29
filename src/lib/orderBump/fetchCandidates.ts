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
  // A base do projeto trabalha com centavos (price_cents).
  // Mantemos essa coluna aqui. Caso a tabela use outro nome,
  // ajuste os campos do select mais abaixo.
  price_cents: number | null;
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

  // Monta a query base
  let query = supabase
    .from("products")
    .select("id,name,price_cents,status");

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

  // Garante array
  return (data ?? []) as OrderBumpCandidate[];
}
