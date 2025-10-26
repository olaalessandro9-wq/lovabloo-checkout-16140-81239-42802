/**
 * Adapter para normalizar eventos do PushingPay para o padrão interno
 * 
 * Eventos do PushingPay:
 * - pix.created: PIX gerado com QR code
 * - payment.approved: Pagamento aprovado
 * - payment.declined: Pagamento recusado
 * - payment.refunded: Reembolso
 * - payment.chargeback: Chargeback
 * - pix.expired: PIX expirado
 */

export type PushingPayEvent =
  | { type: 'pix.created'; id: string; payment_id: string; qr_code: string; qr_code_base64: string; expires_at: string; amount: number; }
  | { type: 'payment.approved'; id: string; payment_id: string; amount: number; paid_at: string; }
  | { type: 'payment.declined'; id: string; payment_id: string; reason: string; declined_at: string; }
  | { type: 'payment.refunded'; id: string; payment_id: string; amount: number; refunded_at: string; reason?: string; }
  | { type: 'payment.chargeback'; id: string; payment_id: string; amount: number; chargeback_at: string; reason?: string; }
  | { type: 'pix.expired'; id: string; payment_id: string; expired_at: string; };

export type NormalizedEvent = {
  eventType: 'PIX_GENERATED' | 'PAYMENT_APPROVED' | 'PAYMENT_DECLINED' | 'PAYMENT_REFUNDED' | 'CHARGEBACK' | 'PIX_EXPIRED' | 'ORDER_CREATED' | 'ORDER_CANCELED' | 'CHECKOUT_ABANDONED';
  status: 'initiated' | 'pix_pending' | 'authorized' | 'paid' | 'declined' | 'refunded' | 'chargeback' | 'canceled' | 'expired' | 'abandoned';
  gatewayEventId: string;
  occurredAt: Date;
};

/**
 * Normaliza um evento do PushingPay para o padrão interno
 */
export function normalizePushingPayEvent(event: PushingPayEvent): NormalizedEvent {
  const baseEvent = {
    gatewayEventId: event.id,
    occurredAt: new Date(),
  };

  switch (event.type) {
    case 'pix.created':
      return {
        ...baseEvent,
        eventType: 'PIX_GENERATED',
        status: 'pix_pending',
        occurredAt: new Date(),
      };

    case 'payment.approved':
      return {
        ...baseEvent,
        eventType: 'PAYMENT_APPROVED',
        status: 'paid',
        occurredAt: new Date(event.paid_at),
      };

    case 'payment.declined':
      return {
        ...baseEvent,
        eventType: 'PAYMENT_DECLINED',
        status: 'declined',
        occurredAt: new Date(event.declined_at),
      };

    case 'payment.refunded':
      return {
        ...baseEvent,
        eventType: 'PAYMENT_REFUNDED',
        status: 'refunded',
        occurredAt: new Date(event.refunded_at),
      };

    case 'payment.chargeback':
      return {
        ...baseEvent,
        eventType: 'CHARGEBACK',
        status: 'chargeback',
        occurredAt: new Date(event.chargeback_at),
      };

    case 'pix.expired':
      return {
        ...baseEvent,
        eventType: 'PIX_EXPIRED',
        status: 'expired',
        occurredAt: new Date(event.expired_at),
      };

    default:
      throw new Error(`Unknown PushingPay event type: ${(event as any).type}`);
  }
}

/**
 * Valida a assinatura HMAC do webhook do PushingPay
 */
export async function verifyPushingPaySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === signature;
}

