import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Gift } from "lucide-react";

export interface OrderBump {
  id: string;
  produto: string;
  oferta: string;
  aplicarDesconto: boolean;
  textoAceitacao: string;
  titulo: string;
  descricao: string;
  exibirImagem: boolean;
}

interface OrderBumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orderBump: OrderBump) => void;
  orderBump?: OrderBump | null;
}

export function OrderBumpDialog({ open, onOpenChange, onSave, orderBump }: OrderBumpDialogProps) {
  const [formData, setFormData] = useState<OrderBump>({
    id: "",
    produto: "",
    oferta: "",
    aplicarDesconto: false,
    textoAceitacao: "SIM, EU ACEITO ESSA OFERTA ESPECIAL!",
    titulo: "Nome do seu produto",
    descricao: "Adicione a compra",
    exibirImagem: false,
  });

  useEffect(() => {
    if (orderBump) {
      setFormData(orderBump);
    } else {
      setFormData({
        id: Date.now().toString(),
        produto: "",
        oferta: "",
        aplicarDesconto: false,
        textoAceitacao: "SIM, EU ACEITO ESSA OFERTA ESPECIAL!",
        titulo: "Nome do seu produto",
        descricao: "Adicione a compra",
        exibirImagem: false,
      });
    }
  }, [orderBump, open]);

  const handleSave = () => {
    if (!formData.produto || !formData.oferta) {
      return;
    }
    
    onSave(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

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
                Order Bump
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ofereça um produto complementar ao seu cliente
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
              <Label htmlFor="produto" className="text-foreground">Produto</Label>
              <Select
                value={formData.produto}
                onValueChange={(value) => setFormData({ ...formData, produto: value })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produto1">Produto 1</SelectItem>
                  <SelectItem value="produto2">Produto 2</SelectItem>
                  <SelectItem value="produto3">Produto 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oferta" className="text-foreground">Oferta</Label>
              <Select
                value={formData.oferta}
                onValueChange={(value) => setFormData({ ...formData, oferta: value })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione uma oferta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oferta1">Oferta Principal</SelectItem>
                  <SelectItem value="oferta2">Oferta Desconto 20%</SelectItem>
                  <SelectItem value="oferta3">Oferta Desconto 30%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="aplicarDesconto" 
                checked={formData.aplicarDesconto}
                onCheckedChange={(checked) => setFormData({ ...formData, aplicarDesconto: checked as boolean })}
              />
              <Label htmlFor="aplicarDesconto" className="text-foreground cursor-pointer">
                Aplicar desconto
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textoAceitacao" className="text-foreground">Texto aceitação</Label>
              <Textarea
                id="textoAceitacao"
                value={formData.textoAceitacao}
                onChange={(e) => setFormData({ ...formData, textoAceitacao: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="SIM, EU ACEITO ESSA OFERTA ESPECIAL!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-foreground">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="Nome do seu produto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-foreground">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="bg-background border-border text-foreground"
                placeholder="Adicione a compra"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="exibirImagem" 
                checked={formData.exibirImagem}
                onCheckedChange={(checked) => setFormData({ ...formData, exibirImagem: checked as boolean })}
              />
              <Label htmlFor="exibirImagem" className="text-foreground cursor-pointer">
                Exibir imagem do produto
              </Label>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-foreground">Preview</Label>
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-start gap-2 mb-4">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {formData.textoAceitacao || "SIM, EU ACEITO ESSA OFERTA ESPECIAL!"}
                  </h4>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">
                  {formData.titulo || "Nome do seu produto"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formData.descricao || "Adicione a compra"}
                </p>
                
                {formData.produto && formData.oferta && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Produto: {formData.produto}</span>
                      <span className="text-xs text-muted-foreground">Oferta: {formData.oferta}</span>
                    </div>
                    {formData.aplicarDesconto && (
                      <p className="text-xs text-primary mt-1">✓ Com desconto aplicado</p>
                    )}
                  </div>
                )}

                {formData.exibirImagem && (
                  <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Imagem do produto será exibida aqui</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Checkbox id="preview-check" disabled />
                  <Label htmlFor="preview-check" className="text-sm text-foreground">
                    Adicionar Produto
                  </Label>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3 mt-4">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">ℹ</span>
                <span><strong>Dica:</strong> Este preview mostra como o order bump aparecerá no checkout do seu cliente.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            className="border border-border"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={!formData.produto || !formData.oferta}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
