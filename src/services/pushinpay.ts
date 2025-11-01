import { supabase } from "@/integrations/supabase/client";

export type PushinPayEnvironment = "sandbox" | "production";

export interface PushinPaySettings {
  pushinpay_token: string;
  environment: PushinPayEnvironment;
}

// Função auxiliar para criptografar token no cliente (usando Edge Function)
async function encryptToken(token: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("encrypt-token", {
    body: { token },
  });
  if (error) throw new Error(error.message);
  return data.encrypted;
}

export interface PixChargeResponse {
  ok: boolean;
  pix?: {
    id: string;
    qr_code: string;
    qr_code_base64: string;
    status: string;
    value: number;
  };
  error?: string;
}

export interface PixStatusResponse {
  ok: boolean;
  status?: {
    status: "created" | "paid" | "expired" | "canceled";
    value: number;
    end_to_end_id?: string | null;
    payer_name?: string | null;
    payer_national_registration?: string | null;
  };
  error?: string;
}

/**
 * Salva ou atualiza as configurações da PushinPay para o usuário atual
 */
export async function savePushinPaySettings(
  settings: PushinPaySettings
): Promise<{ ok: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Usuário não autenticado" };

  try {
    // Criptografar token antes de salvar
    const tokenEncrypted = await encryptToken(settings.pushinpay_token);

    const { error } = await supabase
      .from("payment_gateway_settings")
      .upsert({
        user_id: user.id,
        token_encrypted: tokenEncrypted,
        environment: settings.environment,
      });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Recupera as configurações da PushinPay do usuário atual
 */
export async function getPushinPaySettings(): Promise<PushinPaySettings | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("payment_gateway_settings")
    .select("environment")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  
  // Retorna com token vazio (mascarado) - o token real nunca é exposto ao cliente
  return {
    pushinpay_token: "••••••••",
    environment: data.environment,
  } as PushinPaySettings;
}

/**
 * Cria uma cobrança PIX via Edge Function
 */
export async function createPixCharge(
  orderId: string,
  valueInCents: number
): Promise<PixChargeResponse> {
  const { data, error } = await supabase.functions.invoke(
    "pushinpay-create-pix",
    {
      body: { orderId, valueInCents },
    }
  );

  if (error) return { ok: false, error: error.message };
  return data as PixChargeResponse;
}

/**
 * Consulta o status de um pagamento PIX via Edge Function
 */
export async function getPixStatus(orderId: string): Promise<PixStatusResponse> {
  const { data, error } = await supabase.functions.invoke(
    "pushinpay-get-status",
    {
      body: { orderId },
    }
  );

  if (error) return { ok: false, error: error.message };
  return data as PixStatusResponse;
}
