/**
 * State Machine para transições de status de pedidos
 * 
 * Regras:
 * - initiated → pix_pending (PIX gerado)
 * - pix_pending → paid | expired | declined
 * - initiated → paid | declined (cartão)
 * - paid → refunded | chargeback
 * - Estados "finais": refunded, chargeback, canceled, expired, abandoned
 * - Nunca reverte paid para pix_pending etc.
 */

export type OrderStatus =
  | 'initiated'
  | 'pix_pending'
  | 'authorized'
  | 'paid'
  | 'declined'
  | 'refunded'
  | 'chargeback'
  | 'canceled'
  | 'expired'
  | 'abandoned';

export type EventType =
  | 'PIX_GENERATED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_DECLINED'
  | 'PAYMENT_REFUNDED'
  | 'CHARGEBACK'
  | 'PIX_EXPIRED'
  | 'ORDER_CREATED'
  | 'ORDER_CANCELED'
  | 'CHECKOUT_ABANDONED';

/**
 * Define as transições permitidas de status
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  initiated: ['pix_pending', 'authorized', 'paid', 'declined', 'canceled', 'abandoned'],
  pix_pending: ['paid', 'expired', 'declined', 'canceled', 'abandoned'],
  authorized: ['paid', 'declined', 'canceled'],
  paid: ['refunded', 'chargeback'],
  declined: [], // final
  refunded: [], // final
  chargeback: [], // final
  canceled: [], // final
  expired: [], // final
  abandoned: [], // final
};

/**
 * Mapeia tipo de evento para novo status
 */
const EVENT_TO_STATUS: Record<EventType, OrderStatus | null> = {
  PIX_GENERATED: 'pix_pending',
  PAYMENT_APPROVED: 'paid',
  PAYMENT_DECLINED: 'declined',
  PAYMENT_REFUNDED: 'refunded',
  CHARGEBACK: 'chargeback',
  PIX_EXPIRED: 'expired',
  ORDER_CREATED: 'initiated',
  ORDER_CANCELED: 'canceled',
  CHECKOUT_ABANDONED: 'abandoned',
};

/**
 * Verifica se uma transição de status é permitida
 */
export function isTransitionAllowed(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowedStatuses.includes(newStatus);
}

/**
 * Determina o novo status baseado no tipo de evento e status atual
 * Retorna null se a transição não é permitida
 */
export function getNextStatus(
  eventType: EventType,
  currentStatus: OrderStatus
): OrderStatus | null {
  const targetStatus = EVENT_TO_STATUS[eventType];
  
  if (!targetStatus) {
    return null;
  }

  // Se já está no status alvo, não precisa transicionar
  if (currentStatus === targetStatus) {
    return null;
  }

  // Verifica se a transição é permitida
  if (!isTransitionAllowed(currentStatus, targetStatus)) {
    console.warn(
      `Transition not allowed: ${currentStatus} → ${targetStatus} (event: ${eventType})`
    );
    return null;
  }

  return targetStatus;
}

/**
 * Verifica se um status é final (não permite mais transições)
 */
export function isFinalStatus(status: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}

