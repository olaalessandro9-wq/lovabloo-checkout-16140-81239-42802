import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Wallet } from "lucide-react";
import { toast } from "sonner";
import { parseJsonSafely } from "@/lib/utils";
import CheckoutComponentRenderer from "@/components/checkout/CheckoutComponentRenderer";
import { ImageIcon } from "@/components/icons/ImageIcon";
import { LockIcon } from "@/components/icons/LockIcon";
import { PixIcon } from "@/components/icons/PixIcon";
import { CreditCardIcon } from "@/components/icons/CreditCardIcon";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";

interface CheckoutData {
  id: string;
  name: string;
  slug: string;
  visits_count: number;
  seller_name?: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    support_name?: string;
  };
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
  const [selectedPayment, setSelectedPayment] = useState<'pix' | 'credit_card'>('pix');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
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
          seller_name,
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
            image_url,
            support_name
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
        seller_name: data.seller_name,
        product: {
          id: data.products.id,
          name: data.products.name,
          description: data.products.description,
          price: data.products.price,
          image_url: data.products.image_url,
          support_name: data.products.support_name,
        },
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
      const utmParams = {
        utm_source: searchParams.get("utm_source"),
        utm_medium: searchParams.get("utm_medium"),
        utm_campaign: searchParams.get("utm_campaign"),
        utm_content: searchParams.get("utm_content"),
        utm_term: searchParams.get("utm_term"),
      };

      const { data: checkoutData } = await supabase
        .from("checkouts")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!checkoutData) return;

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

      await supabase.rpc("increment_checkout_visits", {
        checkout_id: checkoutData.id,
      });
    } catch (error) {
      console.error("Error tracking visit:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    toast.success("Processando pagamento...");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Checkout não encontrado</h1>
          <p className="text-gray-600">O link que você acessou não existe ou foi desativado.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {checkout.top_components && Array.isArray(checkout.top_components) && checkout.top_components.length > 0 && (
        <div className="w-full" style={{ fontFamily: checkout.font || 'Inter' }}>
          {checkout.top_components.map((component: any, index: number) => (
            <CheckoutComponentRenderer key={index} component={component} />
          ))}
        </div>
      )}

      <div className="min-h-screen bg-gray-50" style={{ fontFamily: checkout.font || 'Inter' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {/* Header do Produto - Desktop Only */}
          <div className="hidden lg:flex items-center gap-3 mb-6 bg-white rounded-lg p-4 shadow-sm">
            {checkout.product?.image_url ? (
              <img 
                src={checkout.product.image_url} 
                alt={checkout.product?.name || 'Produto'}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{checkout.product?.name}</h1>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')} à vista
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna Principal - Formulário (Esquerda no Desktop) */}
            <div className="lg:col-span-8">
              {/* Cabeçalho Mobile */}
              <div className="lg:hidden mb-4 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {checkout.product?.image_url ? (
                    <img 
                      src={checkout.product.image_url} 
                      alt={checkout.product?.name || 'Produto'}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-gray-900">{checkout.product?.name}</h2>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')}
                      <span className="text-sm font-normal text-gray-600"> à vista</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário de Dados */}
              <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Seus dados
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      CPF/CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.document}
                      onChange={(e) => setFormData({...formData, document: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Celular
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="+55 (00) 00000-0000"
                      required
                    />
                  </div>
                </form>
              </div>

              {/* Métodos de Pagamento */}
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Pagamento
                </h2>
                
                <div className="space-y-2.5 mb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('pix')}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      selectedPayment === 'pix' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PixIcon className="w-5 h-5" color="#00A868" />
                      <span className="font-semibold text-gray-900 text-sm">PIX</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment('credit_card')}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      selectedPayment === 'credit_card' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="w-5 h-5" color="#3B82F6" />
                      <span className="font-semibold text-gray-900 text-sm">Cartão de Crédito</span>
                    </div>
                  </button>
                </div>

                {selectedPayment === 'pix' && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1.5 mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-xs text-green-800">Liberação imediata</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-xs text-green-800">É simples, só usar o aplicativo de seu banco para pagar Pix</span>
                      </div>
                    </div>

                    {/* Resumo do Pedido - PIX */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">Resumo do pedido</h4>
                      
                      <div className="flex items-start gap-3 mb-3">
                        {checkout.product?.image_url ? (
                          <img 
                            src={checkout.product.image_url} 
                            alt={checkout.product?.name || 'Produto'}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{checkout.product?.name}</h5>
                          <p className="text-base font-bold text-gray-900 mt-0.5">
                            R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-sm border-t border-gray-300 pt-2.5">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Produto</span>
                          <span className="text-gray-900 font-medium">
                            R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxa de serviço</span>
                          <span className="text-gray-900 font-medium">R$ 0,99</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-300">
                          <span className="text-gray-900">Total</span>
                          <span className="text-gray-900">
                            R$ {((checkout.product?.price / 100 || 0) + 0.99).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedPayment === 'credit_card' && (
                  <>
                    {/* Resumo do Pedido - Cartão de Crédito */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">Resumo do pedido</h4>
                      
                      <div className="flex items-start gap-3 mb-3">
                        {checkout.product?.image_url ? (
                          <img 
                            src={checkout.product.image_url} 
                            alt={checkout.product?.name || 'Produto'}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{checkout.product?.name}</h5>
                          <p className="text-base font-bold text-gray-900 mt-0.5">
                            R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-sm border-t border-gray-300 pt-2.5">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Produto</span>
                          <span className="text-gray-900 font-medium">
                            R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxa de serviço</span>
                          <span className="text-gray-900 font-medium">R$ 0,99</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-300">
                          <span className="text-gray-900">Total</span>
                          <span className="text-gray-900">
                            R$ {((checkout.product?.price / 100 || 0) + 0.99).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mt-2">à vista no Cartão de Crédito</p>
                    </div>
                  </>
                )}

                <button
                  onClick={handleSubmit}
                  className="w-full mt-5 py-3.5 rounded-lg font-bold text-base transition-all"
                  style={{
                    backgroundColor: checkout.button_color || '#10B981',
                    color: checkout.button_text_color || '#FFFFFF'
                  }}
                >
                  {selectedPayment === 'pix' ? 'Pagar com PIX' : 'Continuar para Pagamento'}
                </button>

                {/* Card de Informações Legais - Abaixo do Botão */}
                <div className="bg-white rounded-lg shadow-sm p-4 mt-5 space-y-2.5 text-center border border-gray-200">
                  {/* Logo/Nome + Processador */}
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-gray-900">Rise Checkout</span> está processando este pagamento para o vendedor{' '}
                      <span className="font-semibold text-gray-900">
                        {checkout.seller_name || checkout.product?.support_name || 'Vendedor'}
                      </span>
                    </p>
                  </div>

                  {/* Compra Segura com Check */}
                  <div className="flex items-center justify-center gap-2 pb-2 border-b border-gray-200">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-900">Compra 100% segura</span>
                  </div>

                  {/* reCAPTCHA */}
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-600">
                      Este site é protegido pelo reCAPTCHA do Google
                    </p>
                  </div>

                  {/* Links Legais */}
                  <div className="pb-2">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <a href="#" className="text-blue-600 hover:underline">
                        Política de privacidade
                      </a>
                      <span className="text-gray-400">e</span>
                      <a href="#" className="text-blue-600 hover:underline">
                        Termos de serviço
                      </a>
                    </div>
                  </div>

                  {/* Termos de Compra */}
                  <div className="pt-1.5 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Ao continuar, você concorda com os{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Termos de Compra
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Resumo do Pedido (Direita no Desktop) */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-2 space-y-3">
                {/* Card Compra Segura */}
                <div className="bg-green-600 rounded-lg px-5 py-2.5 flex items-center justify-center gap-2.5">
                  <LockIcon className="w-5 h-5" color="#FFFFFF" />
                  <span className="font-bold text-white text-sm">Compra 100% segura</span>
                </div>

                {/* Mini Preview do Produto */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-2.5">
                    {checkout.product?.image_url ? (
                      <img 
                        src={checkout.product.image_url} 
                        alt={checkout.product?.name || 'Produto'}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{checkout.product?.name}</h4>
                      <p className="text-base font-bold text-gray-900 mt-0.5">
                        R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')}
                        <span className="text-xs font-normal text-gray-600"> à vista</span>
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:underline text-xs font-medium w-full text-left">
                    Precisa de ajuda? Veja o contato do vendedor
                  </button>
                </div>

                {/* Total Destacado */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        R$ {((checkout.product?.price / 100 || 0) + 0.99).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">à vista no {selectedPayment === 'pix' ? 'PIX' : 'Cartão de Crédito'}</p>
                    </div>
                  </div>
                </div>

                {/* Card de Informações Legais e Processamento */}
                <div className="bg-white rounded-lg shadow-sm p-3.5 space-y-2.5 text-center">
                  {/* Logo/Nome + Processador */}
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-gray-900">Rise Checkout</span> está processando este pagamento para o vendedor{' '}
                      <span className="font-semibold text-gray-900">
                        {checkout.seller_name || checkout.product?.support_name || 'Vendedor'}
                      </span>
                    </p>
                  </div>

                  {/* reCAPTCHA */}
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-600">
                      Este site é protegido pelo reCAPTCHA do Google
                    </p>
                  </div>

                  {/* Links Legais */}
                  <div>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <a href="#" className="text-blue-600 hover:underline">
                        Política de privacidade
                      </a>
                      <span className="text-gray-400">e</span>
                      <a href="#" className="text-blue-600 hover:underline">
                        Termos de serviço
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {checkout.bottom_components && Array.isArray(checkout.bottom_components) && checkout.bottom_components.length > 0 && (
        <div className="w-full" style={{ fontFamily: checkout.font || 'Inter' }}>
          {checkout.bottom_components.map((component: any, index: number) => (
            <CheckoutComponentRenderer key={index} component={component} />
          ))}
        </div>
      )}
    </>
  );
};

export default PublicCheckout;

