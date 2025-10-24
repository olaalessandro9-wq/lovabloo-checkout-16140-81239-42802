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
      className="min-h-screen"
      style={{
        backgroundColor: checkout.background_color || '#F5F5F5',
        fontFamily: checkout.font || 'Inter',
      }}
    >
      {/* Componentes do Topo */}
      {checkout.top_components && checkout.top_components.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {checkout.top_components.map((component: any, index: number) => (
            <CheckoutComponentRenderer key={`top-${index}`} component={component} />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Coluna Esquerda: Formulário */}
          <div className="space-y-6">
            {/* Informações do Produto (Mobile) */}
            <div className="lg:hidden bg-white rounded-lg p-6 shadow-sm">
              <div className="flex gap-4 items-start mb-4">
                {checkout.product.image_url && (
                  <img
                    src={checkout.product.image_url}
                    alt={checkout.product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{checkout.product.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">R$ {checkout.product.price.toFixed(2)} à vista</p>
                </div>
              </div>
            </div>

            {/* Seus Dados */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Seus dados</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    className="mt-1 bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="mt-1 bg-gray-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">CPF/CNPJ</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Celular</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+55 (00) 00000-0000"
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Pagamento</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  className="p-4 border-2 rounded-lg text-center hover:border-green-500 transition-colors bg-green-600 text-white border-green-600"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                    <span className="font-semibold">PIX</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-gray-400 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="font-semibold text-gray-700">Cartão de Crédito</span>
                  </div>
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Liberação imediata</span>
                </div>
                <div className="flex items-start gap-2 text-green-700">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">É simples, só usar o aplicativo de seu banco para pagar Pix</span>
                </div>
              </div>
            </div>

            {/* Resumo do Pedido (Mobile) */}
            <div className="lg:hidden bg-white rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900">Resumo do pedido</h3>
              <div className="flex items-center gap-3 pb-4 border-b">
                {checkout.product.image_url && (
                  <img
                    src={checkout.product.image_url}
                    alt={checkout.product.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{checkout.product.name}</p>
                  <p className="text-sm text-gray-600">R$ {checkout.product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">R$ {checkout.product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">R$ {checkout.product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              onClick={handleSubmit}
              className="w-full h-12 text-base font-semibold"
              style={{
                backgroundColor: checkout.button_color || '#10B981',
                color: checkout.button_text_color || '#FFFFFF',
              }}
            >
              Pagar com PIX
            </Button>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Compra 100% segura</span>
              </div>
              <p className="text-xs text-gray-500">
                Este site é protegido pelo reCAPTCHA do Google
              </p>
              <p className="text-xs text-gray-500">
                Ao continuar, você concorda com os Termos de Compra
              </p>
            </div>
          </div>

          {/* Coluna Direita: Resumo (Desktop) */}
          <div className="hidden lg:block space-y-6">
            {/* Compra Segura */}
            <div className="bg-green-600 text-white rounded-lg p-6 text-center">
              <h2 className="text-lg font-bold">Compra segura</h2>
            </div>

            {/* Resumo do Produto */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex gap-4 items-start mb-6">
                {checkout.product.image_url && (
                  <img
                    src={checkout.product.image_url}
                    alt={checkout.product.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{checkout.product.name}</h3>
                  {checkout.product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{checkout.product.description}</p>
                  )}
                  <a href="#" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                    Veja o contato do vendedor
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">R$ {checkout.product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">à vista</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center space-y-2 text-xs text-gray-500">
              <p>RiseCheckout está processando este pagamento</p>
              <div className="flex items-center justify-center gap-1">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-600 font-medium">Compra 100% segura</span>
              </div>
              <p>Este site é protegido pelo reCAPTCHA do Google</p>
              <p>Ao continuar, você concorda com os Termos de Compra</p>
            </div>
          </div>
        </div>
      </div>

      {/* Componentes do Rodapé */}
      {checkout.bottom_components && checkout.bottom_components.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {checkout.bottom_components.map((component: any, index: number) => (
            <CheckoutComponentRenderer key={`bottom-${index}`} component={component} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicCheckout;

