import { useState, useEffect } from "react";
import { X } from "lucide-react";
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

interface CheckoutLink {
  id: string;
  name: string;
  price: number;
}

interface CheckoutConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (checkout: Checkout) => void;
  checkout: Checkout | null;
  availableLinks: CheckoutLink[];
}

export const CheckoutConfigDialog = ({
  open,
  onOpenChange,
  onSave,
  checkout,
  availableLinks,
}: CheckoutConfigDialogProps) => {
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (checkout) {
      setName(checkout.name);
      setIsDefault(checkout.isDefault);
    } else {
      setName("");
      setIsDefault(false);
    }
  }, [checkout, open]);

  const handleSave = () => {
    if (!name) return;

    const updatedCheckout: Checkout = {
      id: checkout?.id || `checkout-${Date.now()}`,
      name,
      isDefault,
      linkId: "",
      price: checkout?.price || 0,
      offer: checkout?.offer || "",
      visits: checkout?.visits || 0,
    };

    onSave(updatedCheckout);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border">
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

          {/* Informação sobre o link */}
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              O link público será gerado automaticamente após salvar. Você poderá visualizá-lo na aba "Links".
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
            disabled={!name}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
