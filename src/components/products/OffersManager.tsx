import { useState, useEffect } from "react";
import { Plus, Trash2, Star } from "lucide-react";
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
    // Se há mais de uma oferta, ativa o modo múltiplas ofertas
    setHasMultipleOffers(offers.length > 1);
  }, [offers]);

  const handleToggleMultipleOffers = (enabled: boolean) => {
    setHasMultipleOffers(enabled);
    
    // Não criar oferta automaticamente ao ativar
    // Usuário deve clicar em "Adicionar Nova Oferta"
    
    if (!enabled && offers.length > 1) {
      // Ao desativar, manter apenas a oferta padrão
      const defaultOffer = offers.find(o => o.is_default) || offers[0];
      onOffersChange([defaultOffer]);
      onModifiedChange(true);
      toast.info("Apenas a oferta padrão foi mantida");
    }
  };

  const handleAddOffer = () => {
    const newOffer: Offer = {
      id: `temp-${Date.now()}`,
      name: "", // Nome vazio para o usuário preencher
      price: "0.00", // Preço zerado
      is_default: false,
    };
    onOffersChange([...offers, newOffer]);
    onModifiedChange(true);
  };

  const handleRemoveOffer = (id: string) => {
    if (offers.length === 1) {
      toast.error("Você precisa ter pelo menos uma oferta");
      return;
    }

    const offerToRemove = offers.find(o => o.id === id);
    if (offerToRemove?.is_default) {
      toast.error("Não é possível remover a oferta padrão. Defina outra oferta como padrão primeiro.");
      return;
    }

    onOffersChange(offers.filter(o => o.id !== id));
    onModifiedChange(true);
    toast.success("Oferta removida");
  };

  const handleUpdateOffer = (id: string, field: keyof Offer, value: string | boolean) => {
    const updatedOffers = offers.map(offer => {
      if (offer.id === id) {
        // Se estamos marcando como padrão, desmarcar todas as outras
        if (field === "is_default" && value === true) {
          return { ...offer, is_default: true };
        }
        return { ...offer, [field]: value };
      } else if (field === "is_default" && value === true) {
        // Desmarcar outras ofertas como padrão
        return { ...offer, is_default: false };
      }
      return offer;
    });
    
    onOffersChange(updatedOffers);
    onModifiedChange(true);
  };

  const handleSetDefault = (id: string) => {
    handleUpdateOffer(id, "is_default", true);
    toast.success("Oferta padrão atualizada");
  };

  if (!hasMultipleOffers && offers.length <= 1) {
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
                {offer.is_default && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Star className="w-3 h-3" />
                    Padrão
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!offer.is_default && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(offer.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                {offers.length > 1 && !offer.is_default && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOffer(offer.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`offer-name-${offer.id}`}>Nome da Oferta</Label>
                <Input
                  id={`offer-name-${offer.id}`}
                  value={offer.name}
                  onChange={(e) => handleUpdateOffer(offer.id, "name", e.target.value)}
                  placeholder="Ex: Rise community R$ 37,90"
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

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>💡 Importante:</strong> Os links de pagamento serão gerados automaticamente quando você clicar em "Salvar Alterações". Cada oferta terá seu próprio link único.
          </p>
        </div>
      </div>
    </div>
  );
};

