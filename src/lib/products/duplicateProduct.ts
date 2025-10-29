import { ensureUniqueSlug, toSlug } from "@/lib/utils/slug";
import { cloneCustomizationWithImages } from "@/lib/checkout/cloneCustomization";
import { ensureSingleCheckout } from "./ensureSingleCheckout";

type ProductRow = Record<string, any>;
type CheckoutRow = Record<string, any>;

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

  // 2) cria produto clone
  const productInsert: ProductRow = { ...srcProduct };
  delete productInsert.id;
  delete productInsert.created_at;
  delete productInsert.updated_at;
  productInsert.name = `${srcProduct.name} (Cópia)`;

  const { data: newProd, error: eDst } = await supabase
    .from("products")
    .insert(productInsert)
    .select("*")
    .single();
  if (eDst || !newProd) throw new Error("Falha ao criar produto clone");

  const newProductId = newProd.id;

  console.log('[duplicateProductDeep] Clone product created:', newProductId);

  // 3) checkouts da origem
  const { data: srcCheckouts, error: eC } = await supabase
    .from("checkouts")
    .select("*")
    .eq("product_id", srcProduct.id)
    .order("created_at", { ascending: true });
  if (eC) throw eC;

  console.log('[duplicateProductDeep] Source checkouts count:', srcCheckouts?.length ?? 0);

  // ✅ AGORA:
  // Reutiliza o checkout auto-criado quando origem tem 1.
  // Cria apenas os adicionais quando origem tem N>1.

  const srcCount = srcCheckouts?.length ?? 0;
  if (srcCount === 0) {
    // origem sem checkout → garante 1 (auto ou fallback) e encerra
    console.log('[duplicateProductDeep] No source checkouts, ensuring single checkout');
    await ensureSingleCheckout(newProductId);
    return { newProductId };
  }

  if (srcCount === 1) {
    // Reutiliza o auto-criado (ou cria fallback) e o atualiza com os dados do src
    console.log('[duplicateProductDeep] Single checkout, reusing auto-created');
    const auto = await ensureSingleCheckout(newProductId);
    const dstCheckoutId = auto.id;

    const src = srcCheckouts[0];
    
    // clona customização (regravando URLs de imagem/asset)
    const clonedCustomization = await cloneCustomizationWithImages(supabase, src.customization, newProductId);
    
    // slug único para o checkout clonado
    const baseSlug = src.slug || toSlug(srcProduct.name);
    const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

    await supabase
      .from("checkouts")
      .update({
        title: src.title,
        slug: newSlug,
        customization: clonedCustomization,
        settings: src.settings,
      })
      .eq("id", dstCheckoutId);

    console.log('[duplicateProductDeep] Checkout updated:', dstCheckoutId);

    // clona links
    await cloneCheckoutLinksIfTableExists(supabase, src.id, dstCheckoutId, newSlug);

    return { newProductId };
  }

  // N > 1 → reutiliza 1 auto (preenchido com o 1º) e cria os (N−1) restantes
  console.log('[duplicateProductDeep] Multiple checkouts, reusing first and creating', srcCount - 1, 'additional');
  const auto = await ensureSingleCheckout(newProductId);
  const dstFirstId = auto.id;

  const src0 = srcCheckouts[0];
  
  // clona customização do primeiro
  const clonedCustomization0 = await cloneCustomizationWithImages(supabase, src0.customization, newProductId);
  
  // slug único para o primeiro checkout
  const baseSlug0 = src0.slug || toSlug(srcProduct.name);
  const newSlug0 = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug0);

  await supabase
    .from("checkouts")
    .update({
      title: src0.title,
      slug: newSlug0,
      customization: clonedCustomization0,
      settings: src0.settings,
    })
    .eq("id", dstFirstId);
  
  console.log('[duplicateProductDeep] First checkout updated:', dstFirstId);
  
  // clona links do primeiro
  await cloneCheckoutLinksIfTableExists(supabase, src0.id, dstFirstId, newSlug0);

  // cria os checkouts restantes (N-1)
  for (let i = 1; i < srcCheckouts.length; i++) {
    const src = srcCheckouts[i];
    
    // clona customização
    const clonedCustomization = await cloneCustomizationWithImages(supabase, src.customization, newProductId);
    
    // slug único
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

    const { data: created, error: eN } = await supabase
      .from("checkouts")
      .insert(commonFields)
      .select("*")
      .single();
    if (eN || !created) throw eN ?? new Error("Falha ao criar checkout adicional");
    
    console.log('[duplicateProductDeep] Additional checkout created:', created.id);
    
    // clona links
    await cloneCheckoutLinksIfTableExists(supabase, src.id, created.id, newSlug);
  }

  console.log('[duplicateProductDeep] Duplication completed successfully');
  return { newProductId };
}
