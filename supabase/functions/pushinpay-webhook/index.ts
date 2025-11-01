import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  findOrderByPixId,
  updateOrderStatusFromGateway,
} from "../_shared/db.ts";
import { handleOptions, withCorsError, withCorsJson } from "../_shared/cors.ts";

type WebhookPayload = {
  id: string;
  status: "created" | "paid" | "expired" | "canceled";
  value: number;
  end_to_end_id?: string | null;
  payer_name?: string | null;
  payer_national_registration?: string | null;
  [k: string]: unknown;
};

serve(async (req: Request) => {
  // 1) Tratar preflight OPTIONS
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  try {
    // 2) Validar método
    if (req.method !== "POST") {
      return withCorsError(req, "Method not allowed", 405);
    }

    const payload = (await req.json()) as WebhookPayload;

    // TODO: (opcional) validar assinatura:
    // const signature = req.headers.get(Deno.env.get('PUSHINPAY_WEBHOOK_HEADER_NAME') || 'X-PushinPay-Signature')

    // 3) Encontrar orderId pelo pixId
    const orderId = await findOrderByPixId(payload.id);
    if (!orderId) {
      return withCorsError(req, "Order not found", 404);
    }

    // 4) Atualizar status do pedido
    await updateOrderStatusFromGateway(orderId, payload);

    return withCorsJson(req, { ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return withCorsError(req, `Webhook error: ${String(err)}`, 500);
  }
});
