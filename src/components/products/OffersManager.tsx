import { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";

export interface Offer {
  id: string;
  name: string;
  price: string;
  is_default: boolean;
}

interface OfferError {
  name?: string;
  price?: string;
}

interface OffersManagerProps {
  productId: string | null;
  productName: string;
  defaultPrice: string;
  offers: Offer[];
  onOffersChange: (offers: Offer[]) => void;
  onModifiedChange: (modified: boolean) => void;
  onValidate?: () => boolean; // Callback para validar ofertas externamente
}

export const OffersManager = ({
  productId,
  productName,
  defaultPrice,
  offers,
  onOffersChange,
  onModifiedChange,
}: OffersManagerProps) => {
  const [hasMultipleOffers, setHasMultipleOffers] = useState(false);
  const [errors, setErrors] = useState<Record<string, OfferError>>({});

  useEffect(() => {
    // Se há ofertas, ativa o modo múltiplas ofertas
    setHasMultipleOffers(offers.length > 0);
  }, [offers]);

  // Validar uma oferta específica
  const validateOffer = (offer: Offer): OfferError => {
    const error: OfferError = {};
    
    if (!offer.name || offer.name.trim() === "") {
      error.name = "Campo obrigatório";
    }
    
    const price = parseFloat(offer.price);
    if (isNaN(price) || price <= 0) {
      error.price = "O preço mínimo é R$ 0,01";
    }
    
    return error;
  };

  // Verificar se há ofertas com erros
  const hasErrors = (): boolean => {
    const newErrors: Record<string, OfferError> = {};
    let hasError = false;

    offers.forEach(offer => {
      const error = validateOffer(offer);
      if (Object.keys(error).length > 0) {
        newErrors[offer.id] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);
    return hasError;
  };

  // Verificar se há pelo menos uma oferta válida
  const hasValidOffers = (): boolean => {
    if (offers.length === 0) return false;
    
    return offers.some(offer => {
      const error = validateOffer(offer);
      return Object.keys(error).length === 0;
    });
  };

  const handleToggleMultipleOffers = (enabled: boolean) => {
    // Não permitir que o toggle feche se há ofertas
    if (!enabled && offers.length > 0) {
      toast.error("Remova todas as ofertas antes de desativar");
      return;
    }
    
    setHasMultipleOffers(enabled);
  };

  const handleAddOffer = () => {
    // Verificar se há ofertas incompletas antes de adicionar nova
    if (offers.length > 0) {
      const hasIncomplete = offers.some(offer => {
        const error = validateOffer(offer);
        return Object.keys(error).length > 0;
      });

      if (hasIncomplete) {
        hasErrors(); // Atualizar erros visuais
        toast.error("Preencha todos os campos da oferta anterior antes de adicionar uma nova");
        return;
      }
    }

    const newOffer: Offer = {
      id: `temp-${Date.now()}`,
      name: "",
      price: "0.00",
      is_default: false,
    };
    
    setHasMultipleOffers(true);
    onOffersChange([...offers, newOffer]);
    onModifiedChange(true);
  };

  const handleRemoveOffer = (id: string) => {
    const newOffers = offers.filter(o => o.id !== id);
    onOffersChange(newOffers);
    onModifiedChange(true);
    
    // Remover erros da oferta removida
    const newErrors = { ...errors };
    delete newErrors[id];
    setErrors(newErrors);
    
    // Se não há mais ofertas, desativar o toggle
    if (newOffers.length === 0) {
      setHasMultipleOffers(false);
    }
    
    toast.success("Oferta removida");
  };

  const handleUpdateOffer = (id: string, field: keyof Offer, value: string | boolean) => {
    const updatedOffers = offers.map(offer => {
      if (offer.id === id) {
        return { ...offer, [field]: value };
      }
      return offer;
    });
    
    onOffersChange(updatedOffers);
    onModifiedChange(true);

    // Revalidar a oferta atualizada
    const updatedOffer = updatedOffers.find(o => o.id === id);
    if (updatedOffer) {
      const error = validateOffer(updatedOffer);
      const newErrors = { ...errors };
      
      if (Object.keys(error).length === 0) {
        delete newErrors[id];
      } else {
        newErrors[id] = error;
      }
      
      setErrors(newErrors);
    }
  };

  // Função pública para validar ofertas (pode ser chamada externamente)
  const validateAllOffers = () => {
    return !hasErrors(); // Retorna true se NÃO houver erros
  };

  // Expor função de validação globalmente (apenas se necessário)
  useEffect(() => {
    (window as any).__validateOffers = validateAllOffers;
  }, [offers]);

  if (!hasMultipleOffers) {
    return (
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ofertas</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ative para criar diferentes variações de preço para este produto
            </p>
          </div>
          <Switch
            checked={hasMultipleOffers}
            onCheckedChange={handleToggleMultipleOffers}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Quando ativado, você poderá criar múltiplas ofertas com preços diferentes. Cada oferta gerará um link de pagamento único automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Ofertas</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as diferentes variações de preço deste produto
          </p>
        </div>
        <Switch
          checked={hasMultipleOffers}
          onCheckedChange={handleToggleMultipleOffers}
        />
      </div>

      <div className="space-y-4">
        {offers.length === 0 ? (
          <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              Você tem que inserir ao menos uma oferta
            </p>
          </div>
        ) : (
          offers.map((offer, index) => (
            <div
              key={offer.id}
              className="border border-border rounded-lg p-4 space-y-4 bg-background/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {/* Removido badge "Padrão" */}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOffer(offer.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`offer-name-${offer.id}`}>Nome da Oferta</Label>
                  <Input
                    id={`offer-name-${offer.id}`}
                    value={offer.name}
                    onChange={(e) => handleUpdateOffer(offer.id, "name", e.target.value)}
                    placeholder="Ex: Rise community"
                    className={`bg-background ${errors[offer.id]?.name ? 'border-destructive' : ''}`}
                  />
                  {errors[offer.id]?.name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      {errors[offer.id].name}
                    </p>
                  )}
                  {!errors[offer.id]?.name && (
                    <p className="text-xs text-muted-foreground">
                      Este nome será usado para gerar o link de pagamento
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`offer-price-${offer.id}`}>Preço</Label>
                  <CurrencyInput
                    id={`offer-price-${offer.id}`}
                    value={offer.price}
                    onChange={(value) => handleUpdateOffer(offer.id, "price", String(value))}
                    className={`bg-background ${errors[offer.id]?.price ? 'border-destructive' : ''}`}
                  />
                  {errors[offer.id]?.price && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      {errors[offer.id].price}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddOffer}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Nova Oferta
        </Button>
      </div>
    </div>
  );
};

