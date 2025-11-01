import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Atualizar pagamento no DB pela chave 'payload.id'
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // SERVICE_ROLE para atualizar sem RLS bloquear
    );

    let status = "pending";
    if (payload.status === "paid") status = "paid";
    if (payload.status === "canceled" || payload.status === "expired") status = "canceled";

    const { error } = await supabase
      .from("pix_transactions")
      .update({
        status,
        payer_name: payload?.payer_name ?? null,
        payer_document: payload?.payer_national_registration ?? null,
        webhook_raw: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_payment_id", payload.id);

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
