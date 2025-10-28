import { supabase } from "@/integrations/supabase/client";
import { copyImagePublicUrlToNewFile } from "@/lib/supabaseStorage";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId required" });

  try {
    const { data: product } = await supabase.from("products").select("*").eq("id", productId).single();
    if (!product) return res.status(404).json({ error: "Product not found" });

    const newProduct = { ...product };
    delete newProduct.id;
    newProduct.name = `${product.name} (Cópia)`;
    newProduct.slug = `${product.slug}-copy-${Date.now()}`;
    delete newProduct.created_at;
    delete newProduct.updated_at;

    const { data: insertedProduct, error: insertProductError } = await supabase.from("products").insert([newProduct]).select().single();
    if (insertProductError) throw insertProductError;

    const newProductId = insertedProduct.id;
    const { data: checkouts } = await supabase.from("checkouts").select("*").eq("product_id", productId);

    for (const co of (checkouts || [])) {
      const checkoutClone = { ...co };
      delete checkoutClone.id;
      checkoutClone.product_id = newProductId;
      checkoutClone.name = `${co.name} (Cópia)`;
      delete checkoutClone.created_at;
      delete checkoutClone.created_at;

      const { data: newCheckout, error: newCheckoutErr } = await supabase.from("checkouts").insert([checkoutClone]).select().single();
      if (newCheckoutErr) throw newCheckoutErr;

      const { data: components } = await supabase.from("checkout_components").select("id, content").eq("checkout_id", co.id);
      for (const comp of (components || [])) {
        const compClone = JSON.parse(JSON.stringify(comp));
        delete compClone.id;
        compClone.checkout_id = newCheckout.id;

        const imageUrl = compClone.content?.imageUrl;
        if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
          try {
            const copy = await copyImagePublicUrlToNewFile(imageUrl, "product-images");
            if (copy?.publicUrl) {
              compClone.content.imageUrl = copy.publicUrl;
              compClone.content._storage_path = copy.path;
            }
          } catch (err) {
            console.error("Erro ao copiar imagem:", err);
          }
        }
        await supabase.from("checkout_components").insert([compClone]);
      }

      const { data: links } = await supabase.from("checkout_links").select("*").eq("checkout_id", co.id);
      for (const link of (links || [])) {
        const linkClone = { ...link };
        delete linkClone.id;
        linkClone.checkout_id = newCheckout.id;
        linkClone.slug = `${link.slug}-copy-${Date.now().toString().slice(-6)}`;
        await supabase.from("checkout_links").insert([linkClone]);
      }
    }

    return res.json({ ok: true, product: insertedProduct });
  } catch (err) {
    console.error("Erro duplicar produto:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
