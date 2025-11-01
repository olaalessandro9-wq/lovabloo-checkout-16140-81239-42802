import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Buscar token e ambiente do usuário
async function getUserPushinSettings() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Usuário não autenticado");

  const { data } = await supabase
    .from("payment_provider_credentials")
    .select("api_key, use_sandbox")
    .eq("workspace_id", userData.user.id)
    .eq("provider", "pushinpay")
    .maybeSingle();

  if (!data || !data.api_key) {
    throw new Error("Configure seu Token PushinPay em Financeiro.");
  }

  return {
    token: data.api_key,
    env: data.use_sandbox ? "sandbox" : "production",
  };
}

export async function createPix({
  value,
  webhook_url,
  split_rules,
}: {
  value: number;
  webhook_url?: string;
  split_rules?: Array<{ value: number; account_id: string }>;
}) {
  const { token, env } = await getUserPushinSettings();

  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pushinpay-create-pix`,
    {
      method: "POST",
      headers: {
        "x-pushinpay-token": token,
        "x-pushinpay-env": env,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value, webhook_url, split_rules }),
    }
  );

  const data = await resp.json();
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.error || "Falha ao criar PIX");
  }
  return data; // { id, qr_code, status, value, qr_code_base64, ... }
}

export async function getPixStatus(id: string) {
  const { token, env } = await getUserPushinSettings();

  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pushinpay-get-status?id=${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        "x-pushinpay-token": token,
        "x-pushinpay-env": env,
      },
    }
  );

  const data = await resp.json();
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.error || "Falha ao consultar status");
  }
  return data;
}
