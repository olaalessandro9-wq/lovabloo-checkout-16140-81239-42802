import { supabase } from "@/integrations/supabase/client";

export async function loadPublicCheckoutData(slug: string) {
  // Busca o payment_link pelo slug (tolerante a 0 linhas)
  const { data: linkData, error: linkError } = await supabase
    .from('payment_links')
    .select(`
      id,
      slug,
      offer_id,
      offers!inner (
        id,
        product_id,
        products!inner (
          id,
          name,
          description,
          price,
          image_url,
          support_name,
          required_fields,
          default_payment_method
        )
      )
    `)
    .eq('slug', slug)
    .maybeSingle(); // Tolerante a 0 linhas

  if (linkError) {
    throw linkError;
  }

  if (!linkData) {
    throw new Error('Link de pagamento não encontrado');
  }

  // Busca o checkout associado a este payment_link (tolerante a 0 linhas)
  const { data: checkoutLinkData, error: checkoutLinkError } = await supabase
    .from('checkout_links')
    .select(`
      checkout_id,
      checkouts!inner (
        id,
        name,
        slug,
        visits_count,
        seller_name,
        font,
        background_color,
        text_color,
        primary_color,
        button_color,
        button_text_color,
        components,
        top_components,
        bottom_components
      )
    `)
    .eq('link_id', linkData.id)
    .maybeSingle(); // Tolerante a 0 linhas

  if (checkoutLinkError) {
    throw checkoutLinkError;
  }

  if (!checkoutLinkData) {
    throw new Error('Checkout não encontrado para este link');
  }

  const product = linkData.offers.products;
  const checkout = checkoutLinkData.checkouts;

  // Endurece leitura dos campos opcionais
  const rf = (product?.required_fields ?? {}) as Partial<{ phone: boolean; cpf: boolean }>;
  const requirePhone = rf.phone === true;
  const requireCpf   = rf.cpf   === true;

  // **CORREÇÃO**: banco usa "credit_card", nunca "card"
  const defaultMethod =
    product?.default_payment_method === 'credit_card' ? 'credit_card' : 'pix';

  return {
    checkout: {
      id: checkout.id,
      name: checkout.name,
      slug: checkout.slug,
      visits_count: checkout.visits_count,
      seller_name: checkout.seller_name,
      font: checkout.font,
      background_color: checkout.background_color,
      text_color: checkout.text_color,
      primary_color: checkout.primary_color,
      button_color: checkout.button_color,
      button_text_color: checkout.button_text_color,
      components: checkout.components,
      top_components: checkout.top_components,
      bottom_components: checkout.bottom_components,
    },
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      support_name: product.support_name,
    },
    requirePhone,
    requireCpf,
    defaultMethod, // 'pix' | 'credit_card'
  };
}
