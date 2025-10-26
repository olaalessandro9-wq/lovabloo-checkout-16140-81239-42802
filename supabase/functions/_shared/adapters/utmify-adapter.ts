/**
 * Adapter para Utmify v2
 * 
 * Converte eventos internos para o formato esperado pela API da Utmify.
 * - Valores em REAIS (não cents)
 * - Comissão sempre 0 (produtor recebe 100% até implementar configurável)
 * - Datas em UTC formato 'YYYY-MM-DD HH:MM:SS'
 * 
 * Documentação: https://api.utmify.com.br/api-credentials/orders
 */

export interface Order {
  id: string;
  vendor_id: string;
  product_id?: string;
  product_name?: string;
  amount_cents: number;
  status: string;
  payment_method?: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_document?: string | null;
  created_at: string; // ISO
  paid_at?: string | null; // ISO
  refunded_at?: string | null; // ISO
  is_test?: boolean;
  tracking_params?: Record<string, any> | null;
}

export interface OrderEvent {
  order: Order;
  type: string; // PAYMENT_APPROVED, etc.
  tracking_params?: Record<string, any> | null;
}

export interface UtmifyPayload {
  orderId: string;
  platform: string;
  paymentMethod?: string | null;
  status: string;
  createdAt: string;            // 'YYYY-MM-DD HH:MM:SS' (UTC)
  approvedDate?: string | null; // UTC
  refundedAt?: string | null;   // UTC
  customer?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    document?: string | null;
  };
  products?: Array<{
    id?: string;
    name?: string;
    quantity?: number;
    price: number; // em REAIS
  }>;
  trackingParameters?: Record<string, any>;
  valor: number;     // total em REAIS
  comissao: number;  // sempre 0 por enquanto
  isTest?: boolean;
  src?: string | null; // afiliado (também em trackingParameters)
}

/**
 * Converte data ISO para formato UTC 'YYYY-MM-DD HH:MM:SS'
 */
function toUtcYMDHMS(dateIso?: string | null): string | null {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return null;
  
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

/**
 * Converte cents para reais (decimal)
 */
function centsToReais(cents?: number | null): number {
  if (!cents) return 0;
  return Math.round(cents) / 100;
}

/**
 * Mapeia status interno para status Utmify
 */
function mapStatus(s: string): string {
  switch (s) {
    case 'pix_pending':
    case 'initiated':
    case 'authorized':
      return 'waiting_payment';
    case 'paid':
      return 'paid';
    case 'declined':
      return 'refused';
    case 'refunded':
      return 'refunded';
    case 'chargeback':
      return 'chargedback';
    case 'canceled':
      return 'refused'; // decisão: mapear como refused
    case 'abandoned':
      return 'abandoned'; // não será enviado
    default:
      return 'paid';
  }
}

/**
 * Converte pedido interno para formato Utmify
 * 
 * REGRAS:
 * - Venda direta (sem src): comissao=0, produtor recebe 100%
 * - Venda com afiliado (com src): comissao=0 por enquanto (TODO: configurável)
 * - Valores em REAIS (não cents)
 * - Datas em UTC 'YYYY-MM-DD HH:MM:SS'
 */
export function convertToUtmifyFormat(event: OrderEvent): UtmifyPayload | null {
  const order = event.order;
  
  // Não enviar eventos de abandono
  if (order.status === 'abandoned') {
    return null;
  }
  
  const total = centsToReais(order.amount_cents);
  const tracking = event.tracking_params ?? order.tracking_params ?? {};
  const src = (tracking?.src ?? null) as string | null;

  // Comissão atual: sempre 0 (direta e afiliado)
  // Futuro: usar taxa do produto quando existir e houver afiliado
  const commission = 0;

  return {
    orderId: order.id,
    platform: 'checkout-builder',
    paymentMethod: order.payment_method ?? null,
    status: mapStatus(order.status),
    createdAt: toUtcYMDHMS(order.created_at)!,
    approvedDate: toUtcYMDHMS(order.paid_at),
    refundedAt: toUtcYMDHMS(order.refunded_at),
    customer: {
      email: order.customer_email ?? null,
      name: order.customer_name ?? null,
      phone: order.customer_phone ?? null,
      document: order.customer_document ?? null,
    },
    products: order.product_id ? [{
      id: order.product_id,
      name: order.product_name ?? 'Produto',
      quantity: 1,
      price: Number(total.toFixed(2)), // em REAIS
    }] : undefined,
    trackingParameters: tracking,
    valor: Number(total.toFixed(2)),      // total em REAIS
    comissao: Number(commission.toFixed(2)), // sempre 0
    isTest: !!order.is_test,
    src, // afiliado no root também
  };
}

/**
 * Envia pedido para Utmify
 */
export async function sendOrderToUtmify(
  payload: UtmifyPayload,
  apiToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Idempotency-Key para evitar duplicidade
    const idempotencyKey = `${payload.orderId}-${payload.status}-${payload.approvedDate ?? 'na'}`;
    
    const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Utmify] Error:', response.status, errorText);
      return { success: false, error: errorText };
    }

    console.log('[Utmify] Order sent successfully:', payload.orderId);
    return { success: true };
  } catch (error) {
    console.error('[Utmify] Exception:', error);
    return { success: false, error: String(error) };
  }
}

