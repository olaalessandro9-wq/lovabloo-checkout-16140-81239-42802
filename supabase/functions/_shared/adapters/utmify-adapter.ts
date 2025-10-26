/**
 * Adapter para Utmify
 * 
 * Converte eventos internos para o formato esperado pela API da Utmify.
 * 
 * Documentação: https://api.utmify.com.br/api-credentials/orders
 */

export interface UtmifyOrder {
  orderId: string;
  platform: string;
  paymentMethod: 'pix' | 'credit_card' | 'boleto' | 'paypal' | 'free_price';
  status: 'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback';
  createdAt: string; // 'YYYY-MM-DD HH:MM:SS' UTC
  approvedDate: string | null; // 'YYYY-MM-DD HH:MM:SS' UTC
  refundedAt: string | null; // 'YYYY-MM-DD HH:MM:SS' UTC
  customer: {
    name: string;
    email: string;
    phone?: string | null;
    document?: string | null;
    country?: string;
    ip?: string;
  };
  products: Array<{
    id: string;
    name: string;
    planId?: string | null;
    planName?: string | null;
    quantity: number;
    priceInCents: number;
  }>;
  trackingParameters: {
    src?: string | null;
    sck?: string | null;
    utm_source?: string | null;
    utm_campaign?: string | null;
    utm_medium?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
    currency?: 'BRL' | 'USD' | 'EUR' | 'GBP' | 'ARS' | 'CAD';
  };
  isTest?: boolean;
}

/**
 * Mapeia status interno para status Utmify
 */
export function mapStatusToUtmify(internalStatus: string): UtmifyOrder['status'] | null {
  const mapping: Record<string, UtmifyOrder['status']> = {
    'initiated': 'waiting_payment',
    'pix_pending': 'waiting_payment',
    'authorized': 'waiting_payment',
    'paid': 'paid',
    'declined': 'refused',
    'canceled': 'refused',
    'refunded': 'refunded',
    'chargeback': 'chargedback',
  };

  return mapping[internalStatus] || null;
}

/**
 * Mapeia método de pagamento interno para Utmify
 */
export function mapPaymentMethodToUtmify(
  internalMethod: string
): UtmifyOrder['paymentMethod'] {
  const mapping: Record<string, UtmifyOrder['paymentMethod']> = {
    'pix': 'pix',
    'credit_card': 'credit_card',
    'boleto': 'boleto',
    'paypal': 'paypal',
    'free': 'free_price',
  };

  return mapping[internalMethod] || 'pix';
}

/**
 * Formata data para o formato Utmify (YYYY-MM-DD HH:MM:SS UTC)
 * 
 * IMPORTANTE: Utmify NÃO aceita ISO 8601 com "T" e "Z"!
 */
export function formatDateForUtmify(date: Date | string | null): string | null {
  if (!date) return null;

  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return null;

  // Formatar como 'YYYY-MM-DD HH:MM:SS' em UTC
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Converte pedido interno para formato Utmify
 */
export function convertOrderToUtmify(order: {
  id: string;
  vendor_id: string;
  product_id: string;
  product_name: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_document: string | null;
  customer_country?: string | null;
  customer_ip?: string | null;
  amount_cents: number;
  gateway_fee_cents?: number;
  payment_method: string;
  status: string;
  created_at: string;
  approved_at?: string | null;
  refunded_at?: string | null;
  tracking_params?: Record<string, string | null>;
  is_test?: boolean;
}): UtmifyOrder | null {
  // Mapear status
  const utmifyStatus = mapStatusToUtmify(order.status);
  if (!utmifyStatus) {
    console.log('[Utmify] Status não mapeável:', order.status);
    return null;
  }

  // Não enviar eventos de abandono para Utmify
  if (order.status === 'abandoned') {
    return null;
  }

  // Calcular comissões
  const gatewayFee = order.gateway_fee_cents || 0;
  const userCommission = order.amount_cents - gatewayFee;

  return {
    orderId: order.id,
    platform: 'RiseCheckout',
    paymentMethod: mapPaymentMethodToUtmify(order.payment_method),
    status: utmifyStatus,
    createdAt: formatDateForUtmify(order.created_at)!,
    approvedDate: formatDateForUtmify(order.approved_at),
    refundedAt: formatDateForUtmify(order.refunded_at),
    customer: {
      name: order.customer_name || 'Cliente',
      email: order.customer_email || 'nao-informado@example.com',
      phone: order.customer_phone,
      document: order.customer_document,
      country: order.customer_country || 'BR',
      ip: order.customer_ip,
    },
    products: [
      {
        id: order.product_id,
        name: order.product_name,
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: order.amount_cents,
      },
    ],
    trackingParameters: {
      src: order.tracking_params?.src,
      sck: order.tracking_params?.sck,
      utm_source: order.tracking_params?.utm_source,
      utm_campaign: order.tracking_params?.utm_campaign,
      utm_medium: order.tracking_params?.utm_medium,
      utm_content: order.tracking_params?.utm_content,
      utm_term: order.tracking_params?.utm_term,
    },
    commission: {
      totalPriceInCents: order.amount_cents,
      gatewayFeeInCents: gatewayFee,
      userCommissionInCents: userCommission,
      currency: 'BRL',
    },
    isTest: order.is_test || false,
  };
}

/**
 * Envia pedido para Utmify
 */
export async function sendOrderToUtmify(
  order: UtmifyOrder,
  apiToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken,
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Utmify] Error:', response.status, errorText);
      return { success: false, error: errorText };
    }

    console.log('[Utmify] Order sent successfully:', order.orderId);
    return { success: true };
  } catch (error) {
    console.error('[Utmify] Exception:', error);
    return { success: false, error: String(error) };
  }
}

