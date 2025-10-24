import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { parseJsonSafely } from "@/lib/utils";
import CheckoutComponentRenderer from "@/components/checkout/CheckoutComponentRenderer";

interface CheckoutData {
  id: string;
  name: string;
  slug: string;
  visits_count: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
  };
  // Campos de personalização
  font?: string;
  background_color?: string;
  text_color?: string;
  primary_color?: string;
  button_color?: string;
  button_text_color?: string;
  components?: any[];
  top_components?: any[];
  bottom_components?: any[];
}

const PublicCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });

  useEffect(() => {
    if (slug) {
      loadCheckout();
      trackVisit();
    }
  }, [slug]);

  const loadCheckout = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("checkouts")
        .select(`
          id,
          name,
          slug,
          visits_count,
          font,
          background_color,
          text_color,
          primary_color,
          button_color,
          button_text_color,
          components,
          top_components,
          bottom_components,
          products (
            id,
            name,
            description,
            price,
            image_url
          )
        `)
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error loading checkout:", error);
        setNotFound(true);
        return;
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      setCheckout({
        id: data.id,
        name: data.name,
        slug: data.slug,
        visits_count: data.visits_count,
        product: {
          id: data.products.id,
          name: data.products.name,
          description: data.products.description,
          price: data.products.price,
          image_url: data.products.image_url,
        },
        // Campos de personalização
        font: data.font,
        background_color: data.background_color,
        text_color: data.text_color,
        primary_color: data.primary_color,
        button_color: data.button_color,
        button_text_color: data.button_text_color,
        components: parseJsonSafely(data.components, []),
        top_components: parseJsonSafely(data.top_components, []),
        bottom_components: parseJsonSafely(data.bottom_components, []),
      });
    } catch (error) {
      console.error("Error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async () => {
    try {
      // Capturar parâmetros UTM
      const utmParams = {
        utm_source: searchParams.get("utm_source"),
        utm_medium: searchParams.get("utm_medium"),
        utm_campaign: searchParams.get("utm_campaign"),
        utm_content: searchParams.get("utm_content"),
        utm_term: searchParams.get("utm_term"),
      };

      // Buscar checkout_id pelo slug
      const { data: checkoutData } = await supabase
        .from("checkouts")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!checkoutData) return;

      // Registrar visita
      const { error } = await supabase
        .from("checkout_visits")
        .insert({
          checkout_id: checkoutData.id,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          ...utmParams,
        });

      if (error) {
        console.error("Error tracking visit:", error);
      }

      // Incrementar contador de visitas
      await supabase.rpc("increment_checkout_visits", {
        checkout_id: checkoutData.id,
      });
    } catch (error) {
      console.error("Error tracking visit:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    toast.success("Processando pagamento...");
    // Aqui será implementada a integração com gateway de pagamento
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground">Checkout não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor: checkout.background_color || '#FFFFFF',
        color: checkout.text_color || '#000000',
        fontFamily: checkout.font || 'Inter',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Componentes do Topo */}
        {checkout.top_components && checkout.top_components.length > 0 && (
          <div className="mb-8">
            {checkout.top_components.map((component: any, index: number) => (
              <CheckoutComponentRenderer key={`top-${index}`} component={component} />
            ))}
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna Esquerda: Informações do Produto */}
          <div className="space-y-6">
            {checkout.product.image_url && (
              <img
                src={checkout.product.image_url}
                alt={checkout.product.name}
                className="w-full rounded-lg shadow-lg"
              />
            )}
            <div>
              <h1 
                className="text-3xl font-bold mb-4"
                style={{ color: checkout.text_color || '#000000' }}
              >
                {checkout.product.name}
              </h1>
              <p 
                className="mb-6"
                style={{ color: checkout.text_color || '#6B7280' }}
              >
                {checkout.product.description}
              </p>
              <div 
                className="text-4xl font-bold"
                style={{ color: checkout.primary_color || '#10B981' }}
              >
                R$ {checkout.product.price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Checkout */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 
              className="text-2xl font-bold mb-6"
              style={{ color: checkout.text_color || '#000000' }}
            >
              Finalizar Compra
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                style={{
                  backgroundColor: checkout.button_color || '#10B981',
                  color: checkout.button_text_color || '#FFFFFF',
                }}
              >
                Finalizar Compra - R$ {checkout.product.price.toFixed(2)}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ao finalizar a compra, você concorda com nossos termos de uso
              </p>
            </form>
          </div>
        </div>

        {/* Componentes do Rodapé */}
        {checkout.bottom_components && checkout.bottom_components.length > 0 && (
          <div className="mt-8">
            {checkout.bottom_components.map((component: any, index: number) => (
              <CheckoutComponentRenderer key={`bottom-${index}`} component={component} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCheckout;

