import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt } from "../_shared/crypto.ts";

const JSON_HEADER = { "Content-Type": "application/json" };

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BASE_PROD = Deno.env.get("PUSHINPAY_BASE_URL_PROD") || "https://api.pushinpay.com.br/api";
const BASE_SANDBOX = Deno.env.get("PUSHINPAY_BASE_URL_SANDBOX") || "https://api-sandbox.pushinpay.com.br/api";
const PLATFORM_ACCOUNT = Deno.env.get("PLATFORM_PUSHINPAY_ACCOUNT_ID");

// Taxa da plataforma fixada no backend (controlada apenas pelo administrador)
const PLATFORM_FEE_PERCENT = parseFloat(Deno.env.get("PLATFORM_FEE_PERCENT") || "7.5");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: JSON_HEADER }
    );
  }

  try {
    const { orderId, value } = await req.json();

    // Validações de entrada
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId é obrigatório" }),
        { status: 422, headers: JSON_HEADER }
      );
    }

    if (typeof value !== "number" || value < 50) {
      return new Response(
        JSON.stringify({ error: "Valor mínimo é R$ 0,50 (50 centavos)" }),
        { status: 422, headers: JSON_HEADER }
      );
    }

    // 1) Buscar o pedido e identificar o vendedor
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, user_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Pedido não encontrado" }),
        { status: 404, headers: JSON_HEADER }
      );
    }

    // 2) Buscar configurações do gateway do vendedor
    const { data: settings, error: settingsErr } = await supabase
      .from("payment_gateway_settings")
      .select("*")
      .eq("user_id", order.user_id)
      .single();

    if (settingsErr || !settings) {
      return new Response(
        JSON.stringify({ 
          error: "Configuração de gateway não encontrada. Configure em Financeiro." 
        }),
        { status: 404, headers: JSON_HEADER }
      );
    }

    // 3) Descriptografar token
    let token: string;
    try {
      token = await decrypt(settings.token_encrypted);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Erro ao processar credenciais de pagamento" }),
        { status: 500, headers: JSON_HEADER }
      );
    }

    // 4) Determinar URL base
    const environment = settings.environment as "sandbox" | "production";
    const baseURL = environment === "production" ? BASE_PROD : BASE_SANDBOX;

    // 5) Calcular split usando taxa fixa do backend
    const platformValue = Math.round(value * PLATFORM_FEE_PERCENT / 100);

    // Validar que split não excede 50%
    if (platformValue > value * 0.5) {
      return new Response(
        JSON.stringify({ error: "Split não pode exceder 50% do valor da transação" }),
        { status: 422, headers: JSON_HEADER }
      );
    }

    // Montar split_rules apenas se houver taxa e PLATFORM_ACCOUNT configurado
    const split_rules = platformValue > 0 && PLATFORM_ACCOUNT
      ? [{ value: platformValue, account_id: PLATFORM_ACCOUNT }]
      : [];

    // 6) Construir webhook URL
    const webhookUrl = `${new URL(req.url).origin}/functions/v1/pushinpay-webhook`;

    // 7) Criar cobrança na PushinPay
    const requestBody = {
      value,
      webhook_url: webhookUrl,
      ...(split_rules.length > 0 && { split_rules }),
    };

    const response = await fetch(`${baseURL}/pix/cashIn`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Tratamento de erros da API
    if (!response.ok) {
      const errorText = await response.text();
      
      // Erros específicos
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: "Token PushinPay inválido. Verifique suas credenciais em Financeiro." 
          }),
          { status: 401, headers: JSON_HEADER }
        );
      }

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Muitas tentativas. Aguarde alguns segundos e tente novamente." 
          }),
          { status: 429, headers: JSON_HEADER }
        );
      }

      if (response.status >= 500) {
        return new Response(
          JSON.stringify({ 
            error: "Serviço de pagamento temporariamente indisponível. Tente novamente em instantes." 
          }),
          { status: 502, headers: JSON_HEADER }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: "Erro ao criar cobrança PIX", 
          detail: errorText 
        }),
        { status: response.status, headers: JSON_HEADER }
      );
    }

    const pixData = await response.json();

    // 8) Salvar mapeamento order_id -> pix_id
    const { error: mapErr } = await supabase
      .from("payments_map")
      .upsert({ order_id: orderId, pix_id: pixData.id });

    if (mapErr) {
      console.error("Erro ao salvar mapeamento:", mapErr);
      // Não falha a requisição, mas loga o erro
    }

    // 9) Retornar dados do PIX
    return new Response(
      JSON.stringify({
        ok: true,
        pix_id: pixData.id,
        status: pixData.status,
        qr_code: pixData.qr_code,
        qr_code_base64: pixData.qr_code_base64,
      }),
      { headers: JSON_HEADER }
    );

  } catch (error) {
    console.error("Erro inesperado:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro inesperado ao processar pagamento", 
        detail: String(error) 
      }),
      { status: 500, headers: JSON_HEADER }
    );
  }
});
