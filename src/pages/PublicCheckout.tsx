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
import { CheckCircleFilledIcon } from "@/components/icons/CheckCircleFilledIcon";

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
        <div className="w-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {checkout.top_components.map((component: any, index: number) => (
            <CheckoutComponentRenderer key={index} component={component} />
          ))}
        </div>
      )}

      <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-[1120px] mx-auto px-4 lg:px-6 py-4 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Coluna Principal - Formulário (Esquerda no Desktop) */}
            <div className="space-y-4 min-w-0">
              {/* Header do Produto - bloco destacado com padding menor para reduzir espaço */}
              <div className="bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-100 dark:border-gray-700 p-4 mb-3">
                {/* Cabeçalho do Produto */}
                <div className="flex items-center gap-3 mb-3">
                  {checkout.product?.image_url ? (
                    <img 
                      src={checkout.product.image_url} 
                      alt={checkout.product?.name || 'Produto'}
                      // miniatura com arredondamento médio (igual ao topo)
                      className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">{checkout.product?.name}</h1>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                      R$ {(checkout.product?.price / 100)?.toFixed(2).replace('.', ',')} <span className="text-sm font-normal text-gray-600 dark:text-gray-300">à vista</span>
                    </p>
                  </div>
                </div>

                {/* Linha separadora sutil (menor) */}
                <div className="border-t border-gray-100 dark:border-gray-700 -mx-4 mb-3"></div>

                {/* Formulário de Dados */}
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                      placeholder="+55 (00) 00000-0000"
                      required
                    />
                  </div>
                </form>
              </div>

              {/* Métodos de Pagamento */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
                  <Wallet className="w-5 h-5" />
                  Pagamento
                </h2>
                
                <div className="space-y-2.5 mb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('pix')}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left ${
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
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left ${
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2 mb-4">
                      <div className="flex items-start gap-2.5">
                        <CheckCircleFilledIcon size={18} color="#10B981" className="flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-green-800 leading-relaxed font-medium">Liberação imediata</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircleFilledIcon size={18} color="#10B981" className="flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-green-800 leading-relaxed font-medium">É simples, só usar o aplicativo de seu banco para pagar Pix</span>
                      </div>
                    </div>

                    {/* Resumo do Pedido - PIX */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm tracking-tight">Resumo do pedido</h4>
                      
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
                          <h5 className="text-sm font-medium text-gray-900 leading-tight">{checkout.product?.name}</h5>
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
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm tracking-tight">Resumo do pedido</h4>
                      
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
                          <h5 className="text-sm font-medium text-gray-900 leading-tight">{checkout.product?.name}</h5>
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
                  className="w-full mt-5 py-3.5 rounded-lg font-bold text-base transition-all duration-200 hover:opacity-90 shadow-sm"
                  style={{
                    backgroundColor: checkout.button_color || '#10B981',
                    color: checkout.button_text_color || '#FFFFFF'
                  }}
                >
                  {selectedPayment === 'pix' ? 'Pagar com PIX' : 'Pagar com Cartão de Crédito'}
                </button>

                {/* Card de Informações Legais - Unificado sem divisórias */}
                <div className="bg-white rounded-xl shadow-sm p-5 mt-5 text-center">
                  <div className="space-y-3">
                    {/* Logo/Nome + Processador */}
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <span className="font-bold text-gray-900">Rise Checkout</span> está processando este pagamento para o vendedor{' '}
                      <span className="font-semibold text-gray-900">
                        {checkout.seller_name || checkout.product?.support_name || 'Vendedor'}
                      </span>
                    </p>

                    {/* Compra Segura com Check */}
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleFilledIcon size={16} color="#10B981" />
                      <span className="text-xs font-semibold text-gray-900">Compra 100% segura</span>
                    </div>

                    {/* reCAPTCHA */}
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Este site é protegido pelo reCAPTCHA do Google
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Resumo do Pedido (Direita no Desktop) */}
            <aside className="hidden lg:block min-w-0">
              <div className="lg:sticky lg:top-2">
                {/* Card Principal Único com Cabeçalho Verde */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* 1. Cabeçalho "Compra segura" com Fundo Verde */}
                  <div className="bg-green-600 px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <LockIcon className="w-4 h-4" color="#FFFFFF" />
                      <span className="font-semibold text-white text-sm tracking-tight">Compra segura</span>
                    </div>
                  </div>

                  {/* 2. Mini Preview do Produto */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
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
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight tracking-tight">{checkout.product?.name}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">Precisa de ajuda?</p>
                        <button className="text-blue-600 hover:underline text-xs font-medium transition-all">
                          Veja o contato do vendedor
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Divisória Pontilhada */}
                  <div className="border-t border-dashed border-gray-300 mx-4"></div>

                  {/* 3. Total */}
                  <div className="p-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-base font-semibold text-gray-900 tracking-tight">Total</span>
                      <p className="text-xl font-bold text-gray-900">
                        R$ {((checkout.product?.price / 100 || 0) + 0.99).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 text-right leading-relaxed">à vista no {selectedPayment === 'pix' ? 'PIX' : 'Cartão de Crédito'}</p>
                    <p className="text-xs text-gray-600 text-right leading-relaxed mt-0.5">Renovação atual</p>
                  </div>

                  {/* Divisória Pontilhada */}
                  <div className="border-t border-dashed border-gray-300 mx-4"></div>

                  {/* 4. Informações Legais */}
                  <div className="p-4 text-center">
                    <div className="space-y-3">
                      {/* Logo/Nome + Processador */}
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-bold text-gray-900">Rise Checkout</span> está processando este pagamento para o vendedor{' '}
                        <span className="font-semibold text-gray-900">
                          {checkout.seller_name || checkout.product?.support_name || 'Vendedor'}
                        </span>
                      </p>

                      {/* reCAPTCHA */}
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Este site é protegido pelo reCAPTCHA do Google
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

      </div>

      {checkout.bottom_components && Array.isArray(checkout.bottom_components) && checkout.bottom_components.length > 0 && (
        <div className="w-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {checkout.bottom_components.map((component: any, index: number) => (
            <CheckoutComponentRenderer key={index} component={component} />
          ))}
        </div>
      )}
    </>
  );
};

export default PublicCheckout;

