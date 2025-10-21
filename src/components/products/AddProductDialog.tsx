import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const handleContinue = () => {
    if (!formData.name || !formData.description || !formData.price) {
      return;
    }
    
    // Close dialog and reset form
    onOpenChange(false);
    setFormData({ name: "", description: "", price: "" });
    
    // Navigate to product edit page (without state since there's no database)
    navigate("/produtos/editar");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({ name: "", description: "", price: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adicionar Produto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border-border text-foreground"
              placeholder="Digite o nome do produto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border text-foreground min-h-[100px]"
              placeholder="Digite a descrição do produto"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.description.length}/100
            </p>
          </div>

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

        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            className="border border-border"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleContinue}
            className="bg-primary hover:bg-primary/90"
            disabled={!formData.name || !formData.description || !formData.price}
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
