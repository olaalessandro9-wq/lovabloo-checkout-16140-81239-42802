import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  is_default: boolean; // Manter no tipo mas não usar na UI
}

interface OffersManagerProps {
  productId: string | null;
  productName: string;
  defaultPrice: string;
  offers: Offer[];
  onOffersChange: (offers: Offer[]) => void;
  onModifiedChange: (modified: boolean) => void;
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

  useEffect(() => {
    // Se há ofertas, ativa o modo múltiplas ofertas
    setHasMultipleOffers(offers.length > 0);
  }, [offers]);

  const handleToggleMultipleOffers = (enabled: boolean) => {
    // Não permitir que o toggle feche se há ofertas
    if (!enabled && offers.length > 0) {
      toast.error("Remova todas as ofertas antes de desativar");
      return;
    }
    
    setHasMultipleOffers(enabled);
  };

  const handleAddOffer = () => {
    const newOffer: Offer = {
      id: `temp-${Date.now()}`,
      name: "", // Nome vazio para o usuário preencher
      price: "0.00", // Preço zerado
      is_default: false,
    };
    
    // Garantir que o toggle permaneça ativado
    setHasMultipleOffers(true);
    
    onOffersChange([...offers, newOffer]);
    onModifiedChange(true);
  };

  const handleRemoveOffer = (id: string) => {
    const newOffers = offers.filter(o => o.id !== id);
    onOffersChange(newOffers);
    onModifiedChange(true);
    
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
  };

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
        {offers.map((offer, index) => (
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
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Este nome será usado para gerar o link de pagamento
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`offer-price-${offer.id}`}>Preço</Label>
                <CurrencyInput
                  id={`offer-price-${offer.id}`}
                  value={offer.price}
                  onChange={(value) => handleUpdateOffer(offer.id, "price", value)}
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddOffer}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Nova Oferta
        </Button>

        {/* Removida mensagem "💡 Importante" */}
      </div>
    </div>
  );
};

