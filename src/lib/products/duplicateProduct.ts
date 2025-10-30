import { ensureUniqueSlug, toSlug } from "@/lib/utils/slug";
import { cloneCustomizationWithImages } from "@/lib/checkout/cloneCustomization";
import { ensureUniqueName } from "@/lib/utils/uniqueName";

type ProductRow = Record<string, any>;
type CheckoutRow = Record<string, any>;

async function cloneCheckoutLinksIfTableExists(
  supabase: any,
  srcCheckoutId: string,
  newCheckoutId: string,
  suggestedSlug: string
) {
  // checkout_links (prioritário)
  try {
    const { data: srcLinks } = await supabase
      .from("checkout_links")
      .select("*")
      .eq("checkout_id", srcCheckoutId);
    if (srcLinks?.length) {
      for (const link of srcLinks) {
        const newSlug = await ensureUniqueSlug(supabase, "checkout_links", "slug", suggestedSlug);
        const insert: any = { ...link, id: undefined, checkout_id: newCheckoutId, slug: newSlug };
        delete insert.created_at;
        delete insert.updated_at;
        await supabase.from("checkout_links").insert(insert);
      }
      return;
    }
  } catch {}
  // payment_links (fallback)
  try {
    const { data: payLinks } = await supabase
      .from("payment_links")
      .select("*")
      .eq("checkout_id", srcCheckoutId);
    if (payLinks?.length) {
      for (const link of payLinks) {
        const newSlug = await ensureUniqueSlug(supabase, "payment_links", "slug", suggestedSlug);
        const insert: any = { ...link, id: undefined, checkout_id: newCheckoutId, slug: newSlug };
        delete insert.created_at;
        delete insert.updated_at;
        await supabase.from("payment_links").insert(insert);
      }
    }
  } catch {}
}

export async function duplicateProductDeep(supabase: any, rawProductId: string | number) {
  // Garantir que productId é uma string UUID válida
  const productId = String(rawProductId).trim();
  
  if (!productId || productId === 'undefined' || productId === 'null') {
    console.error('[duplicateProductDeep] Invalid product ID:', rawProductId);
    throw new Error("ID do produto inválido");
  }

  console.log('[duplicateProductDeep] Starting duplication for product:', productId);

  // 1) produto origem
  const { data: srcProduct, error: selectError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  
  if (selectError) {
    console.error('[duplicateProductDeep] Database select failed:', selectError);
    throw new Error(`Falha ao buscar produto: ${selectError.message}`);
  }
  
  if (!srcProduct) {
    console.error('[duplicateProductDeep] Product not found for ID:', productId);
    throw new Error("Produto origem não encontrado");
  }

  console.log('[duplicateProductDeep] Source product loaded:', srcProduct.name);

  // 2) cria produto clone (sem slug, pois a tabela products não tem essa coluna)
  const baseName = `${srcProduct.name} (Cópia)`;
  // products NÃO tem 'slug' no schema → não enviar campo 'slug'
  // Apenas garante um 'name' amigável (opcional)
  const newName = await ensureUniqueName(supabase, baseName);
  console.log('[duplicateProductDeep] Unique name generated:', newName);

  const productInsert: ProductRow = { ...srcProduct };
  delete productInsert.id;
  delete productInsert.created_at;
  delete productInsert.updated_at;
  productInsert.name = newName; // ✅ apenas o nome

  const { data: newProd, error: eDst } = await supabase
    .from("products")
    .insert(productInsert)
    .select("*")
    .single();
  if (eDst || !newProd) {
    console.error('[duplicateProductDeep] Insert product failed:', eDst);
    throw new Error("Falha ao criar produto clone");
  }

  const newProductId = newProd.id;

  console.log('[duplicateProductDeep] Clone product created:', newProductId);

  // 🔧 3) LIMPA EFEITOS DO TRIGGER (checkout + offer default criados automaticamente)
  console.log('[duplicateProductDeep] Cleaning trigger-created checkout and offer...');
  await supabase.from("checkouts").delete().eq("product_id", newProductId);
  await supabase.from("offers").delete().eq("product_id", newProductId);
  console.log('[duplicateProductDeep] Trigger effects cleaned');

  // 4) COPIA AS OFFERS DO PRODUTO DE ORIGEM
  const { data: srcOffers, error: eOffers } = await supabase
    .from("offers")
    .select("*")
    .eq("product_id", srcProduct.id);
  if (eOffers) throw eOffers;

  if (srcOffers?.length) {
    for (const offer of srcOffers) {
      const offerInsert: any = { ...offer };
      delete offerInsert.id;
      delete offerInsert.created_at;
      delete offerInsert.updated_at;
      offerInsert.product_id = newProductId;
      await supabase.from("offers").insert(offerInsert);
    }
    console.log("[duplicateProductDeep] Copied", srcOffers.length, "offers to", newProductId);
  }

  // 5) COPIA OS CHECKOUTS DO PRODUTO DE ORIGEM (mantendo 1–1)
  const { data: srcCheckouts, error: eCk } = await supabase
    .from("checkouts")
    .select("*")
    .eq("product_id", srcProduct.id)
    .order("created_at", { ascending: true });
  if (eCk) throw eCk;

  if (srcCheckouts?.length) {
    for (let i = 0; i < srcCheckouts.length; i++) {
      const ck = srcCheckouts[i];
      
      // Clona customização (design contém as imagens)
      const clonedDesign = await cloneCustomizationWithImages(supabase, ck.design, newProductId);
      
      // Slug único
      const baseSlug = ck.slug || (i === 0 ? toSlug(srcProduct.name) : `${toSlug(srcProduct.name)}-${i + 1}`);
      const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

      const ckInsert: any = { ...ck };
      delete ckInsert.id;
      delete ckInsert.created_at;
      delete ckInsert.updated_at;
      ckInsert.product_id = newProductId;
      ckInsert.slug = newSlug;
      ckInsert.design = clonedDesign;

      const { data: newCk, error: e3 } = await supabase
        .from("checkouts")
        .insert(ckInsert)
        .select("id")
        .single();

      if (e3) throw e3;

      console.log(`[duplicateProductDeep] Copied checkout ${i + 1}/${srcCheckouts.length}:`, newCk.id);

      // Clona links
      await cloneCheckoutLinksIfTableExists(supabase, ck.id, newCk.id, newSlug);
    }
    console.log("[duplicateProductDeep] Copied", srcCheckouts.length, "checkouts to", newProductId);
  }

  console.log('[duplicateProductDeep] Duplication completed successfully');
  return { newProductId };
}
