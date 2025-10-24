import { ColorPicker } from "./ColorPicker";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CheckoutColorSettingsEssentialProps {
  design: any;
  onUpdateDesign: (design: any) => void;
}

export const CheckoutColorSettingsEssential = ({ 
  design, 
  onUpdateDesign 
}: CheckoutColorSettingsEssentialProps) => {
  
  const updateColor = (field: string, value: string) => {
    onUpdateDesign({
      ...design,
      colors: {
        ...design.colors,
        [field]: value,
      },
    });
  };

  const updateButtonColor = (field: string, value: string) => {
    onUpdateDesign({
      ...design,
      colors: {
        ...design.colors,
        button: {
          ...design.colors.button,
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Fonte */}
      <div className="space-y-3">
        <h4 className="font-semibold">Fonte</h4>
        <div>
          <Label>Família da Fonte</Label>
          <Select
            value={design.font || "Inter"}
            onValueChange={(value) =>
              onUpdateDesign({
                ...design,
                font: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
              <SelectItem value="Poppins">Poppins</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
              <SelectItem value="Open Sans">Open Sans</SelectItem>
              <SelectItem value="Lato">Lato</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Cores de Texto */}
      <div className="space-y-4">
        <h4 className="font-semibold">Cores de Texto</h4>
        <ColorPicker
          label="Cor do Texto Principal"
          value={design.colors?.primaryText || "#1F2937"}
          onChange={(value) => updateColor("primaryText", value)}
          description="Títulos e textos principais"
        />
        <ColorPicker
          label="Cor do Texto Secundário"
          value={design.colors?.secondaryText || "#6B7280"}
          onChange={(value) => updateColor("secondaryText", value)}
          description="Descrições e textos secundários"
        />
        <ColorPicker
          label="Cor Ativa"
          value={design.colors?.active || "#10B981"}
          onChange={(value) => updateColor("active", value)}
          description="Elementos selecionados e em destaque (verde padrão)"
        />
        <ColorPicker
          label="Cor dos Ícones"
          value={design.colors?.icon || "#1F2937"}
          onChange={(value) => updateColor("icon", value)}
          description="Ícones do Pix, Cartão de Crédito, etc."
        />
      </div>

      <Separator />

      {/* Cores de Fundo */}
      <div className="space-y-4">
        <h4 className="font-semibold">Cores de Fundo</h4>
        <ColorPicker
          label="Cor de Fundo Geral"
          value={design.colors?.background || "#FFFFFF"}
          onChange={(value) => updateColor("background", value)}
          description="Fundo principal do checkout"
        />
        <ColorPicker
          label="Cor de Fundo do Formulário"
          value={design.colors?.formBackground || "#F9FAFB"}
          onChange={(value) => updateColor("formBackground", value)}
          description="Fundo da área de pagamento"
        />
      </div>

      <Separator />

      {/* Botão de Pagamento */}
      <div className="space-y-4">
        <h4 className="font-semibold">Botão de Pagamento</h4>
        <ColorPicker
          label="Cor de Fundo do Botão"
          value={design.colors?.button?.background || "#10B981"}
          onChange={(value) => updateButtonColor("background", value)}
          description="Cor do botão 'Finalizar Compra' (verde padrão)"
        />
        <ColorPicker
          label="Cor do Texto do Botão"
          value={design.colors?.button?.text || "#FFFFFF"}
          onChange={(value) => updateButtonColor("text", value)}
          description="Cor do texto no botão de pagamento"
        />
      </div>

      <Separator />

      {/* Informação sobre Cores Avançadas */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> Estas são as cores essenciais que afetam a maior parte do checkout. 
          Para customizações mais avançadas (estados selecionados/não selecionados, caixas específicas), 
          mais opções serão adicionadas em breve.
        </p>
      </div>
    </div>
  );
};

