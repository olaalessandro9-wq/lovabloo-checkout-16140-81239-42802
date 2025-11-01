// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  workspaceId: string;
  checkoutId: string;
  amountCents: number;    // em centavos
};

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    const body = await req.json() as Body;
    if (!body.workspaceId || !body.checkoutId || !body.amountCents) {
      return new Response("Missing fields", { status: 400 });
    }
    if (body.amountCents < 50) {
      return new Response("amount must be >= 50 cents", { status: 422 });
    }

    // Busca credenciais PushinPay do dono desse workspace
    const { data: cred, error: credErr } = await supabase
      .from("payment_provider_credentials")
      .select("*")
      .eq("workspace_id", body.workspaceId)
      .eq("provider", "pushinpay")
      .single();

    if (credErr || !cred) {
      return new Response("PushinPay credentials not found", { status: 404 });
    }

    const baseUrl = cred.use_sandbox
      ? (Deno.env.get("PUSHINPAY_BASE_URL_SANDBOX") ?? "https://fapi-sandbox.pushinpay.com.br/api")
      : (Deno.env.get("PUSHINPAY_BASE_URL_PROD") ?? "https://fapi.pushinpay.com.br/api");

    // Webhook público da função
    const webhookUrl = Deno.env.get("PUBLIC_WEBHOOK_URL")!;

    // Cria cobrança na PushinPay
    const res = await fetch(`${baseUrl}/pix/cashIn`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cred.api_key}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: body.amountCents,
        webhook_url: webhookUrl,
        split_rules: [], // opcional
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      return new Response(`PushinPay error: ${res.status} ${text}`, { status: 502 });
    }
    const json = JSON.parse(text);

    // Salva / atualiza transação
    const payload_emv: string = json.qr_code;
    const qr_base64: string = (json.qr_code_base64 || "").replace(/^data:image\/png;base64,/, "");
    const provider_payment_id: string = json.id;

    const { error: upErr } = await supabase.from("pix_transactions").upsert({
      workspace_id: body.workspaceId,
      checkout_id: body.checkoutId,
      provider: "pushinpay",
      provider_payment_id,
      status: "pending",     // created -> mapeamos como pending
      value_cents: body.amountCents,
      payload_emv,
      qr_base64,
      updated_at: new Date().toISOString()
    }, { onConflict: "provider_payment_id" });

    if (upErr) {
      return new Response(`DB error: ${upErr.message}`, { status: 500 });
    }

    return new Response(JSON.stringify({
      providerPaymentId: provider_payment_id,
      qrText: payload_emv,
      qrBase64: qr_base64,
      status: json.status
    }), { headers: { "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(`Server error: ${e?.message ?? e}`, { status: 500 });
  }
});
