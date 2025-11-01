import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function baseUrl(env: string) {
  return env === "production"
    ? Deno.env.get("PUSHINPAY_BASE_URL_PROD") || "https://api.pushinpay.com.br/api"
    : Deno.env.get("PUSHINPAY_BASE_URL_SANDBOX") || "https://api-sandbox.pushinpay.com.br/api";
}

const STATUS_PATH = Deno.env.get("PUSHINPAY_STATUS_PATH") ?? "/pix/consult";

serve(async (req: Request) => {
  try {
    if (req.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const urlObj = new URL(req.url);
    const id = urlObj.searchParams.get("id");
    const token = req.headers.get("x-pushinpay-token");
    const env = (
      req.headers.get("x-pushinpay-env") ??
      Deno.env.get("PUSHINPAY_ENV") ??
      "sandbox"
    ).toLowerCase();

    if (!token) {
      return Response.json({ message: "Faltou token." }, { status: 401 });
    }
    if (!id) {
      return Response.json({ message: "Faltou id." }, { status: 400 });
    }

    const url = `${baseUrl(env)}${STATUS_PATH}?id=${encodeURIComponent(id)}`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return Response.json(
        { ok: false, status: resp.status, error: data?.message || "Erro" },
        { status: resp.status }
      );
    }

    return Response.json({ ok: true, ...data });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
