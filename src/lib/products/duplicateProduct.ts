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

  // 🔧 3) LIMPA EFEITOS DO TRIGGER (checkout + offer default criados automaticamente)
  console.log('[duplicateProductDeep] Cleaning trigger-created checkout and offer...');
  await supabase.from("checkouts").delete().eq("product_id", newProductId);
  await supabase.from("offers").delete().eq("product_id", newProductId);
  console.log('[duplicateProductDeep] cleanup default checkout/offer OK');

  // 4) COPIA AS OFFERS DO PRODUTO DE ORIGEM (garantindo apenas 1 default)
  const { data: srcOffers, error: eOffers } = await supabase
    .from("offers")
    .select("*")
    .eq("product_id", srcProduct.id);

  if (eOffers) throw eOffers;

  if (srcOffers?.length) {
    // garante apenas 1 default
    let defaultAssigned = false;

    for (const offer of srcOffers) {
      const insertOffer: any = {
        product_id: newProductId,
        name: offer.name ?? null,
        price: offer.price,
        is_default: false, // setamos abaixo condicionalmente
      };

      // escolhe a primeira default do origem como default do clone
      if (offer.is_default && !defaultAssigned) {
        insertOffer.is_default = true;
        defaultAssigned = true;
      }

      const { error: insErr } = await supabase.from('offers').insert(insertOffer);
      if (insErr) {
        console.error('[duplicateProductDeep] insert offer failed:', insErr, insertOffer);
        throw insErr;
      }
    }

    // Se nenhuma do origem era default, deixe a primeira do clone como default
    if (!defaultAssigned) {
      const { data: first, error: qErr } = await supabase
        .from('offers')
        .select('id')
        .eq('product_id', newProductId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      if (!qErr && first) {
        await supabase.from('offers').update({ is_default: true }).eq('id', first.id);
      }
    }

    console.log("[duplicateProductDeep] Copied", srcOffers.length, "offers to", newProductId);
  }

  // 5) COPIA OS CHECKOUTS DO PRODUTO DE ORIGEM
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

      const ckInsert: any = {
        product_id: newProductId,
        name: ck.name,
        cores: ck.cores ?? null,
        slug: newSlug,
        is_default: ck.is_default ?? false,
        design: clonedDesign,
        components: ck.components ?? null,
        seller_name: ck.seller_name ?? null,
        visits_count: 0, // reset visits
      };

      const { data: newCk, error: ckErr } = await supabase
        .from("checkouts")
        .insert(ckInsert)
        .select("id")
        .single();

      if (ckErr) {
        console.error('[duplicateProductDeep] insert checkout failed:', ckErr, ckInsert);
        throw ckErr;
      }

      console.log(`[duplicateProductDeep] Copied checkout ${i + 1}/${srcCheckouts.length}:`, newCk.id);

      // Clona links
      await cloneCheckoutLinksIfTableExists(supabase, ck.id, newCk.id, newSlug);
    }
    console.log("[duplicateProductDeep] Copied", srcCheckouts.length, "checkouts to", newProductId);
  }

  console.log('[duplicateProductDeep] Duplication completed successfully');
  return { newProductId };
}
