import { supabase } from "@/integrations/supabase/client";
import { deleteStorageFiles } from "@/lib/supabaseStorage";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId required" });

  try {
    const { data: checkouts } = await supabase.from("checkouts").select("id").eq("product_id", productId);
    const checkoutIds = (checkouts || []).map(c => c.id);

    const { data: components } = await supabase.from("checkout_components").select("id, content").in("checkout_id", checkoutIds);

    const paths = [];
    (components || []).forEach(c => {
      const p = c.content?._storage_path;
      if (p) paths.push(p);
      else if (c.content?.imageUrl) {
        const m = c.content.imageUrl.match(/\/product-images\/(.+)$/);
        if (m?.[1]) paths.push(m[1]);
      }
    });

    // Delete DB records
    await supabase.from("checkout_components").delete().in("checkout_id", checkoutIds);
    await supabase.from("checkout_links").delete().in("checkout_id", checkoutIds);
    await supabase.from("checkouts").delete().in("id", checkoutIds);
    await supabase.from("products").delete().eq("id", productId);

    // Delete files from storage
    if (paths.length) {
      const { error } = await deleteStorageFiles(paths, "product-images");
      if (error) console.error("Erro ao deletar assets:", error);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro delete product:", err);
    return res.status(500).json({ error: err.message || "Erro" });
  }
}
