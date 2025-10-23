import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * PaymentLinkRedirect
 * 
 * Esta página processa links de pagamento no formato /c/:slug
 * e redireciona para o checkout apropriado.
 * 
 * Fluxo:
 * 1. Recebe slug do link de pagamento
 * 2. Busca o link no banco de dados
 * 3. Verifica se o link está ativo
 * 4. Verifica se o produto está ativo
 * 5. Busca o checkout padrão associado ao link
 * 6. Redireciona para /pay/:checkout_slug
 */
const PaymentLinkRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    const processPaymentLink = async () => {
      if (!slug) {
        setError("Link inválido");
        return;
      }

      try {
        // 1. Buscar o payment_link pelo slug com status e produto
        const { data: linkData, error: linkError } = await supabase
          .from("payment_links")
          .select(`
            id,
            slug,
            status,
            offers (
              id,
              product_id,
              products (
                id,
                status,
                support_email
              )
            )
          `)
          .eq("slug", slug)
          .single();

        if (linkError || !linkData) {
          console.error("Link não encontrado:", linkError);
          setError("Link de pagamento não encontrado");
          return;
        }

        console.log("[PaymentLinkRedirect] Link encontrado:", linkData);

        // 2. Verificar se o link está ativo
        if (linkData.status === "inactive") {
          console.log("[PaymentLinkRedirect] Link desativado");
          setIsInactive(true);
          setError("Produto não disponível, inativo ou bloqueado. Contate o suporte para mais informações.");
          return;
        }

        // 3. Verificar se o produto está ativo
        const product = (linkData as any).offers?.products;
        if (product && product.status === "blocked") {
          console.log("[PaymentLinkRedirect] Produto bloqueado");
          setIsInactive(true);
          setError("Produto não disponível, inativo ou bloqueado. Contate o suporte para mais informações.");
          return;
        }

        // 4. Buscar checkouts associados a este link
        const { data: checkoutLinksData, error: checkoutLinksError } = await supabase
          .from("checkout_links")
          .select(`
            checkout_id,
            checkouts (
              id,
              slug,
              is_default,
              product_id
            )
          `)
          .eq("link_id", linkData.id);

        console.log("[PaymentLinkRedirect] Checkout links:", checkoutLinksData);

        if (checkoutLinksError || !checkoutLinksData || checkoutLinksData.length === 0) {
          console.error("Nenhum checkout associado:", checkoutLinksError);
          setError("Este link não está associado a nenhum checkout. Entre em contato com o suporte.");
          return;
        }

        // 5. Extrair checkouts dos dados
        const checkouts = checkoutLinksData
          .map((cl: any) => cl.checkouts)
          .filter((c: any) => c !== null);

        console.log("[PaymentLinkRedirect] Checkouts extraídos:", checkouts);

        if (checkouts.length === 0) {
          console.error("Nenhum checkout encontrado");
          setError("Nenhum checkout válido encontrado");
          return;
        }

        const checkoutsData = checkouts;

        // Buscar offer para pegar product_id
        const { data: offerData } = await supabase
          .from("offers")
          .select("product_id")
          .eq("id", (linkData as any).offers?.id)
          .maybeSingle();

        // Priorizar checkout padrão do produto
        const productId = offerData?.product_id;
        let targetCheckout = checkoutsData.find(
          (c: any) => c.is_default && c.product_id === productId
        );

        // Se não encontrar checkout padrão do produto, usar qualquer checkout padrão
        if (!targetCheckout) {
          targetCheckout = checkoutsData.find((c: any) => c.is_default);
        }

        // Se não encontrar nenhum padrão, usar o primeiro disponível
        if (!targetCheckout) {
          targetCheckout = checkoutsData[0];
        }

        // 6. Redirecionar para o checkout
        if (targetCheckout && targetCheckout.slug) {
          navigate(`/pay/${targetCheckout.slug}`, { replace: true });
        } else {
          setError("Checkout inválido");
        }
      } catch (err) {
        console.error("Erro ao processar link:", err);
        setError("Erro ao processar link de pagamento");
      }
    };

    processPaymentLink();
  }, [slug, navigate]);

  if (error) {
    // Página de erro para link inativo/bloqueado (estilo Cakto)
    if (isInactive) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto p-6">
            {/* Logo da plataforma */}
            <div className="mb-8">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
            </div>
            
            {/* Mensagem de erro */}
            <p className="text-base text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      );
    }

    // Página de erro genérica
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Oops! Algo deu errado
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">
          Processando seu link de pagamento...
        </p>
      </div>
    </div>
  );
};

export default PaymentLinkRedirect;

