import { supabase } from "@/integrations/supabase/client";

export async function loadPublicCheckoutData(slug: string) {
  // Estratégia 1: Buscar pelo slug do payment_link (fluxo principal)
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
    .maybeSingle();

  // Se encontrou pelo payment_link, segue o fluxo normal
  if (!linkError && linkData) {
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
      .maybeSingle();

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
      defaultMethod,
    };
  }

  // Estratégia 2: Buscar pelo slug do checkout (fallback para compatibilidade)
  const { data: checkoutData, error: checkoutError } = await supabase
    .from('checkouts')
    .select(`
      id,
      name,
      slug,
      visits_count,
      seller_name,
      product_id,
      font,
      background_color,
      text_color,
      primary_color,
      button_color,
      button_text_color,
      components,
      top_components,
      bottom_components,
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
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (checkoutError) {
    throw checkoutError;
  }

  if (!checkoutData) {
    throw new Error('Link de pagamento não encontrado');
  }

  const product = checkoutData.products;

  // Endurece leitura dos campos opcionais
  const rf = (product?.required_fields ?? {}) as Partial<{ phone: boolean; cpf: boolean }>;
  const requirePhone = rf.phone === true;
  const requireCpf   = rf.cpf   === true;

  const defaultMethod =
    product?.default_payment_method === 'credit_card' ? 'credit_card' : 'pix';

  return {
    checkout: {
      id: checkoutData.id,
      name: checkoutData.name,
      slug: checkoutData.slug,
      visits_count: checkoutData.visits_count,
      seller_name: checkoutData.seller_name,
      font: checkoutData.font,
      background_color: checkoutData.background_color,
      text_color: checkoutData.text_color,
      primary_color: checkoutData.primary_color,
      button_color: checkoutData.button_color,
      button_text_color: checkoutData.button_text_color,
      components: checkoutData.components,
      top_components: checkoutData.top_components,
      bottom_components: checkoutData.bottom_components,
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
    defaultMethod,
  };
}
