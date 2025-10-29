import { ensureUniqueSlug, toSlug } from "@/lib/utils/slug";
import { cloneCustomizationWithImages } from "@/lib/checkout/cloneCustomization";

type ProductRow = Record<string, any>;
type CheckoutRow = Record<string, any>;

async function waitAutoCheckout(supabase: any, productId: number, tries = 15) {
  for (let i = 0; i < tries; i++) {
    const { data } = await supabase
      .from("checkouts")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true })
      .limit(1);
    if (data?.length) return data[0];
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}

async function cloneCheckoutLinksIfTableExists(
  supabase: any,
  srcCheckoutId: number,
  newCheckoutId: number,
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

  // 2) cria produto cópia
  const productInsert: ProductRow = { ...srcProduct };
  delete productInsert.id;
  delete productInsert.created_at;
  delete productInsert.updated_at;
  productInsert.name = `${srcProduct.name} (Cópia)`;

  const { data: newProd } = await supabase
    .from("products")
    .insert(productInsert)
    .select("*")
    .single();
  if (!newProd) throw new Error("Falha ao criar produto cópia.");

  const newProductId = newProd.id as number;

  // 3) aguarda checkout auto-criado (trigger)
  const autoCheckout = await waitAutoCheckout(supabase, newProductId);

  // 4) checkouts origem
  const { data: srcCheckouts } = await supabase
    .from("checkouts")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (!srcCheckouts?.length) return { newProductId };

  for (let i = 0; i < srcCheckouts.length; i++) {
    const src = srcCheckouts[i];

    // clona customização (regravando URLs de imagem/asset)
    const clonedCustomization = await cloneCustomizationWithImages(supabase, src.customization, newProductId);

    // slug único para o checkout clonado
    const baseSlug = src.slug || `${toSlug(srcProduct.name)}-${i + 1}`;
    const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

    const commonFields: CheckoutRow = {
      ...src,
      id: undefined,
      product_id: newProductId,
      slug: newSlug,
      customization: clonedCustomization,
    };
    delete commonFields.created_at;
    delete commonFields.updated_at;

    let newCheckoutId: number;
    if (i === 0 && autoCheckout) {
      await supabase.from("checkouts").update(commonFields).eq("id", autoCheckout.id);
      newCheckoutId = autoCheckout.id;
    } else {
      const { data: ins } = await supabase.from("checkouts").insert(commonFields).select("*").single();
      newCheckoutId = ins.id;
    }

    await cloneCheckoutLinksIfTableExists(supabase, src.id, newCheckoutId, newSlug);
  }

  return { newProductId };
}
