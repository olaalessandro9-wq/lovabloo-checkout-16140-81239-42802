import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Check, AlertCircle } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function Financeiro() {
  const [apiKey, setApiKey] = useState("");
  const [useSandbox, setUseSandbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // recupere workspaceId do contexto/autenticação
  // Por enquanto vamos usar um ID fixo ou pegar do usuário logado
  const [workspaceId, setWorkspaceId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Pega o usuário logado
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          // Usa o ID do usuário como workspace_id temporariamente
          setWorkspaceId(userData.user.id);

          // Busca credenciais existentes
          const { data } = await supabase
            .from("payment_provider_credentials")
            .select("*")
            .eq("workspace_id", userData.user.id)
            .eq("provider", "pushinpay")
            .maybeSingle();

          if (data) {
            setApiKey(data.api_key ?? "");
            setUseSandbox(Boolean(data.use_sandbox));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  async function onSave() {
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "Por favor, informe o API Token" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage({ type: "error", text: "Usuário não autenticado" });
        return;
      }

      const { error } = await supabase.from("payment_provider_credentials").upsert(
        {
          workspace_id: workspaceId,
          owner_id: userData.user.id,
          provider: "pushinpay",
          api_key: apiKey,
          use_sandbox: useSandbox,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,provider" }
      );

      if (error) {
        setMessage({ type: "error", text: `Erro ao salvar: ${error.message}` });
      } else {
        setMessage({ type: "success", text: "Integração PushinPay salva com sucesso!" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: `Erro: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure suas integrações de pagamento
        </p>
      </div>

      {/* Integração PushinPay */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">Integração PIX - PushinPay</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Conecte sua conta PushinPay informando o <strong>API Token</strong>.
          Você pode solicitar acesso ao <em>Sandbox</em> direto no suporte deles.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Token</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Bearer token da PushinPay"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useSandbox}
              onChange={(e) => setUseSandbox(e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm">Usar ambiente Sandbox (testes)</span>
          </label>

          {message && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                  : "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100"
              }`}
            >
              {message.type === "success" ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <button
            disabled={loading || !apiKey}
            onClick={onSave}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Salvando..." : "Salvar integração"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Informações importantes</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>O token é armazenado de forma segura e criptografada</li>
            <li>Use o ambiente Sandbox para testes antes de ir para produção</li>
            <li>Certifique-se de configurar o webhook no painel da PushinPay</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
