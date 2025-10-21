import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckoutCustomization } from "@/pages/CheckoutCustomizer";

interface CheckoutCustomizationPanelProps {
  customization: CheckoutCustomization;
  onChange: (customization: CheckoutCustomization) => void;
}

const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const handleHslChange = (newValue: string) => {
    // Garante que o valor esteja no formato hsl()
    if (!newValue.startsWith("hsl(")) {
      onChange(`hsl(${newValue})`);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-foreground">{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => handleHslChange(hexToHsl(e.target.value))}
          className="w-12 h-12 rounded border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => handleHslChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground"
          placeholder="hsl(0, 0%, 0%)"
        />
      </div>
    </div>
  );
};

// Funções auxiliares para converter entre HSL e HEX
const hslToHex = (hsl: string): string => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "#000000";

  const h = parseInt(match[1]);
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
};

export const CheckoutCustomizationPanel = ({
  customization,
  onChange,
}: CheckoutCustomizationPanelProps) => {
  const updateCustomization = (key: keyof CheckoutCustomization, value: string) => {
    onChange({ ...customization, [key]: value });
  };

  return (
    <div className="w-96 border-l border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Configurações</h3>
        <p className="text-sm text-muted-foreground">
          Personalize as cores do checkout
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-6">
          {/* Font Selection */}
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Fonte</Label>
            <select
              value={customization.font}
              onChange={(e) => updateCustomization("font", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>

          <Separator />

          {/* Colors */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Cores Principais</h4>
            
            <ColorPicker
              label="Cor de Fundo"
              value={customization.backgroundColor}
              onChange={(value) => updateCustomization("backgroundColor", value)}
            />

            <ColorPicker
              label="Cor do Texto"
              value={customization.textColor}
              onChange={(value) => updateCustomization("textColor", value)}
            />

            <ColorPicker
              label="Cor dos Campos"
              value={customization.formBackgroundColor}
              onChange={(value) => updateCustomization("formBackgroundColor", value)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Botões</h4>

            <ColorPicker
              label="Cor do Botão Principal"
              value={customization.buttonColor}
              onChange={(value) => updateCustomization("buttonColor", value)}
            />

            <ColorPicker
              label="Cor do Texto do Botão"
              value={customization.buttonTextColor}
              onChange={(value) => updateCustomization("buttonTextColor", value)}
            />

            <ColorPicker
              label="Cor do Pagamento Selecionado"
              value={customization.selectedPaymentColor}
              onChange={(value) => updateCustomization("selectedPaymentColor", value)}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
