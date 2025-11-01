import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  loadTokenEnvAndPixId,
  updateOrderStatusFromGateway,
} from "../_shared/db.ts";

const JSON_HEADER = { "Content-Type": "application/json" };

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { orderId } = await req.json();

    const { token, environment, pixId } = await loadTokenEnvAndPixId(orderId);
    const baseURL =
      environment === "sandbox"
        ? "https://api-sandbox.pushinpay.com.br/api"
        : "https://api.pushinpay.com.br/api";

    const res = await fetch(`${baseURL}/pix/consult/${pixId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ ok: false, error: errText }), {
        status: 502,
        headers: JSON_HEADER,
      });
    }

    const status = await res.json(); // { status: "created" | "paid" | "expired" | "canceled" ... }

    await updateOrderStatusFromGateway(orderId, status);

    return new Response(JSON.stringify({ ok: true, status }), {
      headers: JSON_HEADER,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 400,
      headers: JSON_HEADER,
    });
  }
});
