import { supabase } from "@/integrations/supabase/client";
import { deleteStorageFiles } from "@/lib/supabaseStorage";

// Função auxiliar para extrair o path do storage a partir de uma public URL do Supabase
function extractStoragePath(publicUrl: string, bucketName: string): string | null {
  if (!publicUrl || !publicUrl.includes(`/${bucketName}/`)) return null;
  
  // A URL é tipicamente: [SUPABASE_URL]/storage/v1/object/public/[BUCKET_NAME]/[PATH]
  const parts = publicUrl.split(`/${bucketName}/`);
  if (parts.length > 1) {
    return parts[1];
  }
  return null;
}

export async function deleteProductAndAssets(productId: string) {
  // 1) Coletar todos os checkout components com paths de storage
  // Assumindo que a tabela checkout_components tem uma coluna que referencia o product_id
  // Se não tiver, é necessário fazer um JOIN ou buscar checkouts primeiro.
  const { data: components, error: componentsError } = await supabase
    .from("checkout_components")
    .select("id, content, checkout_id")
    .in("checkout_id", supabase.from("checkouts").select("id").eq("product_id", productId)); // Subquery para pegar componentes do produto
    
  if (componentsError) throw componentsError;

  // 2) Montar lista de paths a remover
  const pathsToRemove: string[] = [];
  (components || []).forEach((c: any) => {
    const imgUrl = c.content?.imageUrl;
    const storagePath = c.content?._storage_path; // Prioriza o path salvo no clone process
    
    if (storagePath) {
      pathsToRemove.push(storagePath);
    } else if (imgUrl && imgUrl.startsWith("http")) {
      // Tenta extrair o path da URL
      const extractedPath = extractStoragePath(imgUrl, "product-images");
      if (extractedPath) {
        pathsToRemove.push(extractedPath);
      }
    }
  });

  // 3) Remover arquivos do Supabase
  if (pathsToRemove.length > 0) {
    await deleteStorageFiles(pathsToRemove, "product-images");
  }

  // 4) Remover registros (componentes, checkouts, links, product)
  // Ordem de exclusão: dependentes primeiro
  
  // Exclusão de componentes
  const { error: deleteComponentsError } = await supabase.from("checkout_components").delete().in("checkout_id", supabase.from("checkouts").select("id").eq("product_id", productId));
  if (deleteComponentsError) console.error("Erro ao deletar componentes:", deleteComponentsError);

  // Exclusão de links
  const { error: deleteLinksError } = await supabase.from("checkout_links").delete().in("checkout_id", supabase.from("checkouts").select("id").eq("product_id", productId));
  if (deleteLinksError) console.error("Erro ao deletar links:", deleteLinksError);
  
  // Exclusão de checkouts
  const { error: deleteCheckoutsError } = await supabase.from("checkouts").delete().eq("product_id", productId);
  if (deleteCheckoutsError) console.error("Erro ao deletar checkouts:", deleteCheckoutsError);
  
  // Exclusão do produto
  const { error: deleteProductError } = await supabase.from("products").delete().eq("id", productId);
  if (deleteProductError) console.error("Erro ao deletar produto:", deleteProductError);

  if (deleteComponentsError || deleteLinksError || deleteCheckoutsError || deleteProductError) {
    throw new Error("Erro ao deletar registros do produto.");
  }
  
  return { success: true, pathsRemoved: pathsToRemove.length };
}

// Exemplo de como exportar para um router Express/Next.js
// router.delete("/:id", async (req, res) => {
//   try {
//     const result = await deleteProductAndAssets(req.params.id);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
