import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Checkout } from "./CheckoutTable";

interface PaymentLink {
  id: string;
  slug: string;
  url: string;
  offer_name: string;
  offer_price: number;
  is_default: boolean;
}

interface CheckoutConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (checkout: Checkout, selectedLinkIds: string[]) => void;
  checkout?: Checkout;
  availableLinks: PaymentLink[];
  currentLinkIds?: string[];
}

export const CheckoutConfigDialog = ({
  open,
  onOpenChange,
  onSave,
  checkout,
  availableLinks,
  currentLinkIds = [],
}: CheckoutConfigDialogProps) => {
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);

  useEffect(() => {
    if (checkout) {
      setName(checkout.name);
      setIsDefault(checkout.isDefault);
      setSelectedLinkIds(currentLinkIds);
    } else {
      setName("");
      setIsDefault(false);
      // Selecionar automaticamente o link padrão para novos checkouts
      const defaultLink = availableLinks.find(link => link.is_default);
      setSelectedLinkIds(defaultLink ? [defaultLink.id] : []);
    }
  }, [checkout, open, currentLinkIds, availableLinks]);

  const handleToggleLink = (linkId: string) => {
    setSelectedLinkIds(prev => {
      if (prev.includes(linkId)) {
        // Não permitir desmarcar se for o último link
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(id => id !== linkId);
      } else {
        return [...prev, linkId];
      }
    });
  };

  const handleSave = () => {
    if (!name || selectedLinkIds.length === 0) return;

    const updatedCheckout: Checkout = {
      id: checkout?.id || `checkout-${Date.now()}`,
      name,
      isDefault,
      linkId: selectedLinkIds[0], // Manter compatibilidade
      price: checkout?.price || 0,
      offer: checkout?.offer || "",
      visits: checkout?.visits || 0,
    };

    onSave(updatedCheckout, selectedLinkIds);
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

          {/* Seleção de Links */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">
              Links de Pagamento
            </Label>
            <p className="text-sm text-muted-foreground">
              Selecione quais ofertas estarão disponíveis neste checkout
            </p>

            {availableLinks.length === 0 ? (
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
              <div className="space-y-2 border border-border rounded-lg p-4">
                {availableLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`link-${link.id}`}
                      checked={selectedLinkIds.includes(link.id)}
                      onCheckedChange={() => handleToggleLink(link.id)}
                      disabled={selectedLinkIds.length === 1 && selectedLinkIds.includes(link.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`link-${link.id}`}
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {link.offer_name}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        R$ {link.offer_price.toFixed(2)}
                      </p>
                      <code className="text-xs text-muted-foreground/70 mt-1 block">
                        /{link.slug}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedLinkIds.length === 1 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                  💡 Você precisa ter pelo menos um link associado ao checkout.
                </p>
              </div>
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
            disabled={!name || selectedLinkIds.length === 0}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

