// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );

    const { workspaceId, providerPaymentId } = await req.json();

    if (!workspaceId || !providerPaymentId) {
      return new Response("Missing fields", { status: 400 });
    }

    // credenciais
    const { data: cred } = await supabase
      .from("payment_provider_credentials")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("provider", "pushinpay")
      .single();

    if (!cred) return new Response("credentials not found", { status: 404 });

    const baseUrl = cred.use_sandbox
      ? (Deno.env.get("PUSHINPAY_BASE_URL_SANDBOX") ?? "https://fapi-sandbox.pushinpay.com.br/api")
      : (Deno.env.get("PUSHINPAY_BASE_URL_PROD") ?? "https://fapi.pushinpay.com.br/api");

    const res = await fetch(`${baseUrl}/pix/${providerPaymentId}`, {
      headers: {
        Authorization: `Bearer ${cred.api_key}`,
        Accept: "application/json"
      }
    });

    const text = await res.text();
    if (!res.ok) return new Response(text, { status: res.status });

    const json = JSON.parse(text);

    // normaliza status
    let status = "pending";
    if (json.status === "paid") status = "paid";
    if (json.status === "canceled" || json.status === "expired") status = "canceled";

    // atualiza local
    await supabase.from("pix_transactions")
      .update({
        status,
        payer_name: json.payer_name ?? null,
        payer_document: json.payer_national_registration ?? null,
        updated_at: new Date().toISOString()
      })
      .eq("provider_payment_id", providerPaymentId);

    return new Response(JSON.stringify({ status }), { headers: { "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(`Server error: ${e?.message ?? e}`, { status: 500 });
  }
});
