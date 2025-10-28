import { deleteStorageFiles } from "@/lib/supabaseStorage";

// Endpoint server-side para deletar um arquivo do storage
// Deve ser chamado *após* o save bem-sucedido do componente no banco de dados.

export async function removeStorageFileHandler(path: string) {
  if (!path) {
    throw new Error("Path do arquivo não fornecido.");
  }
  
  // O deleteStorageFiles já trata a remoção
  await deleteStorageFiles([path], "product-images");
  
  return { success: true };
}

// Exemplo de como exportar para um router Express/Next.js
// router.post("/storage/remove", async (req, res) => {
//   try {
//     await removeStorageFileHandler(req.body.path);
//     res.json({ ok: true });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
