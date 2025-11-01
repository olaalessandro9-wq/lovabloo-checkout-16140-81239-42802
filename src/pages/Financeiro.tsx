import { useEffect, useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import {
  savePushinPaySettings,
  getPushinPaySettings,
  type PushinPayEnvironment,
} from "@/services/pushinpay";

export default function Financeiro() {
  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [hasExistingToken, setHasExistingToken] = useState(false);
  const [environment, setEnvironment] = useState<PushinPayEnvironment>("sandbox");
  const [platformFeePercent, setPlatformFeePercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getPushinPaySettings();
        if (settings) {
          // Se retornar token mascarado, significa que já existe
          if (settings.pushinpay_token === "••••••••") {
            setHasExistingToken(true);
            setApiToken(""); // Não preenche o campo
          } else {
            setApiToken(settings.pushinpay_token ?? "");
          }
          setEnvironment(settings.environment ?? "sandbox");
          setPlatformFeePercent(settings.platform_fee_percent ?? 0);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  async function onSave() {
    // Se já existe token e o campo está vazio, não exigir novo token
    if (!hasExistingToken && !apiToken.trim()) {
      setMessage({ type: "error", text: "Por favor, informe o API Token" });
      return;
    }

    // Se tem token existente e campo vazio, mantém o token existente
    if (hasExistingToken && !apiToken.trim()) {
      setMessage({ type: "error", text: "Para atualizar, informe um novo token ou mantenha o atual" });
      return;
    }

    if (platformFeePercent < 0 || platformFeePercent > 100) {
      setMessage({ type: "error", text: "Taxa da plataforma deve estar entre 0 e 100%" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await savePushinPaySettings({
        pushinpay_token: apiToken,
        environment,
        platform_fee_percent: platformFeePercent,
      });

      if (result.ok) {
        setMessage({ type: "success", text: "Integração PushinPay salva com sucesso!" });
      } else {
        setMessage({ type: "error", text: `Erro ao salvar: ${result.error}` });
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
          Configure suas integrações de pagamento e split de receita
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
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={hasExistingToken ? "Token configurado (deixe vazio para manter)" : "Bearer token da PushinPay"}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showToken ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {hasExistingToken && (
              <p className="text-xs text-muted-foreground mt-1">
                Token já configurado. Deixe em branco para manter o atual ou informe um novo para atualizar.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ambiente</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as PushinPayEnvironment)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="sandbox">Sandbox (testes)</option>
              <option value="production">Produção</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Taxa da Plataforma (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={platformFeePercent}
              onChange={(e) => setPlatformFeePercent(parseFloat(e.target.value) || 0)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: 5.5 para 5,5%"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Percentual que será retido pela plataforma em cada transação (split de pagamento)
            </p>
          </div>

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
            disabled={loading || !apiToken}
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
            <li>O token é armazenado de forma segura no banco de dados</li>
            <li>Use o ambiente Sandbox para testes antes de ir para produção</li>
            <li>Certifique-se de configurar o webhook no painel da PushinPay</li>
            <li>A taxa da plataforma é aplicada automaticamente em cada transação PIX</li>
            <li>Configure o PLATFORM_ACCOUNT_ID nas variáveis de ambiente das Edge Functions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
