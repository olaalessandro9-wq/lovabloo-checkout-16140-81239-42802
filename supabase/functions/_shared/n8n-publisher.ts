/**
 * Helper para publicar eventos no n8n
 * 
 * O n8n pode ter um webhook listener que recebe eventos e dispara workflows:
 * - Enviar e-mail de compra aprovada
 * - Enviar e-mail de abandono
 * - Notificar vendedor
 * - Atualizar CRM
 * - etc.
 */

export type N8nEvent = {
  orderId: string;
  vendorId: string;
  eventType: string;
  status: string;
  customerEmail?: string;
  customerName?: string;
  amount?: number;
  productName?: string;
  occurredAt: string;
};

/**
 * Publica um evento no n8n via webhook
 */
export async function publishToN8n(event: N8nEvent): Promise<void> {
  const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
  
  if (!n8nWebhookUrl) {
    console.warn('[n8n] N8N_WEBHOOK_URL not configured, skipping');
    return;
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}: ${await response.text()}`);
    }

    console.log('[n8n] Event published:', {
      orderId: event.orderId,
      eventType: event.eventType,
    });

  } catch (error) {
    console.error('[n8n] Failed to publish event:', error);
    // Não lançar erro para não quebrar o fluxo principal
  }
}

/**
 * Publica múltiplos eventos em lote
 */
export async function publishBatchToN8n(events: N8nEvent[]): Promise<void> {
  const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
  
  if (!n8nWebhookUrl) {
    console.warn('[n8n] N8N_WEBHOOK_URL not configured, skipping');
    return;
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}: ${await response.text()}`);
    }

    console.log(`[n8n] Batch published: ${events.length} events`);

  } catch (error) {
    console.error('[n8n] Failed to publish batch:', error);
  }
}

