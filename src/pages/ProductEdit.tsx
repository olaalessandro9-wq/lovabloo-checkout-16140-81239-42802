import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, CreditCard, Link2, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { OrderBumpList } from "@/components/products/OrderBumpList";
import { OrderBumpDialog, type OrderBump } from "@/components/products/OrderBumpDialog";
import { CheckoutTable, type Checkout } from "@/components/products/CheckoutTable";
import { CheckoutConfigDialog } from "@/components/products/CheckoutConfigDialog";
import { CouponsTable, type Coupon } from "@/components/products/CouponsTable";
import { CouponDialog } from "@/components/products/CouponDialog";
import { LinksTable, type CheckoutLink } from "@/components/products/LinksTable";

const ProductEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    productImage: null as File | null,
    supportName: "",
    supportEmail: "",
  });

  const [paymentSettings, setPaymentSettings] = useState({
    pixEnabled: true,
    creditCardEnabled: true,
    defaultPaymentMethod: "credit_card",
  });

  const [checkoutFields, setCheckoutFields] = useState({
    fullName: true,
    phone: true,
    email: true,
    cpf: false,
  });

  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [orderBumpDialogOpen, setOrderBumpDialogOpen] = useState(false);
  const [editingOrderBump, setEditingOrderBump] = useState<OrderBump | null>(null);

  const [upsellSettings, setUpsellSettings] = useState({
    hasCustomThankYouPage: false,
    customPageUrl: "",
    redirectIgnoringOrderBumpFailures: false,
  });

  // Mock data para links (será substituído pela aba Links mais tarde)
  const mockLinks = [
    { id: "link-1", name: "Rise community", price: 47.00 },
    { id: "link-2", name: "Premium Access", price: 97.00 },
    { id: "link-3", name: "VIP Members", price: 147.00 },
  ];

  const [checkouts, setCheckouts] = useState<Checkout[]>([
    {
      id: "checkout-1",
      name: "Checkout Principal",
      price: 47.00,
      visits: 34,
      offer: "Rise community",
      isDefault: true,
      linkId: "link-1",
    },
  ]);
  const [checkoutConfigDialogOpen, setCheckoutConfigDialogOpen] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState<Checkout | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

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
      setFormData({ ...formData, productImage: file });
    }
  };

  const handleSave = () => {
    if (!formData.supportName || !formData.supportEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome de exibição e email de suporte",
        variant: "destructive",
      });
      return;
    }

    // Here you would save to database
    toast({
      title: "Produto salvo",
      description: "O produto foi salvo com sucesso",
    });
  };

  const handleDelete = () => {
    // Here you would delete from database
    toast({
      title: "Produto excluído",
      description: "O produto foi excluído",
      variant: "destructive",
    });
    navigate("/produtos");
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
      toast({
        title: "Order bump atualizado",
        description: "O order bump foi atualizado com sucesso",
      });
    } else {
      setOrderBumps([...orderBumps, orderBump]);
      toast({
        title: "Order bump adicionado",
        description: "O order bump foi adicionado com sucesso",
      });
    }
  };

  const handleRemoveOrderBump = (id: string) => {
    setOrderBumps(orderBumps.filter(ob => ob.id !== id));
    toast({
      title: "Order bump removido",
      description: "O order bump foi removido",
    });
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
    toast({
      title: "Checkout duplicado",
      description: "Uma cópia do checkout foi criada",
    });
  };

  const handleDeleteCheckout = (id: string) => {
    setCheckouts(checkouts.filter(c => c.id !== id));
    toast({
      title: "Checkout excluído",
      description: "O checkout foi removido",
    });
  };

  const handleConfigureCheckout = (checkout: Checkout) => {
    setEditingCheckout(checkout);
    setCheckoutConfigDialogOpen(true);
  };

  const handleCustomizeCheckout = (checkout: Checkout) => {
    toast({
      title: "Personalização",
      description: "Funcionalidade de personalização em desenvolvimento",
    });
  };

  const handleSaveCheckout = (checkout: Checkout) => {
    if (editingCheckout) {
      // Se estiver definindo como padrão, remover padrão dos outros
      if (checkout.isDefault) {
        setCheckouts(checkouts.map(c => ({
          ...c,
          isDefault: c.id === checkout.id,
        })));
      }
      setCheckouts(checkouts.map(c => c.id === checkout.id ? checkout : c));
      toast({
        title: "Checkout atualizado",
        description: "O checkout foi atualizado com sucesso",
      });
    } else {
      // Se for o primeiro ou estiver marcado como padrão
      if (checkouts.length === 0 || checkout.isDefault) {
        setCheckouts(checkouts.map(c => ({ ...c, isDefault: false })));
      }
      setCheckouts([...checkouts, checkout]);
      toast({
        title: "Checkout adicionado",
        description: "O checkout foi adicionado com sucesso",
      });
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

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast({
      title: "Cupom excluído",
      description: "O cupom foi removido",
    });
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === coupon.id ? coupon : c));
      toast({
        title: "Cupom atualizado",
        description: "O cupom foi atualizado com sucesso",
      });
    } else {
      setCoupons([...coupons, coupon]);
      toast({
        title: "Cupom adicionado",
        description: "O cupom foi adicionado com sucesso",
      });
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
    toast({
      title: "Link adicionado",
      description: "Um novo link foi criado com sucesso",
    });
  };

  const handleToggleAffiliateVisibility = (id: string) => {
    setCheckoutLinks(checkoutLinks.map(link => 
      link.id === id 
        ? { ...link, hiddenFromAffiliates: !link.hiddenFromAffiliates }
        : link
    ));
    const link = checkoutLinks.find(l => l.id === id);
    toast({
      title: link?.hiddenFromAffiliates ? "Link visível aos afiliados" : "Link escondido dos afiliados",
      description: link?.hiddenFromAffiliates 
        ? "O link agora está visível para os afiliados"
        : "O link foi escondido dos afiliados",
    });
  };

  const handleToggleLinkStatus = (id: string) => {
    setCheckoutLinks(checkoutLinks.map(link => 
      link.id === id 
        ? { ...link, status: link.status === "active" ? "inactive" : "active" }
        : link
    ));
    const link = checkoutLinks.find(l => l.id === id);
    toast({
      title: link?.status === "active" ? "Link desativado" : "Link ativado",
      description: link?.status === "active" 
        ? "O link foi desativado com sucesso"
        : "O link foi ativado com sucesso",
    });
  };

  const handleCustomizeLink = (link: CheckoutLink) => {
    toast({
      title: "Personalização",
      description: "Funcionalidade de personalização em desenvolvimento",
    });
  };

  const handleDeleteLink = (id: string) => {
    const link = checkoutLinks.find(l => l.id === id);
    
    if (link?.isDefault) {
      toast({
        title: "Não é possível excluir",
        description: "Não é possível excluir o link padrão do produto",
        variant: "destructive",
      });
      return;
    }

    setCheckoutLinks(checkoutLinks.filter(l => l.id !== id));
    toast({
      title: "Link excluído",
      description: "O link foi excluído com sucesso",
    });
  };

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
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
          >
            Salvar Produto
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-description" className="text-foreground">Descrição</Label>
                    <Textarea
                      id="product-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-background border-border text-foreground min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Imagem do Produto</h3>
                <div className="space-y-4">
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
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Preço</h3>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-background border-border text-foreground"
                    placeholder="R$ 0,00"
                  />
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
                      value={formData.supportName}
                      onChange={(e) => setFormData({ ...formData, supportName: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="Digite o nome de exibição"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support-email" className="text-foreground">
                      E-mail de suporte <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                      className="bg-background border-border text-foreground"
                      placeholder="Digite o e-mail de suporte"
                    />
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
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
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
                          onClick={() => setPaymentSettings({ ...paymentSettings, defaultPaymentMethod: "pix" })}
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
                          onClick={() => setPaymentSettings({ ...paymentSettings, defaultPaymentMethod: "credit_card" })}
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
                        onValueChange={(value) => setPaymentSettings({ ...paymentSettings, defaultPaymentMethod: value })}
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
                          onCheckedChange={(checked) => setCheckoutFields({ ...checkoutFields, fullName: checked as boolean })}
                        />
                        <Label htmlFor="fullName" className="text-foreground cursor-pointer">
                          Nome Completo <span className="text-destructive">*</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="phone" 
                          checked={checkoutFields.phone}
                          onCheckedChange={(checked) => setCheckoutFields({ ...checkoutFields, phone: checked as boolean })}
                        />
                        <Label htmlFor="phone" className="text-foreground cursor-pointer">
                          Telefone <span className="text-destructive">*</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="email" 
                          checked={checkoutFields.email}
                          onCheckedChange={(checked) => setCheckoutFields({ ...checkoutFields, email: checked as boolean })}
                        />
                        <Label htmlFor="email" className="text-foreground cursor-pointer">
                          Email <span className="text-destructive">*</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cpf" 
                          checked={checkoutFields.cpf}
                          onCheckedChange={(checked) => setCheckoutFields({ ...checkoutFields, cpf: checked as boolean })}
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
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir Produto
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="order-bump">
            <div className="bg-card border border-border rounded-lg p-6">
              <OrderBumpList
                orderBumps={orderBumps}
                onAdd={handleAddOrderBump}
                onRemove={handleRemoveOrderBump}
                maxOrderBumps={5}
              />
              
              <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir Produto
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          <OrderBumpDialog
            open={orderBumpDialogOpen}
            onOpenChange={setOrderBumpDialogOpen}
            onSave={handleSaveOrderBump}
            orderBump={editingOrderBump}
          />

          <TabsContent value="upsell">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Upsell / Downsell</h3>
                <p className="text-sm text-muted-foreground">
                  Aprenda sobre as páginas de obrigado personalizadas e também sobre o upsell de 1 clique
                </p>
              </div>

              <div className="space-y-6">
                {/* Página de Obrigado Personalizada ou Upsell */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="customThankYouPage" className="text-foreground font-medium cursor-pointer">
                        Esse produto tem uma página de obrigado personalizada ou upsell
                      </Label>
                    </div>
                    <Switch
                      id="customThankYouPage"
                      checked={upsellSettings.hasCustomThankYouPage}
                      onCheckedChange={(checked) => 
                        setUpsellSettings({ ...upsellSettings, hasCustomThankYouPage: checked })
                      }
                    />
                  </div>

                  {upsellSettings.hasCustomThankYouPage && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                      <Label htmlFor="customPageUrl" className="text-foreground flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Cadastre PÓS aprovado
                      </Label>
                      <Input
                        id="customPageUrl"
                        type="url"
                        value={upsellSettings.customPageUrl}
                        onChange={(e) => 
                          setUpsellSettings({ ...upsellSettings, customPageUrl: e.target.value })
                        }
                        className="bg-background border-border text-foreground"
                        placeholder="https://"
                      />
                      <p className="text-xs text-muted-foreground">
                        Insira a URL completa da página para onde o cliente será redirecionado após o pagamento aprovado
                      </p>
                    </div>
                  )}
                </div>

                {/* Redirecionar ignorando falhas */}
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="redirectIgnoringFailures" className="text-foreground font-medium cursor-pointer">
                      Redirecionar upsell ignorando falhas nos pagamentos de order bumps (Cartão de crédito)
                    </Label>
                  </div>
                  <Switch
                    id="redirectIgnoringFailures"
                    checked={upsellSettings.redirectIgnoringOrderBumpFailures}
                    onCheckedChange={(checked) => 
                      setUpsellSettings({ ...upsellSettings, redirectIgnoringOrderBumpFailures: checked })
                    }
                  />
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
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checkout">
            <div className="bg-card border border-border rounded-lg p-6">
              <CheckoutTable
                checkouts={checkouts}
                onAdd={handleAddCheckout}
                onDuplicate={handleDuplicateCheckout}
                onDelete={handleDeleteCheckout}
                onConfigure={handleConfigureCheckout}
                onCustomize={handleCustomizeCheckout}
              />
              
              <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir Produto
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          <CheckoutConfigDialog
            open={checkoutConfigDialogOpen}
            onOpenChange={setCheckoutConfigDialogOpen}
            onSave={handleSaveCheckout}
            checkout={editingCheckout}
            availableLinks={mockLinks}
          />

          <TabsContent value="cupons">
            <div className="bg-card border border-border rounded-lg p-6">
              <CouponsTable
                coupons={coupons}
                onAdd={handleAddCoupon}
                onEdit={handleEditCoupon}
                onDelete={handleDeleteCoupon}
              />
              
              <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir Produto
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          <CouponDialog
            open={couponDialogOpen}
            onOpenChange={setCouponDialogOpen}
            onSave={handleSaveCoupon}
            coupon={editingCoupon}
          />

          <TabsContent value="afiliados">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Configurações</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Aprenda mais sobre os afiliados
                  </p>

                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                    <span className="text-sm font-medium text-foreground">Habilitar programa de afiliados</span>
                    <Switch
                      checked={affiliateSettings.enabled}
                      onCheckedChange={(checked) => 
                        setAffiliateSettings({ ...affiliateSettings, enabled: checked })
                      }
                    />
                  </div>
                </div>

                {affiliateSettings.enabled && (
                  <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <span className="text-sm text-foreground">Aprovar cada solicitação de afiliação manualmente</span>
                        <Switch
                          checked={affiliateSettings.requireApproval}
                          onCheckedChange={(checked) => 
                            setAffiliateSettings({ ...affiliateSettings, requireApproval: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <span className="text-sm text-foreground">Libera acesso aos dados de contato dos compradores</span>
                        <Switch
                          checked={affiliateSettings.allowContactData}
                          onCheckedChange={(checked) => 
                            setAffiliateSettings({ ...affiliateSettings, allowContactData: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <span className="text-sm text-foreground">Recebe comissão de Upsell</span>
                        <Switch
                          checked={affiliateSettings.receiveUpsellCommission}
                          onCheckedChange={(checked) => 
                            setAffiliateSettings({ ...affiliateSettings, receiveUpsellCommission: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                        <span className="text-sm text-foreground">Mostrar meu produto no marketplace público</span>
                        <Switch
                          checked={affiliateSettings.showInMarketplace}
                          onCheckedChange={(checked) => 
                            setAffiliateSettings({ ...affiliateSettings, showInMarketplace: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliate-support-email" className="text-foreground">
                        E-mail de suporte para afiliados
                      </Label>
                      <Input
                        id="affiliate-support-email"
                        type="email"
                        value={affiliateSettings.supportEmail}
                        onChange={(e) => 
                          setAffiliateSettings({ ...affiliateSettings, supportEmail: e.target.value })
                        }
                        placeholder="Digite o e-mail de suporte"
                        className="bg-background border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliate-description" className="text-foreground">
                        Descrição para afiliados
                      </Label>
                      <Textarea
                        id="affiliate-description"
                        value={affiliateSettings.description}
                        onChange={(e) => 
                          setAffiliateSettings({ ...affiliateSettings, description: e.target.value })
                        }
                        placeholder="k"
                        className="bg-background border-border text-foreground min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commission" className="text-foreground">
                        Comissão
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="commission"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={affiliateSettings.commission}
                          onChange={(e) => 
                            setAffiliateSettings({ ...affiliateSettings, commission: e.target.value })
                          }
                          className="bg-background border-border text-foreground"
                        />
                        <span className="text-foreground">%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground">Atribuição</Label>
                      <RadioGroup
                        value={affiliateSettings.attribution}
                        onValueChange={(value) => 
                          setAffiliateSettings({ ...affiliateSettings, attribution: value })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="last_click" id="last_click" />
                          <Label htmlFor="last_click" className="font-normal cursor-pointer">
                            Último clique (recomendado)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="first_click" id="first_click" />
                          <Label htmlFor="first_click" className="font-normal cursor-pointer">
                            Primeiro clique
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cookie-duration" className="text-foreground">
                        Duração dos cookies
                      </Label>
                      <Select
                        value={affiliateSettings.cookieDuration}
                        onValueChange={(value) => 
                          setAffiliateSettings({ ...affiliateSettings, cookieDuration: value })
                        }
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 dias</SelectItem>
                          <SelectItem value="15">15 dias</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="60">60 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir Produto
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links">
            <div className="bg-card border border-border rounded-lg p-6">
              <LinksTable
                links={checkoutLinks}
                onAdd={handleAddLink}
                onToggleAffiliateVisibility={handleToggleAffiliateVisibility}
                onToggleStatus={handleToggleLinkStatus}
                onCustomize={handleCustomizeLink}
                onDelete={handleDeleteLink}
              />
              
              <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Excluir Produto
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProductEdit;
