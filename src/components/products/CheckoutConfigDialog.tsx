import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Checkout } from "./CheckoutTable";

interface Offer {
  id: string;
  name: string;
  price: number;
  is_default: boolean;
}

interface CheckoutConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (checkout: Checkout, selectedOfferId: string) => void;
  checkout?: Checkout;
  availableOffers: Offer[];
  currentOfferId?: string;
}

export const CheckoutConfigDialog = ({
  open,
  onOpenChange,
  onSave,
  checkout,
  availableOffers,
  currentOfferId = "",
}: CheckoutConfigDialogProps) => {
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");

  useEffect(() => {
    if (checkout) {
      setName(checkout.name);
      setIsDefault(checkout.isDefault);
      setSelectedOfferId(currentOfferId);
    } else {
      setName("");
      setIsDefault(false);
      // Selecionar automaticamente a oferta padrão para novos checkouts
      const defaultOffer = availableOffers.find(offer => offer.is_default);
      setSelectedOfferId(defaultOffer ? defaultOffer.id : (availableOffers[0]?.id || ""));
    }
  }, [checkout, open, currentOfferId, availableOffers]);

  const handleSave = () => {
    if (!name || !selectedOfferId) return;

    const updatedCheckout: Checkout = {
      id: checkout?.id || `checkout-${Date.now()}`,
      name,
      isDefault,
      linkId: "", // Não mais usado
      price: checkout?.price || 0,
      offer: checkout?.offer || "",
      visits: checkout?.visits || 0,
    };

    onSave(updatedCheckout, selectedOfferId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border overflow-y-auto">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground">
              {checkout ? "Editar checkout" : "Criar checkout"}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="checkout-name" className="text-foreground">
              Nome
            </Label>
            <Input
              id="checkout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do checkout"
              className="bg-background border-border"
            />
          </div>

          {/* Definir como padrão */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <Label htmlFor="default-checkout" className="text-foreground font-medium cursor-pointer">
              Definir como checkout padrão
            </Label>
            <Switch
              id="default-checkout"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
          </div>

          {/* Seleção de Oferta */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              Oferta do Checkout
            </Label>
            <p className="text-sm text-muted-foreground">
              Selecione qual oferta será vendida neste checkout
            </p>

            {availableOffers.length === 0 ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-500">
                    Nenhuma oferta disponível
                  </p>
                  <p className="text-xs text-yellow-500/80 mt-1">
                    Crie ofertas na aba "Geral" para poder associá-las a checkouts.
                  </p>
                </div>
              </div>
            ) : (
              <RadioGroup value={selectedOfferId} onValueChange={setSelectedOfferId}>
                <div className="space-y-2 border border-border rounded-lg p-4">
                  {availableOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={offer.id} id={`offer-${offer.id}`} />
                      <div className="flex-1">
                        <Label
                          htmlFor={`offer-${offer.id}`}
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          {offer.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          R$ {offer.price.toFixed(2)}
                        </p>
                        {offer.is_default && (
                          <span className="text-xs text-primary">
                            (Oferta Principal)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Informação sobre o slug */}
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              O slug público será gerado automaticamente após salvar. Você poderá visualizá-lo na aba "Checkout".
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || !selectedOfferId}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

