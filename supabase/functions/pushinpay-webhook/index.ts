import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  findOrderByPixId,
  updateOrderStatusFromGateway,
} from "../_shared/db.ts";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";

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
  // Tratar preflight OPTIONS
  if (req.method === "OPTIONS") {
    return handleCorsPreFlight();
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const payload = (await req.json()) as WebhookPayload;

    // TODO: (opcional) validar assinatura:
    // const signature = req.headers.get(Deno.env.get('PUSHINPAY_WEBHOOK_HEADER_NAME') || 'X-PushinPay-Signature')

    // 1) Encontrar orderId pelo pixId
    const orderId = await findOrderByPixId(payload.id);
    if (!orderId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Order not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 2) Atualizar status do pedido
    await updateOrderStatusFromGateway(orderId, payload);

    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
