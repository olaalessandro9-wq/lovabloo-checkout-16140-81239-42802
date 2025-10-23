import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    if (open) {
      loadProducts();
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

      setOffers(data || []);
    } catch (error) {
      console.error("Error loading offers:", error);
      toast.error("Erro ao carregar ofertas");
    }
  };

  const handleSave = async () => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
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

      // Get current max position
      const { data: existingBumps, error: bumpsError } = await supabase
        .from("order_bumps")
        .select("position")
        .in("checkout_id", checkouts.map(c => c.id))
        .order("position", { ascending: false })
        .limit(1);

      if (bumpsError) throw bumpsError;

      const nextPosition = existingBumps && existingBumps.length > 0 
        ? existingBumps[0].position + 1 
        : 0;

      // Add order bump to all checkouts of this product
      const orderBumps = checkouts.map(checkout => ({
        checkout_id: checkout.id,
        product_id: selectedProductId,
        offer_id: selectedOfferId || null,
        position: nextPosition,
        active: true,
      }));

      const { error: insertError } = await supabase
        .from("order_bumps")
        .insert(orderBumps);

      if (insertError) throw insertError;

      toast.success("Order bump adicionado com sucesso");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setSelectedProductId("");
      setSelectedOfferId("");
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
    setSelectedProductId("");
    setSelectedOfferId("");
    onOpenChange(false);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedOffer = offers.find(o => o.id === selectedOfferId);
  const displayPrice = selectedOffer ? selectedOffer.price : selectedProduct?.price || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-card border-border">
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
              <Label htmlFor="oferta" className="text-foreground">Oferta (Opcional)</Label>
              <Select
                value={selectedOfferId}
                onValueChange={setSelectedOfferId}
                disabled={!selectedProductId || offers.length === 0}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Oferta padrão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Oferta padrão</SelectItem>
                  {offers.map((offer) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.name} - R$ {offer.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se não selecionar, será usada a oferta padrão do produto
              </p>
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
                  <div className="flex items-start gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        SIM, EU ACEITO ESSA OFERTA ESPECIAL!
                      </h4>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedProduct.image_url && (
                      <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={selectedProduct.image_url} 
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <h3 className="font-semibold text-foreground">
                      {selectedProduct.name}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">Preço:</span>
                      <span className="text-lg font-bold text-primary">
                        R$ {displayPrice.toFixed(2)}
                      </span>
                    </div>

                    {selectedOffer && (
                      <p className="text-xs text-primary">
                        ✓ Oferta especial: {selectedOffer.name}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary rounded"></div>
                      <Label className="text-sm text-foreground">
                        Adicionar ao pedido
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

