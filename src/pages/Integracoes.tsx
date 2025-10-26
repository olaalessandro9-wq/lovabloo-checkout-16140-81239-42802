import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

interface Integration {
  id: string;
  integration_type: string;
  config: {
    apiToken?: string;
  };
  active: boolean;
}

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("vendor_integrations")
        .select("*")
        .eq("vendor_id", user.id)
        .eq("integration_type", "utmify")
        .maybeSingle();

      if (error) {
        console.error("Error loading integrations:", error);
        toast.error("Erro ao carregar integrações");
        return;
      }

      if (data) {
        setIntegrationId(data.id);
        setUtmifyToken(data.config?.apiToken || "");
        setUtmifyActive(data.active);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar integrações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (!utmifyToken.trim()) {
        toast.error("API Token é obrigatório");
        return;
      }

      const integrationData = {
        vendor_id: user.id,
        integration_type: "utmify",
        config: {
          apiToken: utmifyToken,
        },
        active: utmifyActive,
      };

      if (integrationId) {
        // Update
        const { error } = await supabase
          .from("vendor_integrations")
          .update(integrationData)
          .eq("id", integrationId);

        if (error) throw error;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("vendor_integrations")
          .insert(integrationData)
          .select()
          .single();

        if (error) throw error;
        setIntegrationId(data.id);
      }

      toast.success("Integração salva com sucesso!");
    } catch (error) {
      console.error("Error saving integration:", error);
      toast.error("Erro ao salvar integração");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);

      if (!utmifyToken.trim()) {
        toast.error("Configure o API Token antes de testar");
        return;
      }

      // Criar pedido de teste
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar um produto do vendedor
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name, price")
        .eq("vendor_id", user.id)
        .limit(1)
        .single();

      if (productError || !product) {
        toast.error("Você precisa ter pelo menos um produto cadastrado");
        return;
      }

      // Criar pedido de teste
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          vendor_id: user.id,
          product_id: product.id,
          customer_name: "Cliente Teste",
          customer_email: "teste@example.com",
          amount_cents: product.price,
          currency: "BRL",
          payment_method: "pix",
          status: "paid",
          is_test: true,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Chamar Edge Function para enviar para Utmify
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/forward-to-utmify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar para Utmify");
      }

      toast.success("Teste enviado com sucesso! Verifique o painel da Utmify.");
    } catch (error) {
      console.error("Error testing integration:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao testar integração");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
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
            <p className="text-sm text-muted-foreground mt-2">
              Obtenha seu token em:{" "}
              <a
                href="https://app.utmify.com.br/integrations/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
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
  );
};

export default Integracoes;

