import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type CreatePixInput = {
  value: number; // em centavos (>= 50)
  webhook_url?: string;
  split_rules?: Array<{ value: number; account_id: string }>;
};

function baseUrl(env: string) {
  return env === "production"
    ? Deno.env.get("PUSHINPAY_BASE_URL_PROD") || "https://api.pushinpay.com.br/api"
    : Deno.env.get("PUSHINPAY_BASE_URL_SANDBOX") || "https://api-sandbox.pushinpay.com.br/api";
}

const PIX_CREATE_PATH = Deno.env.get("PUSHINPAY_CREATE_PATH") ?? "/pix/cashIn";
const DEFAULT_WEBHOOK = Deno.env.get("PUSHINPAY_WEBHOOK_PUBLIC_URL") ?? "";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { value, webhook_url, split_rules }: CreatePixInput = await req.json();

    // Token e ambiente vêm do front no header (do usuário logado)
    const token = req.headers.get("x-pushinpay-token");
    const env = (
      req.headers.get("x-pushinpay-env") ??
      Deno.env.get("PUSHINPAY_ENV") ??
      "sandbox"
    ).toLowerCase();

    if (!token) {
      return Response.json(
        { message: "Faltou o token do usuário (x-pushinpay-token)." },
        { status: 401 }
      );
    }
    if (!value || value < 50) {
      return Response.json(
        { message: "O campo value deve ser no mínimo 50 (centavos)." },
        { status: 422 }
      );
    }

    const url = `${baseUrl(env)}${PIX_CREATE_PATH}`;
    const body = {
      value,
      webhook_url: webhook_url ?? DEFAULT_WEBHOOK || undefined,
      split_rules: Array.isArray(split_rules) ? split_rules : undefined,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return Response.json(
        {
          ok: false,
          status: resp.status,
          error: data?.message || "Erro ao criar PIX",
          details: data,
        },
        { status: resp.status }
      );
    }

    // data esperado: { id, qr_code, status, value, webhook_url, qr_code_base64, ... }
    return Response.json({ ok: true, ...data });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
