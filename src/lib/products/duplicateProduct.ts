import { ensureUniqueSlug, toSlug } from "@/lib/utils/slug";
import { cloneCustomizationWithImages } from "@/lib/checkout/cloneCustomization";
import { ensureSingleCheckout } from "./ensureSingleCheckout";

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
    console.log('[duplicateProductDeep] Single checkout, waiting for auto-created and updating');
    
    // ✅ Aguarda o checkout auto-criado pelo trigger
    const autoCheckout = await ensureSingleCheckout(newProductId, { tries: 50, delayMs: 300 });
    const dstCheckoutId = autoCheckout.id;

    const src = srcCheckouts[0];
    
    // Clona customização (design contém as imagens)
    const clonedDesign = await cloneCustomizationWithImages(supabase, src.design, newProductId);
    
    // Slug único
    const baseSlug = src.slug || toSlug(srcProduct.name);
    const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

    // ✅ ATUALIZA o checkout auto-criado (não cria novo)
    await supabase
      .from("checkouts")
      .update({
        name: src.name,
        slug: newSlug,
        design: clonedDesign,
        components: src.components,
        top_components: src.top_components,
        bottom_components: src.bottom_components,
        primary_color: src.primary_color,
        secondary_color: src.secondary_color,
        background_color: src.background_color,
        text_color: src.text_color,
        button_color: src.button_color,
        button_text_color: src.button_text_color,
        form_background_color: src.form_background_color,
        selected_payment_color: src.selected_payment_color,
        font: src.font,
        seller_name: src.seller_name,
      })
      .eq("id", dstCheckoutId);

    console.log('[duplicateProductDeep] Checkout updated:', dstCheckoutId);

    // Clona links
    await cloneCheckoutLinksIfTableExists(supabase, src.id, dstCheckoutId, newSlug);

    return { newProductId };
  }

  // N > 1 → reutiliza 1 auto (preenchido com o 1º) e cria os (N−1) restantes
  console.log(`[duplicateProductDeep] Multiple checkouts (${srcCount}), reusing auto-created + cloning others`);
  
  const autoCheckout = await ensureSingleCheckout(newProductId, { tries: 50, delayMs: 300 });
  const dstFirstId = autoCheckout.id;

  // Atualiza o primeiro checkout
  {
    const src = srcCheckouts[0];
    const clonedDesign = await cloneCustomizationWithImages(supabase, src.design, newProductId);
    const baseSlug = src.slug || toSlug(srcProduct.name);
    const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

    await supabase
      .from("checkouts")
      .update({
        name: src.name,
        slug: newSlug,
        design: clonedDesign,
        components: src.components,
        top_components: src.top_components,
        bottom_components: src.bottom_components,
        primary_color: src.primary_color,
        secondary_color: src.secondary_color,
        background_color: src.background_color,
        text_color: src.text_color,
        button_color: src.button_color,
        button_text_color: src.button_text_color,
        form_background_color: src.form_background_color,
        selected_payment_color: src.selected_payment_color,
        font: src.font,
        seller_name: src.seller_name,
      })
      .eq("id", dstFirstId);

    console.log('[duplicateProductDeep] First checkout updated:', dstFirstId);

    await cloneCheckoutLinksIfTableExists(supabase, src.id, dstFirstId, newSlug);
  }

  // Insere os demais checkouts (N-1)
  for (let i = 1; i < srcCheckouts.length; i++) {
    const src = srcCheckouts[i];
    const clonedDesign = await cloneCustomizationWithImages(supabase, src.design, newProductId);
    const baseSlug = src.slug || `${toSlug(srcProduct.name)}-${i + 1}`;
    const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

    const { data: newCh, error: e3 } = await supabase
      .from("checkouts")
      .insert({
        product_id: newProductId,
        name: src.name,
        slug: newSlug,
        design: clonedDesign,
        components: src.components,
        top_components: src.top_components,
        bottom_components: src.bottom_components,
        primary_color: src.primary_color,
        secondary_color: src.secondary_color,
        background_color: src.background_color,
        text_color: src.text_color,
        button_color: src.button_color,
        button_text_color: src.button_text_color,
        form_background_color: src.form_background_color,
        selected_payment_color: src.selected_payment_color,
        font: src.font,
        seller_name: src.seller_name,
      })
      .select("id")
      .single();

    if (e3) throw e3;

    console.log(`[duplicateProductDeep] Additional checkout created (${i+1}/${srcCount}):`, newCh!.id);

    await cloneCheckoutLinksIfTableExists(supabase, src.id, newCh!.id, newSlug);
  }

  console.log('[duplicateProductDeep] Duplication completed successfully');
  return { newProductId };
}
