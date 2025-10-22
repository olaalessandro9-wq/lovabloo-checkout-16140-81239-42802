import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, CreditCard, Link2, Sparkles, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ImageSelector } from "@/components/products/ImageSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useProduct } from "@/hooks/useProduct";
import { OrderBumpList } from "@/components/products/OrderBumpList";
import { OrderBumpDialog, type OrderBump } from "@/components/products/OrderBumpDialog";
import { CheckoutTable, type Checkout } from "@/components/products/CheckoutTable";
import { CheckoutConfigDialog } from "@/components/products/CheckoutConfigDialog";
import { CouponsTable, type Coupon } from "@/components/products/CouponsTable";
import { CouponDialog } from "@/components/products/CouponDialog";
import { LinksTable, type CheckoutLink } from "@/components/products/LinksTable";
import { supabase } from "@/integrations/supabase/client";

const ProductEdit = () => {
  const navigate = useNavigate();
  const { product, loading, imageFile, setImageFile, saveProduct, deleteProduct, productId } = useProduct();
  
  // Estado para a seção Geral
  const [generalData, setGeneralData] = useState({
    name: "",
    description: "",
    price: "",
    support_name: "",
    support_email: "",
  });

  const [generalModified, setGeneralModified] = useState(false);
  const [imageModified, setImageModified] = useState(false);
  const [pendingImageRemoval, setPendingImageRemoval] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  
  // Estados de erro para validação inline
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    support_name: "",
    support_email: "",
  });

  // Carregar dados do produto quando disponível
  useEffect(() => {
    if (product) {
      setGeneralData({
        name: product.name,
        description: product.description,
        price: product.price,
        support_name: product.support_name,
        support_email: product.support_email,
      });
      setGeneralModified(false);
      setImageModified(false);
      setPendingImageRemoval(false);
    }
  }, [product]);

  const [paymentSettings, setPaymentSettings] = useState({
    pixEnabled: true,
    creditCardEnabled: true,
    defaultPaymentMethod: "credit_card",
  });

  const [paymentSettingsModified, setPaymentSettingsModified] = useState(false);

  const [checkoutFields, setCheckoutFields] = useState({
    fullName: true,
    phone: true,
    email: true,
    cpf: false,
  });

  const [checkoutFieldsModified, setCheckoutFieldsModified] = useState(false);

  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [orderBumpDialogOpen, setOrderBumpDialogOpen] = useState(false);
  const [editingOrderBump, setEditingOrderBump] = useState<OrderBump | null>(null);

  const [upsellSettings, setUpsellSettings] = useState({
    hasCustomThankYouPage: false,
    customPageUrl: "",
    redirectIgnoringOrderBumpFailures: false,
  });

  const [upsellModified, setUpsellModified] = useState(false);

  const [paymentLinks, setPaymentLinks] = useState<CheckoutLink[]>([]);

  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutConfigDialogOpen, setCheckoutConfigDialogOpen] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState<Checkout | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Load data from database
  useEffect(() => {
    if (productId) {
      loadPaymentLinks();
      loadCheckouts();
      loadCoupons();
      loadOrderBumps();
    }
  }, [productId]);

  const loadPaymentLinks = async () => {
    if (!productId) return;
    try {
      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPaymentLinks((data || []).map(link => ({
        id: link.id,
        name: link.name,
        price: Number(link.price),
        url: link.url || "",
        offer: link.name,
        type: "Checkout" as const,
        status: link.active ? "active" as const : "inactive" as const,
        hiddenFromAffiliates: false,
        isDefault: false,
      })));
    } catch (error) {
      console.error("Error loading payment links:", error);
    }
  };

  const loadCheckouts = async () => {
    if (!productId) return;
    try {
      const { data, error } = await supabase
        .from("checkouts")
        .select(`
          *,
          payment_links (
            id,
            name,
            price
          )
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setCheckouts((data || []).map(checkout => ({
        id: checkout.id,
        name: checkout.name,
        price: checkout.payment_links?.price || 0,
        visits: 0,
        offer: checkout.payment_links?.name || "",
        isDefault: false,
        linkId: checkout.link_id || "",
      })));
    } catch (error) {
      console.error("Error loading checkouts:", error);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select(`
          *,
          coupon_products (
            product_id
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setCoupons((data || []).map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        discount: Number(coupon.discount_value),
        startDate: coupon.created_at ? new Date(coupon.created_at) : new Date(),
        endDate: coupon.expires_at ? new Date(coupon.expires_at) : new Date(),
        usageCount: coupon.uses_count || 0,
        applyToOrderBumps: false,
      })));
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  };

  const loadOrderBumps = async () => {
    if (!productId) return;
    try {
      const { data, error } = await supabase
        .from("order_bumps")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      // Order bumps will be filtered by checkout_id when needed
    } catch (error) {
      console.error("Error loading order bumps:", error);
    }
  };

  const [affiliateSettings, setAffiliateSettings] = useState({
    enabled: false,
    requireApproval: false,
    allowContactData: false,
    receiveUpsellCommission: false,
    showInMarketplace: false,
    supportEmail: "",
    description: "",
    commission: "50.00",
    attribution: "last_click",
    cookieDuration: "30",
  });

  const [affiliateModified, setAffiliateModified] = useState(false);

  const [checkoutLinks, setCheckoutLinks] = useState<CheckoutLink[]>([
    {
      id: "link-1",
      name: "Oferta Principal",
      url: "https://pay.cakto.com.br/",
      offer: "teste",
      type: "Checkout",
      price: 5.00,
      status: "active",
      hiddenFromAffiliates: false,
      isDefault: true,
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageModified(true);
      setPendingImageRemoval(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImageModified(true);
    setPendingImageRemoval(true);
  };

  // Salvar apenas a seção Geral
  const handleSaveGeneral = async () => {
    // Limpar erros anteriores
    const newErrors = {
      name: "",
      description: "",
      price: "",
      support_name: "",
      support_email: "",
    };
    
    let hasError = false;
    
    // Validações de campos obrigatórios
    if (!generalData.name || generalData.name.trim() === "") {
      newErrors.name = "Nome do produto é obrigatório";
      hasError = true;
    }
    
    if (!generalData.price || parseFloat(generalData.price) <= 0) {
      newErrors.price = "O preço deve ser maior que R$ 0,00";
      hasError = true;
    }

    if (!generalData.description || generalData.description.trim().length < 50) {
      newErrors.description = "A descrição precisa ter no mínimo 50 caracteres";
      hasError = true;
    }

    if (!generalData.support_name || generalData.support_name.trim() === "") {
      newErrors.support_name = "Nome de exibição é obrigatório";
      hasError = true;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!generalData.support_email || !emailRegex.test(generalData.support_email.trim())) {
      newErrors.support_email = "Digite um e-mail válido (exemplo: suporte@email.com)";
      hasError = true;
    }
    
    setErrors(newErrors);
    
    if (hasError) {
      return;
    }

    try {
      let finalImageUrl = product?.image_url;

      // Se há imagem para remover
      if (pendingImageRemoval) {
        finalImageUrl = null;
      }
      // Se há URL de imagem fornecida (prioridade)
      else if (imageUrl && imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }
      // Se há nova imagem para fazer upload
      else if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${productId || Date.now()}.${fileExt}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, imageFile, { upsert: true });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          finalImageUrl = data.publicUrl;
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          toast.error("Não foi possível fazer upload da imagem. Tente novamente.");
          return;
        }
      }

      await saveProduct({
        name: generalData.name,
        description: generalData.description,
        price: generalData.price,
        support_name: generalData.support_name,
        support_email: generalData.support_email,
        status: "active",
        image_url: finalImageUrl,
      });

      setGeneralModified(false);
      setImageModified(false);
      setPendingImageRemoval(false);
      setImageFile(null);
      setImageUrl("");
      
      // Recarregar produto para atualizar a interface
      if (productId) {
        await loadProduct();
      }
      
      // Mensagem de sucesso já é mostrada pelo hook useProduct
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Não foi possível salvar as alterações");
    }
  };

  // Salvar apenas a seção de Configurações (Pagamento)
  const handleSavePaymentSettings = async () => {
    if (!productId) {
      toast.error("Produto não encontrado");
      return;
    }

    try {
      // Removed obsolete payment_settings and checkout_fields
      setPaymentSettingsModified(false);
      setCheckoutFieldsModified(false);

      toast.error("Configurações de pagamento salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    toast.error("Não foi possível salvar as alterações");
    }
  };

  // Salvar apenas a seção de Upsell
  const handleSaveUpsell = async () => {
    if (!productId) {
      toast.error("Produto não encontrado");
      return;
    }

    try {
      // Removed obsolete upsell_settings
      setUpsellModified(false);

      toast.error("Configurações de upsell salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar upsell:", error);
      toast.error("Não foi possível salvar as configurações");
    }
  };

  // Salvar apenas a seção de Afiliados
  const handleSaveAffiliate = async () => {
    if (!productId) {
      toast.error("Produto não encontrado");
      return;
    }

    try {
      // Removed obsolete affiliate_settings
      setAffiliateModified(false);

      toast.error("Configurações de afiliados salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar afiliados:", error);
      toast.error("Não foi possível salvar as configurações");
    }
  };

  // Salvar TUDO (Salvar Produto)
  const handleSaveAll = async () => {
    if (!generalData.support_name || !generalData.support_email) {
      toast.error("Preencha o nome de exibição e email de suporte");
      return;
    }

    try {
      let finalImageUrl = product?.image_url;

      // Se há imagem para remover
      if (pendingImageRemoval) {
        finalImageUrl = null;
      }
      // Se há nova imagem para fazer upload
      else if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${productId || Date.now()}.${fileExt}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, imageFile, { upsert: true });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          finalImageUrl = data.publicUrl;
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          toast.error("Não foi possível fazer upload da imagem. Tente novamente.");
          return;
        }
      }

      // Salvar dados gerais
      await saveProduct({
        name: generalData.name,
        description: generalData.description,
        price: generalData.price,
        support_name: generalData.support_name,
        support_email: generalData.support_email,
        status: "active",
        image_url: finalImageUrl,
      });

      // Configurações de pagamento agora são gerenciadas via payment_links, checkouts, etc.

      // Resetar flags de modificação
      setGeneralModified(false);
      setImageModified(false);
      setPendingImageRemoval(false);
      setPaymentSettingsModified(false);
      setCheckoutFieldsModified(false);
      setUpsellModified(false);
      setAffiliateModified(false);
      setImageFile(null);

      toast.error("Produto salvo completamente com sucesso");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Não foi possível salvar o produto");
    }
  };

  const handleDelete = async () => {
    const success = await deleteProduct();
    if (success) {
      navigate("/produtos");
    }
  };

  const handleBack = () => {
    navigate("/produtos");
  };

  const handleAddOrderBump = () => {
    setEditingOrderBump(null);
    setOrderBumpDialogOpen(true);
  };

  const handleSaveOrderBump = (orderBump: OrderBump) => {
    if (editingOrderBump) {
      setOrderBumps(orderBumps.map(ob => ob.id === orderBump.id ? orderBump : ob));
      toast.error("O order bump foi atualizado com sucesso");
    } else {
      setOrderBumps([...orderBumps, orderBump]);
      toast.error("O order bump foi adicionado com sucesso");
    }
  };

  const handleRemoveOrderBump = (id: string) => {
    setOrderBumps(orderBumps.filter(ob => ob.id !== id));
    toast.error("O order bump foi removido");
  };

  const handleAddCheckout = () => {
    setEditingCheckout(null);
    setCheckoutConfigDialogOpen(true);
  };

  const handleDuplicateCheckout = (checkout: Checkout) => {
    const duplicated: Checkout = {
      ...checkout,
      id: `checkout-${Date.now()}`,
      name: `${checkout.name} (Cópia)`,
      isDefault: false,
      visits: 0,
    };
    setCheckouts([...checkouts, duplicated]);
    toast.error("Uma cópia do checkout foi criada");
  };

  const handleDeleteCheckout = async (id: string) => {
    try {
      const { error } = await supabase
        .from("checkouts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCheckouts(checkouts.filter(c => c.id !== id));
      toast.error("O checkout foi removido");
    } catch (error) {
      console.error("Error deleting checkout:", error);
      toast.error("Não foi possível excluir o checkout");
    }
  };

  const handleConfigureCheckout = (checkout: Checkout) => {
    setEditingCheckout(checkout);
    setCheckoutConfigDialogOpen(true);
  };

  const handleCustomizeCheckout = (checkout: Checkout) => {
    navigate(`/produtos/checkout/personalizar?id=${checkout.id}`);
  };

  const handleSaveCheckout = async (checkout: Checkout) => {
    if (!productId) return;

    try {
      if (editingCheckout) {
        const { error } = await supabase
          .from("checkouts")
          .update({
            name: checkout.name,
            link_id: checkout.linkId,
          })
          .eq("id", checkout.id);

        if (error) throw error;
        
        setCheckouts(checkouts.map(c => c.id === checkout.id ? checkout : c));
        toast.error("O checkout foi atualizado com sucesso");
      } else {
        const { error } = await supabase
          .from("checkouts")
          .insert({
            name: checkout.name,
            product_id: productId,
            link_id: checkout.linkId,
          });

        if (error) throw error;
        
        toast.error("O checkout foi adicionado com sucesso");
      }
      loadCheckouts();
    } catch (error) {
      console.error("Error saving checkout:", error);
      toast.error("Não foi possível salvar o checkout");
    }
  };

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setCouponDialogOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponDialogOpen(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCoupons(coupons.filter(c => c.id !== id));
      toast.error("O cupom foi removido");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Não foi possível excluir o cupom");
    }
  };

  const handleSaveCoupon = async (coupon: Coupon) => {
    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update({
            code: coupon.code,
            discount_value: coupon.discount,
            discount_type: "percentage",
            expires_at: coupon.endDate.toISOString(),
          })
          .eq("id", coupon.id);

        if (error) throw error;
        
        toast.error("O cupom foi atualizado com sucesso");
      } else {
        const { error } = await supabase
          .from("coupons")
          .insert({
            code: coupon.code,
            discount_value: coupon.discount,
            discount_type: "percentage",
            expires_at: coupon.endDate.toISOString(),
          });

        if (error) throw error;
        
        toast.error("O cupom foi adicionado com sucesso");
      }
      loadCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Não foi possível salvar o cupom");
    }
  };

  const handleAddLink = () => {
    const newLink: CheckoutLink = {
      id: `link-${Date.now()}`,
      name: `Novo Link ${checkoutLinks.length + 1}`,
      url: `https://pay.cakto.com.br/${Date.now()}`,
      offer: "teste",
      type: "Checkout",
      price: 5.00,
      status: "active",
      hiddenFromAffiliates: false,
      isDefault: false,
    };
    setCheckoutLinks([...checkoutLinks, newLink]);
    toast.error("Um novo link foi criado com sucesso");
  };

  const handleToggleAffiliateVisibility = (id: string) => {
    setCheckoutLinks(checkoutLinks.map(link => 
      link.id === id 
        ? { ...link, hiddenFromAffiliates: !link.hiddenFromAffiliates }
        : link
    ));
    const link = checkoutLinks.find(l => l.id === id);
    toast.success(link?.hiddenFromAffiliates 
      ? "O link agora está visível para os afiliados"
      : "O link foi escondido dos afiliados");
  };

  const handleToggleLinkStatus = (id: string) => {
    setCheckoutLinks(checkoutLinks.map(link => 
      link.id === id 
        ? { ...link, status: link.status === "active" ? "inactive" : "active" }
        : link
    ));
    const link = checkoutLinks.find(l => l.id === id);
    toast.success(link?.status === "active" 
      ? "O link foi desativado com sucesso"
      : "O link foi ativado com sucesso");
  };

  const handleDeleteLink = (id: string) => {
    const link = checkoutLinks.find(l => l.id === id);
    
    if (link?.isDefault) {
      toast.error("Não é possível excluir o link padrão do produto");
      return;
    }

    setCheckoutLinks(checkoutLinks.filter(l => l.id !== id));
    toast.error("O link foi excluído com sucesso");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button 
            onClick={handleSaveAll}
            disabled={loading || (!generalModified && !imageModified && !paymentSettingsModified && !checkoutFieldsModified && !upsellModified && !affiliateModified)}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Salvando..." : "Salvar Produto"}
          </Button>
        </div>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="order-bump">Order Bump</TabsTrigger>
            <TabsTrigger value="upsell">Upsell / Downsell</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
            <TabsTrigger value="cupons">Cupons</TabsTrigger>
            <TabsTrigger value="afiliados">Afiliados</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Produto</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  A aprovação do produto é instantânea. Ou seja, você pode cadastrá-lo e já começar a vender. A imagem do produto é exibida na área de membros e no seu programa de afiliados.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name" className="text-foreground">Nome do Produto</Label>
                    <Input
                      id="product-name"
                      value={generalData.name}
                      onChange={(e) => {
                        setGeneralData({ ...generalData, name: e.target.value });
                        setGeneralModified(true);
                        if (errors.name) {
                          setErrors({ ...errors, name: "" });
                        }
                      }}
                      className={`bg-background text-foreground ${
                        errors.name ? "border-red-500 focus:border-red-500" : "border-border"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-description" className="text-foreground">Descrição</Label>
                    <Textarea
                      id="product-description"
                      value={generalData.description}
                      onChange={(e) => {
                        setGeneralData({ ...generalData, description: e.target.value });
                        setGeneralModified(true);
                        if (errors.description) {
                          setErrors({ ...errors, description: "" });
                        }
                      }}
                      className={`bg-background text-foreground min-h-[100px] ${
                        errors.description ? "border-red-500 focus:border-red-500" : "border-border"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Imagem do Produto</h3>
                <ImageSelector
                  imageUrl={product?.image_url}
                  imageFile={imageFile}
                  onImageFileChange={(file) => {
                    setImageFile(file);
                    setImageModified(true);
                    setPendingImageRemoval(false);
                  }}
                  onImageUrlChange={(url) => {
                    setImageUrl(url);
                    setImageModified(true);
                    setPendingImageRemoval(false);
                  }}
                  onRemoveImage={handleRemoveImage}
                  pendingRemoval={pendingImageRemoval}
                />
                <div className="space-y-4 hidden">
                  {product?.image_url && !imageFile && !pendingImageRemoval && (
                    <div className="mb-4">
                      <img 
                        src={product.image_url} 
                        alt="Imagem do produto" 
                        className="max-w-xs rounded-lg border border-border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="mt-2 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remover Imagem
                      </Button>
                    </div>
                  )}
                  {imageFile && (
                    <div className="mb-4">
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview" 
                        className="max-w-xs rounded-lg border border-border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImageModified(true);
                          setPendingImageRemoval(false);
                        }}
                        className="mt-2 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remover Imagem
                      </Button>
                    </div>
                  )}
                  {pendingImageRemoval && (
                    <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                      <p className="text-sm text-destructive font-medium">
                        Imagem marcada para remoção. Clique em "Salvar Alterações" para confirmar.
                      </p>
                    </div>
                  )}
                  {!product?.image_url && !imageFile && !pendingImageRemoval && (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="product-image"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="product-image" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Formatos aceitos: JPG ou PNG. Tamanho máximo: 10MB
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tamanho recomendado: 300x250 pixels
                        </p>
                      </label>
                    </div>
                  )}
                </div>
                {/* Fim do código antigo de imagem - mantido oculto para compatibilidade */}
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Preço</h3>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Preço</Label>
                  <CurrencyInput
                    id="price"
                    value={generalData.price}
                    onChange={(newValue) => {
                      setGeneralData({ ...generalData, price: newValue });
                      setGeneralModified(true);
                      if (errors.price) {
                        setErrors({ ...errors, price: "" });
                      }
                    }}
                    className={`bg-background text-foreground ${
                      errors.price ? "border-red-500 focus:border-red-500" : "border-border"
                    }`}
                    error={errors.price}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Suporte ao Cliente</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Aprenda como preencher os dados de suporte ao cliente.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="support-name" className="text-foreground">
                      Nome de exibição do produtor <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="support-name"
                      value={generalData.support_name}
                      onChange={(e) => {
                        setGeneralData({ ...generalData, support_name: e.target.value });
                        setGeneralModified(true);
                        if (errors.support_name) {
                          setErrors({ ...errors, support_name: "" });
                        }
                      }}
                      className={`bg-background text-foreground ${
                        errors.support_name ? "border-red-500 focus:border-red-500" : "border-border"
                      }`}
                      placeholder="Digite o nome de exibição"
                    />
                    {errors.support_name && (
                      <p className="text-sm text-red-500">{errors.support_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support-email" className="text-foreground">
                      E-mail de suporte <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={generalData.support_email}
                      onChange={(e) => {
                        setGeneralData({ ...generalData, support_email: e.target.value });
                        setGeneralModified(true);
                        if (errors.support_email) {
                          setErrors({ ...errors, support_email: "" });
                        }
                      }}
                      className={`bg-background text-foreground ${
                        errors.support_email ? "border-red-500 focus:border-red-500" : "border-border"
                      }`}
                      placeholder="Digite o e-mail de suporte"
                    />
                    {errors.support_email && (
                      <p className="text-sm text-red-500">{errors.support_email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border">
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir Produto
                </Button>
                <Button 
                  onClick={handleSaveGeneral}
                  disabled={loading || !generalModified && !imageModified}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Pagamento</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Aprenda sobre as configurações de parcelamento no checkout
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-foreground mb-4">Métodos de pagamento</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Arraste os elementos abaixo para definir a ordem que aparecerá no checkout e clique no botão 
                      "Método padrão" para definir como pagamento padrão do checkout se o método de pagamento estiver selecionado
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="border border-primary bg-primary/10 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 7h-8v6h8V7zm0 8h-8v6h8v-6zM5 7H3v14h2V7z"/>
                            </svg>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">PIX</p>
                        <p className="text-xs text-muted-foreground mb-3">Valor líquido: R$ 43,58</p>
                        <Button 
                          size="sm" 
                          variant={paymentSettings.defaultPaymentMethod === "pix" ? "default" : "outline"}
                          onClick={() => {
                            setPaymentSettings({ ...paymentSettings, defaultPaymentMethod: "pix" });
                            setPaymentSettingsModified(true);
                          }}
                          className="w-full"
                        >
                          {paymentSettings.defaultPaymentMethod === "pix" ? "Método padrão" : "Definir como padrão"}
                        </Button>
                      </div>

                      <div className="border border-primary bg-primary/10 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">Cartão de Crédito</p>
                        <p className="text-xs text-muted-foreground mb-3">Valor líquido: R$ 42,10</p>
                        <Button 
                          size="sm" 
                          variant={paymentSettings.defaultPaymentMethod === "credit_card" ? "default" : "outline"}
                          onClick={() => {
                            setPaymentSettings({ ...paymentSettings, defaultPaymentMethod: "credit_card" });
                            setPaymentSettingsModified(true);
                          }}
                          className="w-full"
                        >
                          {paymentSettings.defaultPaymentMethod === "credit_card" ? "Método padrão" : "Definir como padrão"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-method" className="text-foreground">
                        Método de pagamento padrão do Checkout
                      </Label>
                      <Select
                        value={paymentSettings.defaultPaymentMethod}
                        onValueChange={(value) => {
                          setPaymentSettings({ ...paymentSettings, defaultPaymentMethod: value });
                          setPaymentSettingsModified(true);
                        }}
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 mt-6">
                    <h4 className="text-base font-medium text-foreground mb-4">Dados do Checkout</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Selecione os campos que serão solicitados no checkout
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="fullName" 
                          checked={checkoutFields.fullName}
                          onCheckedChange={(checked) => {
                            setCheckoutFields({ ...checkoutFields, fullName: checked as boolean });
                            setCheckoutFieldsModified(true);
                          }}
                        />
                        <Label htmlFor="fullName" className="text-foreground cursor-pointer">
                          Nome Completo <span className="text-destructive">*</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="phone" 
                          checked={checkoutFields.phone}
                          onCheckedChange={(checked) => {
                            setCheckoutFields({ ...checkoutFields, phone: checked as boolean });
                            setCheckoutFieldsModified(true);
                          }}
                        />
                        <Label htmlFor="phone" className="text-foreground cursor-pointer">
                          Telefone <span className="text-destructive">*</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="email" 
                          checked={checkoutFields.email}
                          onCheckedChange={(checked) => {
                            setCheckoutFields({ ...checkoutFields, email: checked as boolean });
                            setCheckoutFieldsModified(true);
                          }}
                        />
                        <Label htmlFor="email" className="text-foreground cursor-pointer">
                          Email <span className="text-destructive">*</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cpf" 
                          checked={checkoutFields.cpf}
                          onCheckedChange={(checked) => {
                            setCheckoutFields({ ...checkoutFields, cpf: checked as boolean });
                            setCheckoutFieldsModified(true);
                          }}
                        />
                        <Label htmlFor="cpf" className="text-foreground cursor-pointer">
                          CPF (Opcional)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border">
                <div />
                <Button 
                  onClick={handleSavePaymentSettings}
                  disabled={loading || !paymentSettingsModified && !checkoutFieldsModified}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="order-bump" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Order Bump</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adicione produtos complementares que aparecem após a compra principal
                  </p>
                </div>
                <Button onClick={handleAddOrderBump} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Adicionar Order Bump
                </Button>
              </div>
              <OrderBumpList 
                orderBumps={orderBumps}
                onAdd={handleAddOrderBump}
                onRemove={handleRemoveOrderBump}
              />
            </div>
          </TabsContent>

          <TabsContent value="upsell" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Upsell / Downsell</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Configure as opções de upsell e downsell para seus clientes
                </p>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="customThankYou"
                        checked={upsellSettings.hasCustomThankYouPage}
                        onCheckedChange={(checked) => {
                          setUpsellSettings({ ...upsellSettings, hasCustomThankYouPage: checked });
                          setUpsellModified(true);
                        }}
                      />
                      <Label htmlFor="customThankYou" className="text-foreground cursor-pointer">
                        Usar página de obrigado customizada
                      </Label>
                    </div>

                    {upsellSettings.hasCustomThankYouPage && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="customPageUrl" className="text-foreground">
                          URL da página de obrigado
                        </Label>
                        <Input
                          id="customPageUrl"
                          value={upsellSettings.customPageUrl}
                          onChange={(e) => {
                            setUpsellSettings({ ...upsellSettings, customPageUrl: e.target.value });
                            setUpsellModified(true);
                          }}
                          className="bg-background border-border text-foreground"
                          placeholder="https://exemplo.com/obrigado"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="redirectIgnore"
                        checked={upsellSettings.redirectIgnoringOrderBumpFailures}
                        onCheckedChange={(checked) => {
                          setUpsellSettings({ ...upsellSettings, redirectIgnoringOrderBumpFailures: checked });
                          setUpsellModified(true);
                        }}
                      />
                      <Label htmlFor="redirectIgnore" className="text-foreground cursor-pointer">
                        Redirecionar ignorando falhas de order bump
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border">
                <div />
                <Button 
                  onClick={handleSaveUpsell}
                  disabled={loading || !upsellModified}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checkout" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Checkouts</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie e personalize diferentes checkouts para seus produtos
                  </p>
                </div>
                <Button onClick={handleAddCheckout} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Novo Checkout
                </Button>
              </div>
              <CheckoutTable
                checkouts={checkouts}
                onAdd={handleAddCheckout}
                onDuplicate={handleDuplicateCheckout}
                onDelete={handleDeleteCheckout}
                onConfigure={handleConfigureCheckout}
                onCustomize={handleCustomizeCheckout}
              />
            </div>
          </TabsContent>

          <TabsContent value="cupons" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Cupons</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie cupons de desconto para seus produtos
                  </p>
                </div>
                <Button onClick={handleAddCoupon} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Novo Cupom
                </Button>
              </div>
              <CouponsTable
                coupons={coupons}
                onAdd={handleAddCoupon}
                onEdit={handleEditCoupon}
                onDelete={handleDeleteCoupon}
              />
            </div>
          </TabsContent>

          <TabsContent value="afiliados" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Programa de Afiliados</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Configure as opções do seu programa de afiliados
                </p>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="affiliateEnabled"
                      checked={affiliateSettings.enabled}
                      onCheckedChange={(checked) => {
                        setAffiliateSettings({ ...affiliateSettings, enabled: checked });
                        setAffiliateModified(true);
                      }}
                    />
                    <Label htmlFor="affiliateEnabled" className="text-foreground cursor-pointer">
                      Ativar programa de afiliados
                    </Label>
                  </div>

                  {affiliateSettings.enabled && (
                    <div className="space-y-4 ml-6">
                      <div className="space-y-2">
                        <Label htmlFor="commission" className="text-foreground">
                          Comissão (%)
                        </Label>
                        <Input
                          id="commission"
                          type="number"
                          step="0.01"
                          value={affiliateSettings.commission}
                          onChange={(e) => {
                            setAffiliateSettings({ ...affiliateSettings, commission: e.target.value });
                            setAffiliateModified(true);
                          }}
                          className="bg-background border-border text-foreground"
                          placeholder="50.00"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="requireApproval"
                          checked={affiliateSettings.requireApproval}
                          onCheckedChange={(checked) => {
                            setAffiliateSettings({ ...affiliateSettings, requireApproval: checked });
                            setAffiliateModified(true);
                          }}
                        />
                        <Label htmlFor="requireApproval" className="text-foreground cursor-pointer">
                          Exigir aprovação para novos afiliados
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="allowContact"
                          checked={affiliateSettings.allowContactData}
                          onCheckedChange={(checked) => {
                            setAffiliateSettings({ ...affiliateSettings, allowContactData: checked });
                            setAffiliateModified(true);
                          }}
                        />
                        <Label htmlFor="allowContact" className="text-foreground cursor-pointer">
                          Permitir contato dos afiliados
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="upsellCommission"
                          checked={affiliateSettings.receiveUpsellCommission}
                          onCheckedChange={(checked) => {
                            setAffiliateSettings({ ...affiliateSettings, receiveUpsellCommission: checked });
                            setAffiliateModified(true);
                          }}
                        />
                        <Label htmlFor="upsellCommission" className="text-foreground cursor-pointer">
                          Comissão também em upsells
                        </Label>
                      </div>

                      <div className="space-y-2 border-t border-border pt-4">
                        <Label htmlFor="attribution" className="text-foreground">
                          Modelo de atribuição
                        </Label>
                        <Select
                          value={affiliateSettings.attribution}
                          onValueChange={(value) => {
                            setAffiliateSettings({ ...affiliateSettings, attribution: value });
                            setAffiliateModified(true);
                          }}
                        >
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first_click">Primeiro clique</SelectItem>
                            <SelectItem value="last_click">Último clique</SelectItem>
                            <SelectItem value="linear">Linear</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cookieDuration" className="text-foreground">
                          Duração do cookie (dias)
                        </Label>
                        <Input
                          id="cookieDuration"
                          type="number"
                          value={affiliateSettings.cookieDuration}
                          onChange={(e) => {
                            setAffiliateSettings({ ...affiliateSettings, cookieDuration: e.target.value });
                            setAffiliateModified(true);
                          }}
                          className="bg-background border-border text-foreground"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border">
                <div />
                <Button 
                  onClick={handleSaveAffiliate}
                  disabled={loading || !affiliateModified}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Links de Checkout</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gerencie os links de checkout para seus produtos
                  </p>
                </div>
                <Button onClick={handleAddLink} className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Novo Link
                </Button>
              </div>
              <LinksTable
                links={checkoutLinks}
                onAdd={handleAddLink}
                onToggleAffiliateVisibility={handleToggleAffiliateVisibility}
                onToggleStatus={handleToggleLinkStatus}
                onDelete={handleDeleteLink}
              />
            </div>
          </TabsContent>
        </Tabs>

        <OrderBumpDialog
          open={orderBumpDialogOpen}
          onOpenChange={(open) => {
            setOrderBumpDialogOpen(open);
            if (!open) setEditingOrderBump(null);
          }}
          onSave={handleSaveOrderBump}
          orderBump={editingOrderBump || undefined}
        />

        <CheckoutConfigDialog
          open={checkoutConfigDialogOpen}
          onOpenChange={(open) => {
            setCheckoutConfigDialogOpen(open);
            if (!open) setEditingCheckout(null);
          }}
          onSave={handleSaveCheckout}
          checkout={editingCheckout || undefined}
          availableLinks={paymentLinks}
        />

        <CouponDialog
          open={couponDialogOpen}
          onOpenChange={(open) => {
            setCouponDialogOpen(open);
            if (!open) setEditingCoupon(null);
          }}
          onSave={handleSaveCoupon}
          coupon={editingCoupon || undefined}
        />
      </div>
    </MainLayout>
  );
};

export default ProductEdit;

