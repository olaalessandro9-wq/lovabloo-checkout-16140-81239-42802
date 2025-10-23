import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface Offer {
  id: string;
  name: string;
  price: number;
}

interface OrderBumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSuccess: () => void;
}

export function OrderBumpDialog({ open, onOpenChange, productId, onSuccess }: OrderBumpDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Customization fields
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPrice, setDiscountPrice] = useState("0,00");
  const [callToAction, setCallToAction] = useState("SIM, EU ACEITO ESSA OFERTA ESPECIAL!");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("Adicione a compra");
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    if (open) {
      loadProducts();
      // Reset form when dialog opens
      resetForm();
    }
  }, [open, productId]);

  useEffect(() => {
    if (selectedProductId) {
      loadOffers(selectedProductId);
    } else {
      setOffers([]);
      setSelectedOfferId("");
    }
  }, [selectedProductId]);

  // Update custom title when product changes
  useEffect(() => {
    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct) {
      setCustomTitle(selectedProduct.name);
    }
  }, [selectedProductId, products]);

  const resetForm = () => {
    setSelectedProductId("");
    setSelectedOfferId("");
    setDiscountEnabled(false);
    setDiscountPrice("0,00");
    setCallToAction("SIM, EU ACEITO ESSA OFERTA ESPECIAL!");
    setCustomTitle("");
    setCustomDescription("Adicione a compra");
    setShowImage(true);
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      
      // Load all products except the current one
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .neq("id", productId)
        .order("name", { ascending: true });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOffers = async (prodId: string) => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("id, name, price")
        .eq("product_id", prodId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const offersList = data || [];
      setOffers(offersList);
      
      // Automatically select the first offer (principal)
      if (offersList.length > 0) {
        setSelectedOfferId(offersList[0].id);
      }
    } catch (error) {
      console.error("Error loading offers:", error);
      toast.error("Erro ao carregar ofertas");
    }
  };

  const formatCurrency = (value: string): string => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '0,00';
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100;
    
    // Formata com separadores
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleDiscountPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setDiscountPrice(formatted);
  };

  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleSave = async () => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return;
    }

    if (!selectedOfferId) {
      toast.error("Selecione uma oferta");
      return;
    }

    try {
      setLoading(true);

      // Get all checkouts for the current product
      const { data: checkouts, error: checkoutsError } = await supabase
        .from("checkouts")
        .select("id")
        .eq("product_id", productId);

      if (checkoutsError) throw checkoutsError;

      if (!checkouts || checkouts.length === 0) {
        toast.error("Nenhum checkout encontrado para este produto");
        return;
      }

      // Add order bump to all checkouts of this product
      const orderBumps = checkouts.map(checkout => ({
        checkout_id: checkout.id,
        product_id: selectedProductId,
        offer_id: selectedOfferId,
        discount_enabled: discountEnabled,
        discount_price: discountEnabled ? parseCurrency(discountPrice) : null,
        call_to_action: callToAction,
        custom_title: customTitle || null,
        custom_description: customDescription || null,
        show_image: showImage,
        active: true,
      }));

      const { error: insertError } = await supabase
        .from("order_bumps")
        .insert(orderBumps);

      if (insertError) throw insertError;

      toast.success("Order bump adicionado com sucesso");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving order bump:", error);
      
      if (error.code === "23505") {
        toast.error("Este produto já está configurado como order bump");
      } else {
        toast.error("Erro ao salvar order bump");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedOffer = offers.find(o => o.id === selectedOfferId);
  
  // Calculate prices for preview
  const originalPrice = selectedOffer?.price || selectedProduct?.price || 0;
  const finalPrice = discountEnabled ? parseCurrency(discountPrice) : originalPrice;
  const discountPercentage = discountEnabled && finalPrice < originalPrice && originalPrice > 0
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-foreground text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
                Adicionar Order Bump
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione um produto para oferecer como complemento
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Formulário */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="produto" className="text-foreground">Produto *</Label>
              {loadingProducts ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        Nenhum produto disponível
                      </div>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R$ {product.price.toFixed(2)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted-foreground">
                Selecione o produto que será oferecido como order bump
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oferta" className="text-foreground">Oferta *</Label>
              <Select
                value={selectedOfferId}
                onValueChange={setSelectedOfferId}
                disabled={!selectedProductId || offers.length === 0}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione uma oferta" />
                </SelectTrigger>
                <SelectContent>
                  {offers.map((offer) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.name} - R$ {offer.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                A primeira oferta do produto é selecionada automaticamente
              </p>
            </div>

            {/* Checkbox Aplicar Desconto */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="discount"
                checked={discountEnabled}
                onCheckedChange={(checked) => setDiscountEnabled(checked as boolean)}
              />
              <Label htmlFor="discount" className="text-foreground cursor-pointer">
                Aplicar desconto
              </Label>
            </div>

            {/* Campo Preço da Oferta (condicional) */}
            {discountEnabled && (
              <div className="space-y-2">
                <Label htmlFor="discountPrice" className="text-foreground">Preço da oferta</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="discountPrice"
                    value={discountPrice}
                    onChange={handleDiscountPriceChange}
                    className="pl-10 bg-background border-border text-foreground"
                    placeholder="0,00"
                  />
                </div>
                <p className="text-xs text-primary">
                  {discountPercentage > 0 && `Desconto de aproximadamente ${discountPercentage}%`}
                </p>
              </div>
            )}

            {/* Call to Action */}
            <div className="space-y-2">
              <Label htmlFor="callToAction" className="text-foreground">Call to Action</Label>
              <Input
                id="callToAction"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="bg-background border-border text-foreground"
                placeholder="SIM, EU ACEITO ESSA OFERTA ESPECIAL!"
              />
              <p className="text-xs text-muted-foreground">
                Texto que aparece no topo do order bump
              </p>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="customTitle" className="text-foreground">Título</Label>
              <Input
                id="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="bg-background border-border text-foreground"
                placeholder="Nome do seu produto"
              />
              <p className="text-xs text-muted-foreground">
                Nome que aparece no order bump (padrão: nome do produto)
              </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="customDescription" className="text-foreground">Descrição</Label>
              <Input
                id="customDescription"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="bg-background border-border text-foreground"
                placeholder="Adicione a compra"
              />
              <p className="text-xs text-muted-foreground">
                Texto descritivo do order bump
              </p>
            </div>

            {/* Checkbox Exibir Imagem */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="showImage"
                checked={showImage}
                onCheckedChange={(checked) => setShowImage(checked as boolean)}
              />
              <Label htmlFor="showImage" className="text-foreground cursor-pointer">
                Exibir imagem do produto
              </Label>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground">💡 Dica</h4>
              <p className="text-xs text-muted-foreground">
                Order bumps são exibidos no checkout como ofertas complementares. 
                O cliente pode aceitar ou recusar clicando em um checkbox.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-foreground">Preview</Label>
            <div className="bg-background border border-border rounded-lg p-6">
              {selectedProduct ? (
                <>
                  {/* Call to Action */}
                  <div className="flex items-start gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {callToAction}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Imagem (condicional) */}
                    {showImage && selectedProduct.image_url && (
                      <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={selectedProduct.image_url} 
                          alt={customTitle || selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Título */}
                    <h3 className="font-semibold text-foreground">
                      {customTitle || selectedProduct.name}
                    </h3>
                    
                    {/* Descrição */}
                    {customDescription && (
                      <p className="text-sm text-muted-foreground">
                        {customDescription}
                      </p>
                    )}
                    
                    {/* Preço */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border flex-wrap">
                      {discountEnabled && discountPercentage > 0 ? (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            R$ {originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            R$ {finalPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded font-semibold">
                            {discountPercentage}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          R$ {finalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>

                    {selectedOffer && (
                      <p className="text-xs text-primary">
                        ✓ Oferta especial: {selectedOffer.name}
                      </p>
                    )}
                  </div>

                  {/* Checkbox Adicionar */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary rounded"></div>
                      <Label className="text-sm text-foreground">
                        Adicionar Produto
                      </Label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Selecione um produto para ver o preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            className="border border-border"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={!selectedProductId || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

