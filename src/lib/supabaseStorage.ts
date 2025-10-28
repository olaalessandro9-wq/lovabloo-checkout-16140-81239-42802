import { supabase } from "@/integrations/supabase/client";

export async function copyImagePublicUrlToNewFile(publicUrl: string, destFolder = "product-images") {
  if (!publicUrl || !publicUrl.startsWith("http")) return null;

  // 1. Baixar o conteúdo
  const res = await window.fetch(publicUrl);
  if (!res.ok) throw new Error(`Erro ao baixar imagem: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  // 2. Definir extensão e nome do arquivo
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.split("/")[1] || "jpg";
  const fileName = `${destFolder}/${crypto.randomUUID()}.${ext}`;

  // 3. Upload para supabase
  const { error: uploadError } = await supabase.storage
    .from(destFolder)
    .upload(fileName, buffer, { contentType, upsert: true });

  if (uploadError) throw uploadError;

  // 4. Obter a nova public URL
  const { data } = supabase.storage.from(destFolder).getPublicUrl(fileName);
  return { publicUrl: data?.publicUrl, path: fileName };
}

export async function deleteStorageFiles(paths: string[], bucket = "product-images") {
  if (!paths || paths.length === 0) return;
  
  const { error: rmErr } = await supabase.storage.from(bucket).remove(paths);
  if (rmErr) {
    console.error(`Erro ao remover imagens do bucket ${bucket}:`, rmErr);
    throw rmErr;
  }
}
