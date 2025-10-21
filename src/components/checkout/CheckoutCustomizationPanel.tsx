import { CheckoutCustomization, CheckoutComponent, LayoutType, ViewMode } from "@/pages/CheckoutCustomizer";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Image, CheckCircle, Award, Clock, MessageSquare, Columns2, Columns3, RectangleHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CheckoutCustomizationPanelProps {
  customization: CheckoutCustomization;
  onChange: (customization: CheckoutCustomization) => void;
  onAddComponent: (type: CheckoutComponent["type"]) => void;
  selectedComponentId: string | null;
  onUpdateComponent: (componentId: string, updates: Partial<CheckoutComponent>) => void;
  onDeleteComponent: (componentId: string) => void;
  onDeselectComponent: () => void;
  viewMode: ViewMode;
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

const componentItems = [
  { id: "text", label: "Texto", icon: Type },
  { id: "image", label: "Imagem", icon: Image },
  { id: "advantage", label: "Vantagem", icon: CheckCircle },
  { id: "seal", label: "Selo", icon: Award },
  { id: "timer", label: "Cronômetro", icon: Clock },
  { id: "testimonial", label: "Depoimento", icon: MessageSquare },
];

const layoutItems = [
  { id: "single" as LayoutType, label: "1 Coluna", icon: RectangleHorizontal },
  { id: "two-columns" as LayoutType, label: "2 Colunas", icon: Columns2 },
  { id: "two-columns-asymmetric" as LayoutType, label: "2 Colunas Assimétrico", icon: Columns2 },
  { id: "three-columns" as LayoutType, label: "3 Colunas", icon: Columns3 },
];

export const CheckoutCustomizationPanel = ({
  customization,
  onChange,
  onAddComponent,
  selectedComponentId,
  onUpdateComponent,
  onDeleteComponent,
  onDeselectComponent,
  viewMode,
}: CheckoutCustomizationPanelProps) => {
  const selectedComponent = customization.components.find(c => c.id === selectedComponentId);
  const updateCustomization = (
    key: keyof CheckoutCustomization,
    value: string
  ) => {
    onChange({
      ...customization,
      [key]: value,
    });
  };

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col h-full">
      <Tabs defaultValue="components" className="flex-1 flex flex-col h-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="lines">Linhas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Componentes Tab */}
        <TabsContent value="components" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              {selectedComponent ? (
                // Editor de componente selecionado
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Editar {componentItems.find(i => i.id === selectedComponent.type)?.label}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDeselectComponent}
                    >
                      Voltar
                    </Button>
                  </div>

                  {/* Text Editor */}
                  {selectedComponent.type === "text" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Texto</Label>
                        <textarea
                          value={selectedComponent.content?.text || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, text: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground min-h-[100px]"
                          placeholder="Digite seu texto aqui"
                        />
                      </div>
                      <div>
                        <Label>Tamanho da Fonte</Label>
                        <input
                          type="number"
                          value={selectedComponent.content?.fontSize || 16}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, fontSize: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          min="10"
                          max="72"
                        />
                      </div>
                      <ColorPicker
                        label="Cor do Texto"
                        value={selectedComponent.content?.color || customization.textColor}
                        onChange={(value) => onUpdateComponent(selectedComponent.id, {
                          content: { ...selectedComponent.content, color: value }
                        })}
                      />
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => onDeleteComponent(selectedComponent.id)}
                      >
                        Excluir Componente
                      </Button>
                    </div>
                  )}

                  {/* Image Editor */}
                  {selectedComponent.type === "image" && (
                    <div className="space-y-4">
                      <div>
                        <Label>URL da Imagem</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.imageUrl || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, imageUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                      
                      <div className="relative">
                        <Separator className="my-4" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-card px-2 text-xs text-muted-foreground">OU</span>
                        </div>
                      </div>

                      <div>
                        <Label>Upload de Imagem</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const imageUrl = event.target?.result as string;
                                onUpdateComponent(selectedComponent.id, {
                                  content: { ...selectedComponent.content, imageUrl }
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                        />
                      </div>

                      {selectedComponent.content?.imageUrl && (
                        <div className="border border-border rounded p-2">
                          <img 
                            src={selectedComponent.content.imageUrl} 
                            alt="Preview" 
                            className="w-full h-auto rounded"
                          />
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => onDeleteComponent(selectedComponent.id)}
                      >
                        Excluir Componente
                      </Button>
                    </div>
                  )}

                  {/* Advantage Editor */}
                  {selectedComponent.type === "advantage" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Texto da Vantagem</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.title || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, title: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="Digite a vantagem"
                        />
                      </div>
                      <div>
                        <Label>Ícone</Label>
                        <select
                          value={selectedComponent.content?.icon || "check"}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, icon: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                        >
                          <option value="check">✓ Check</option>
                          <option value="star">★ Estrela</option>
                          <option value="heart">♥ Coração</option>
                          <option value="shield">🛡️ Escudo</option>
                        </select>
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => onDeleteComponent(selectedComponent.id)}
                      >
                        Excluir Componente
                      </Button>
                    </div>
                  )}

                  {/* Seal Editor */}
                  {selectedComponent.type === "seal" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Texto do Selo</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.sealText || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, sealText: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="GARANTIA"
                        />
                      </div>
                      <div>
                        <Label>Ícone</Label>
                        <select
                          value={selectedComponent.content?.icon || "star"}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, icon: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                        >
                          <option value="star">★ Estrela</option>
                          <option value="badge">🏆 Troféu</option>
                          <option value="certificate">📜 Certificado</option>
                          <option value="medal">🥇 Medalha</option>
                        </select>
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => onDeleteComponent(selectedComponent.id)}
                      >
                        Excluir Componente
                      </Button>
                    </div>
                  )}

                  {/* Timer Editor */}
                  {selectedComponent.type === "timer" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Minutos</Label>
                        <input
                          type="number"
                          value={selectedComponent.content?.minutes || 15}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, minutes: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          min="0"
                          max="59"
                        />
                      </div>
                      <div>
                        <Label>Segundos</Label>
                        <input
                          type="number"
                          value={selectedComponent.content?.seconds || 0}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, seconds: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          min="0"
                          max="59"
                        />
                      </div>
                      <ColorPicker
                        label="Cor do Cronômetro"
                        value={selectedComponent.content?.timerColor || customization.buttonColor}
                        onChange={(value) => onUpdateComponent(selectedComponent.id, {
                          content: { ...selectedComponent.content, timerColor: value }
                        })}
                      />
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => onDeleteComponent(selectedComponent.id)}
                      >
                        Excluir Componente
                      </Button>
                    </div>
                  )}

                  {/* Testimonial Editor */}
                  {selectedComponent.type === "testimonial" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Depoimento</Label>
                        <textarea
                          value={selectedComponent.content?.testimonialText || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, testimonialText: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground min-h-[100px]"
                          placeholder="Digite o depoimento aqui"
                        />
                      </div>
                      <div>
                        <Label>Nome do Cliente</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.authorName || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            content: { ...selectedComponent.content, authorName: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="Nome do Cliente"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => onDeleteComponent(selectedComponent.id)}
                      >
                        Excluir Componente
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Lista de componentes quando nenhum está selecionado
                <>
                  <h2 className="text-lg font-semibold mb-2 text-foreground">
                    Componentes
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Arraste componentes para personalizar seu checkout
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {componentItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Card
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("componentType", item.id);
                          }}
                          onClick={() => onAddComponent(item.id as CheckoutComponent["type"])}
                          className="p-4 flex flex-col items-center justify-center gap-2 cursor-move hover:bg-accent transition-colors h-24 active:opacity-50"
                        >
                          <Icon className="w-6 h-6 text-muted-foreground" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Linhas Tab */}
        <TabsContent value="lines" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-foreground">
                Layout
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Escolha o layout para organizar seus componentes {viewMode === "mobile" && "(Apenas layout padrão disponível no mobile)"}
              </p>
              
              <div className="space-y-3">
                {layoutItems.map((item) => {
                  const Icon = item.icon;
                  const isDisabled = viewMode === "mobile" && item.id !== "single";
                  const isSelected = customization.layout === item.id;
                  
                  return (
                    <Card
                      key={item.id}
                      onClick={() => {
                        if (!isDisabled) {
                          onChange({ ...customization, layout: item.id });
                        }
                      }}
                      className={`p-4 flex items-center gap-3 transition-all ${
                        isDisabled 
                          ? "opacity-40 cursor-not-allowed" 
                          : "cursor-pointer hover:bg-accent"
                      } ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className={`w-12 h-12 rounded flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium block">{item.label}</span>
                        {isDisabled && (
                          <span className="text-xs text-muted-foreground">Disponível apenas no desktop</span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Configurações Tab */}
        <TabsContent value="settings" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-foreground">
                  Configurações
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Personalize as cores e fonte do checkout
                </p>
              </div>

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
        </TabsContent>
      </Tabs>
    </div>
  );
};
