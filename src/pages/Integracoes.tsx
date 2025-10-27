import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

const Integracoes = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [utmifyToken, setUtmifyToken] = useState("");
  const [utmifyActive, setUtmifyActive] = useState(false);
  const [integrationId, setIntegrationId] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      
      // Fake load (sem Supabase)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar integrações");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Integração salva com sucesso!");
    setSaving(false);
  };

  const handleTest = async () => {
    if (!utmifyToken.trim()) {
      toast.error("Configure o API Token antes de testar");
      return;
    }
    setTesting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Teste enviado com sucesso!");
    setTesting(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Integrações</h1>
        <p className="mt-2" style={{ color: 'var(--subtext)' }}>
          Configure integrações com ferramentas de tracking e automação
        </p>
      </div>

      {/* Utmify */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Utmify
                {utmifyActive && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {!utmifyActive && integrationId && <XCircle className="h-5 w-5 text-gray-400" />}
              </CardTitle>
              <CardDescription>
                Tracking de conversões, comissões e atribuição de vendas
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://utmify.com.br", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar Utmify
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="utmify-token">API Token</Label>
            <Input
              id="utmify-token"
              type="password"
              placeholder="Cole seu API token da Utmify"
              value={utmifyToken}
              onChange={(e) => setUtmifyToken(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm mt-2" style={{ color: 'var(--subtext)' }}>
              Obtenha seu token em:{" "}
              <a
                href="https://app.utmify.com.br/integrations/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: 'var(--brand)' }}
              >
                Integrações → Webhooks → Credenciais de API
              </a>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="utmify-active"
              checked={utmifyActive}
              onChange={(e) => setUtmifyActive(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="utmify-active" className="cursor-pointer">
              Integração ativa
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing || !utmifyToken}>
              {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Testar Envio
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
};

export default Integracoes;
