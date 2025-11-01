// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function timingSafeEqual(a: string, b: string) {
  const ba = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ba.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < ba.length; i++) out |= ba[i] ^ bb[i];
  return out === 0;
}

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    // valida header
    const headerName = Deno.env.get("PUSHINPAY_WEBHOOK_HEADER") || "X-PushinPay-Secret";
    const secretEnv = Deno.env.get("PUSHINPAY_WEBHOOK_SECRET") || "";
    const received = req.headers.get(headerName) || "";
    if (!secretEnv || !timingSafeEqual(received, secretEnv)) {
      return new Response("Unauthorized webhook", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!  // SERVICE_ROLE para atualizar sem RLS bloquear
    );

    const payload = await req.json();
    // expected: id, status, value, payer_name, payer_national_registration ...
    const providerPaymentId = payload?.id;
    const pStatus = payload?.status; // created|paid|canceled|expired

    if (!providerPaymentId || !pStatus) {
      return new Response("invalid payload", { status: 400 });
    }

    let status = "pending";
    if (pStatus === "paid") status = "paid";
    if (pStatus === "canceled" || pStatus === "expired") status = "canceled";

    const { error } = await supabase.from("pix_transactions")
      .update({
        status,
        payer_name: payload?.payer_name ?? null,
        payer_document: payload?.payer_national_registration ?? null,
        webhook_raw: payload,
        updated_at: new Date().toISOString()
      })
      .eq("provider_payment_id", providerPaymentId);

    if (error) return new Response(error.message, { status: 500 });

    return new Response("OK");
  } catch (e) {
    return new Response(`Server error: ${e?.message ?? e}`, { status: 500 });
  }
});
