import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  loadGatewaySettingsByOrder,
  savePaymentMapping,
} from "../_shared/db.ts";

const JSON_HEADER = { "Content-Type": "application/json" };

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { orderId, valueInCents } = await req.json();

    // 1) Recupera token/env/feePercent do dono do pedido
    const { token, environment, platformFeePercent, platformAccountId } =
      await loadGatewaySettingsByOrder(orderId);

    const baseURL =
      environment === "sandbox"
        ? "https://api-sandbox.pushinpay.com.br/api"
        : "https://api.pushinpay.com.br/api";

    // 2) Monta body
    const body: Record<string, unknown> = { value: valueInCents }; // em centavos

    // Split opcional (sua taxa)
    if (platformFeePercent && platformFeePercent > 0 && platformAccountId) {
      const feeValue = Math.floor((valueInCents * platformFeePercent) / 100);
      if (feeValue > 0) {
        body.split_rules = [
          { value: feeValue, account_id: platformAccountId },
        ];
      }
    }

    // 3) Chama PushinPay
    const res = await fetch(`${baseURL}/pix/cashIn`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ ok: false, error: errText }), {
        status: 502,
        headers: JSON_HEADER,
      });
    }

    const data = await res.json(); // { id, qr_code, qr_code_base64, status, ... }

    // 4) Salva mapeamento
    await savePaymentMapping(orderId, data.id);

    return new Response(JSON.stringify({ ok: true, pix: data }), {
      headers: JSON_HEADER,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 400,
      headers: JSON_HEADER,
    });
  }
});
