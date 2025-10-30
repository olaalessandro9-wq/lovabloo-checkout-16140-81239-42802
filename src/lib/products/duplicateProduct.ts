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

  // 2) cria produto clone com insert totalmente limpo (apenas colunas reais)
  const baseName = `${srcProduct.name} (Cópia)`;
  const newName = await ensureUniqueName(supabase, baseName);
  console.log('[duplicateProductDeep] Unique name generated:', newName);

  // ⚠️ Lista APENAS colunas reais da tabela products
  const productInsert = {
    name: newName,
    description: srcProduct.description ?? null,
    price: srcProduct.price,
    image_url: srcProduct.image_url ?? null,
    user_id: srcProduct.user_id,      // mantenha o owner
    status: srcProduct.status ?? 'active',
    support_name: srcProduct.support_name ?? null,
    support_email: srcProduct.support_email ?? null,
    // NADA de slug, active, price_cents etc.
  };

  // Sanity log (no Preview): ver as chaves indo para o insert
  console.log('[duplicateProductDeep] productInsert keys:', Object.keys(productInsert));

  const { data: newProd, error: eDst } = await supabase
    .from('products')
    .insert(productInsert)
    .select('id, name')
    .single();

  if (eDst) {
    console.error('[duplicateProductDeep] Insert product failed:', eDst);
    throw eDst;
  }

  const newProductId = newProd.id;
  console.log('[duplicateProductDeep] Clone product created:', newProductId);

  // 🔧 3) BUSCA CHECKOUT E OFFER AUTO-CRIADOS PELO TRIGGER (vamos reutilizá-los)
  console.log('[duplicateProductDeep] Fetching trigger-created checkout and offer...');
  const { data: autoCheckout } = await supabase
    .from("checkouts")
    .select("id")
    .eq("product_id", newProductId)
    .single();
  
  const { data: autoOffer } = await supabase
    .from("offers")
    .select("id")
    .eq("product_id", newProductId)
    .single();
  
  console.log('[duplicateProductDeep] Auto-created checkout:', autoCheckout?.id, 'offer:', autoOffer?.id);

  // 4) COPIA AS OFFERS DO PRODUTO DE ORIGEM (reutilizando a offer auto-criada)
  const { data: srcOffers, error: eOffers } = await supabase
    .from("offers")
    .select("*")
    .eq("product_id", srcProduct.id)
    .order("created_at", { ascending: true });

  if (eOffers) throw eOffers;

  if (srcOffers?.length && autoOffer) {
    const firstOffer = srcOffers[0];
    
    // ATUALIZA a offer auto-criada (não insere nova)
    const { error: updateOfferErr } = await supabase
      .from("offers")
      .update({
        name: firstOffer.name ?? null,
        price: firstOffer.price,
        is_default: firstOffer.is_default ?? true,
      })
      .eq("id", autoOffer.id);

    if (updateOfferErr) {
      console.error('[duplicateProductDeep] update offer failed:', updateOfferErr);
      throw updateOfferErr;
    }

    console.log('[duplicateProductDeep] Updated auto-created offer:', autoOffer.id);

    // Se houver mais de 1 offer no original, cria as demais
    if (srcOffers.length > 1) {
      for (let i = 1; i < srcOffers.length; i++) {
        const offer = srcOffers[i];
        const insertOffer: any = {
          product_id: newProductId,
          name: offer.name ?? null,
          price: offer.price,
          is_default: false, // só a primeira é default
        };

        const { error: insErr } = await supabase.from('offers').insert(insertOffer);
        if (insErr) {
          console.error('[duplicateProductDeep] insert offer failed:', insErr);
          throw insErr;
        }
      }
    }

    console.log("[duplicateProductDeep] Copied", srcOffers.length, "offers to", newProductId);
  }

  // 5) COPIA OS CHECKOUTS DO PRODUTO DE ORIGEM (reutilizando o checkout auto-criado)
  const { data: srcCheckouts, error: eCk } = await supabase
    .from("checkouts")
    .select("*")
    .eq("product_id", srcProduct.id)
    .order("created_at", { ascending: true });

  if (eCk) throw eCk;

  if (srcCheckouts?.length && autoCheckout) {
    const firstCheckout = srcCheckouts[0];
    
    // Clona design do primeiro checkout
    const clonedDesign = await cloneCustomizationWithImages(supabase, firstCheckout.design, newProductId);
    
    // Gera slug único
    const baseSlug = firstCheckout.slug || toSlug(srcProduct.name);
    const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

    // ATUALIZA o checkout auto-criado (não insere novo)
    const { error: updateCkErr } = await supabase
      .from("checkouts")
      .update({
        name: firstCheckout.name,
        slug: newSlug,
        is_default: true,
        design: clonedDesign,
        components: firstCheckout.components ?? null,
        seller_name: firstCheckout.seller_name ?? null,
        visits_count: 0,
      })
      .eq("id", autoCheckout.id);

    if (updateCkErr) {
      console.error('[duplicateProductDeep] update checkout failed:', updateCkErr);
      throw updateCkErr;
    }

    console.log('[duplicateProductDeep] Updated auto-created checkout:', autoCheckout.id);

    // Clona links do primeiro checkout
    await cloneCheckoutLinksIfTableExists(supabase, firstCheckout.id, autoCheckout.id, newSlug);

    // Se houver mais de 1 checkout no original, cria os demais
    if (srcCheckouts.length > 1) {
      for (let i = 1; i < srcCheckouts.length; i++) {
        const ck = srcCheckouts[i];
        
        const clonedDesign = await cloneCustomizationWithImages(supabase, ck.design, newProductId);
        const baseSlug = ck.slug || `${toSlug(srcProduct.name)}-${i + 1}`;
        const newSlug = await ensureUniqueSlug(supabase, "checkouts", "slug", baseSlug);

        const ckInsert: any = {
          product_id: newProductId,
          name: ck.name,
          slug: newSlug,
          is_default: false,
          design: clonedDesign,
          components: ck.components ?? null,
          seller_name: ck.seller_name ?? null,
          visits_count: 0,
        };

        const { data: newCk, error: ckErr } = await supabase
          .from("checkouts")
          .insert(ckInsert)
          .select("id")
          .single();

        if (ckErr) {
          console.error('[duplicateProductDeep] insert checkout failed:', ckErr);
          throw ckErr;
        }

        console.log(`[duplicateProductDeep] Created additional checkout ${i + 1}/${srcCheckouts.length}:`, newCk.id);

        // Clona links
        await cloneCheckoutLinksIfTableExists(supabase, ck.id, newCk.id, newSlug);
      }
    }

    console.log("[duplicateProductDeep] Copied", srcCheckouts.length, "checkouts to", newProductId);
  }

  console.log('[duplicateProductDeep] Duplication completed successfully');
  return { newProductId };
}
