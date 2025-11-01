import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  findOrderByPixId,
  updateOrderStatusFromGateway,
} from "../_shared/db.ts";

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
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const payload = (await req.json()) as WebhookPayload;

    // TODO: (opcional) validar assinatura:
    // const signature = req.headers.get(Deno.env.get('PUSHINPAY_WEBHOOK_HEADER_NAME') || 'X-PushinPay-Signature')

    // 1) Encontrar orderId pelo pixId
    const orderId = await findOrderByPixId(payload.id);
    if (!orderId) {
      return Response.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    // 2) Atualizar status do pedido
    await updateOrderStatusFromGateway(orderId, payload);

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
