import { CheckoutCustomization, CheckoutComponent, CheckoutDesign, CheckoutRow, LayoutType } from "@/pages/CheckoutCustomizer";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Image, CheckCircle, Award, Clock, MessageSquare, Video, Columns, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CheckoutCustomizationPanelProps {
  customization: CheckoutCustomization;
  selectedComponent: CheckoutComponent | null;
  onAddComponent: (type: CheckoutComponent["type"], rowId?: string, columnIndex?: number) => void;
  onUpdateComponent: (componentId: string, content: any) => void;
  onDeleteComponent: (componentId: string) => void;
  onUpdateDesign: (design: Partial<CheckoutDesign>) => void;
  onAddRow: (layout: LayoutType) => void;
  onDeleteRow: (rowId: string) => void;
  selectedRow: string | null;
  onSelectRow: (rowId: string) => void;
  rows: CheckoutRow[];
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
  return (
    <div className="space-y-2">
      <Label className="text-sm text-foreground">{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

const componentItems = [
  { id: "text", label: "Texto", icon: Type },
  { id: "image", label: "Imagem", icon: Image },
  { id: "advantage", label: "Vantagem", icon: CheckCircle },
  { id: "seal", label: "Selo", icon: Award },
  { id: "timer", label: "Cronômetro", icon: Clock },
  { id: "testimonial", label: "Depoimento", icon: MessageSquare },
  { id: "video", label: "Vídeo", icon: Video },
];

const layoutItems = [
  { id: "single", label: "1 Coluna", columns: 1 },
  { id: "two-columns", label: "2 Colunas", columns: 2 },
  { id: "two-columns-asymmetric", label: "2 Colunas (1/3 - 2/3)", columns: 2 },
  { id: "three-columns", label: "3 Colunas", columns: 3 },
];

export const CheckoutCustomizationPanel = ({
  customization,
  selectedComponent,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
  onUpdateDesign,
  onAddRow,
  onDeleteRow,
  selectedRow,
  onSelectRow,
  rows,
}: CheckoutCustomizationPanelProps) => {
  return (
    <div className="w-96 border-l border-border bg-card flex flex-col h-full">
      <Tabs defaultValue="components" className="flex-1 flex flex-col h-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="linhas">Linhas</TabsTrigger>
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
                      onClick={() => onUpdateComponent(selectedComponent.id, null)}
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
                            ...selectedComponent.content,
                            text: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground min-h-[100px]"
                          placeholder="Digite o texto"
                        />
                      </div>
                      <div>
                        <Label>Tamanho da Fonte</Label>
                        <input
                          type="number"
                          value={selectedComponent.content?.fontSize || 16}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            fontSize: parseInt(e.target.value)
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          min="12"
                          max="48"
                        />
                      </div>
                      <ColorPicker
                        label="Cor do Texto"
                        value={selectedComponent.content?.color || "#000000"}
                        onChange={(value) => onUpdateComponent(selectedComponent.id, {
                          ...selectedComponent.content,
                          color: value
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
                            ...selectedComponent.content,
                            imageUrl: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="https://exemplo.com/imagem.jpg"
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

                  {/* Advantage Editor */}
                  {selectedComponent.type === "advantage" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Título</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.title || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            title: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="Título da vantagem"
                        />
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <textarea
                          value={selectedComponent.content?.description || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            description: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground min-h-[80px]"
                          placeholder="Descrição da vantagem"
                        />
                      </div>
                      <div>
                        <Label>Ícone</Label>
                        <select
                          value={selectedComponent.content?.icon || "check"}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            icon: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                        >
                          <option value="check">Check</option>
                          <option value="star">Estrela</option>
                          <option value="heart">Coração</option>
                          <option value="shield">Escudo</option>
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
                            ...selectedComponent.content,
                            sealText: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="Ex: GARANTIA"
                        />
                      </div>
                      <div>
                        <Label>Ícone</Label>
                        <select
                          value={selectedComponent.content?.icon || "star"}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            icon: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                        >
                          <option value="star">Estrela</option>
                          <option value="shield">Escudo</option>
                          <option value="award">Prêmio</option>
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
                            ...selectedComponent.content,
                            minutes: parseInt(e.target.value)
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          min="0"
                          max="60"
                        />
                      </div>
                      <div>
                        <Label>Segundos</Label>
                        <input
                          type="number"
                          value={selectedComponent.content?.seconds || 0}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            seconds: parseInt(e.target.value)
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          min="0"
                          max="59"
                        />
                      </div>
                      <ColorPicker
                        label="Cor do Cronômetro"
                        value={selectedComponent.content?.timerColor || "#EF4444"}
                        onChange={(value) => onUpdateComponent(selectedComponent.id, {
                          ...selectedComponent.content,
                          timerColor: value
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
                            ...selectedComponent.content,
                            testimonialText: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground min-h-[100px]"
                          placeholder="Texto do depoimento"
                        />
                      </div>
                      <div>
                        <Label>Nome do Autor</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.authorName || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            authorName: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="Nome do cliente"
                        />
                      </div>
                      <div>
                        <Label>URL da Foto do Autor</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.authorImage || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            authorImage: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="https://exemplo.com/foto.jpg"
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

                  {/* Video Editor */}
                  {selectedComponent.type === "video" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Tipo de Vídeo</Label>
                        <select
                          value={selectedComponent.content?.videoType || "youtube"}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            videoType: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="vimeo">Vimeo</option>
                          <option value="custom">URL Customizada</option>
                        </select>
                      </div>
                      <div>
                        <Label>URL do Vídeo</Label>
                        <input
                          type="text"
                          value={selectedComponent.content?.videoUrl || ""}
                          onChange={(e) => onUpdateComponent(selectedComponent.id, {
                            ...selectedComponent.content,
                            videoUrl: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                          placeholder="https://www.youtube.com/watch?v=..."
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
                    Clique para adicionar componentes ao checkout
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {componentItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Card
                          key={item.id}
                          onClick={() => onAddComponent(item.id as CheckoutComponent["type"])}
                          className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent transition-colors h-24"
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
        <TabsContent value="linhas" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-foreground">
                  Layouts de Linhas
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Adicione linhas com diferentes layouts de colunas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {layoutItems.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => onAddRow(item.id as LayoutType)}
                    className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent transition-colors h-24"
                  >
                    <Columns className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-center">{item.label}</span>
                  </Card>
                ))}
              </div>

              {rows.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-4 text-foreground">Linhas Adicionadas</h3>
                    <div className="space-y-2">
                      {rows.map((row, index) => (
                        <div
                          key={row.id}
                          className={`flex items-center justify-between p-3 rounded border ${
                            selectedRow === row.id ? "border-primary bg-accent" : "border-border"
                          }`}
                          onClick={() => onSelectRow(row.id)}
                        >
                          <span className="text-sm">
                            Linha {index + 1} - {layoutItems.find(l => l.id === row.layout)?.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRow(row.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
                  value={customization.design.font}
                  onChange={(e) => onUpdateDesign({ font: e.target.value })}
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
                  value={customization.design.colors.background}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { ...customization.design.colors, background: value } 
                  })}
                />

                <ColorPicker
                  label="Cor do Texto Principal"
                  value={customization.design.colors.primaryText}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { ...customization.design.colors, primaryText: value } 
                  })}
                />

                <ColorPicker
                  label="Cor do Texto Secundário"
                  value={customization.design.colors.secondaryText}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { ...customization.design.colors, secondaryText: value } 
                  })}
                />

                <ColorPicker
                  label="Cor de Destaque"
                  value={customization.design.colors.accent}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { ...customization.design.colors, accent: value } 
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Botões</h4>

                <ColorPicker
                  label="Cor do Botão Principal"
                  value={customization.design.colors.button.background}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { 
                      ...customization.design.colors, 
                      button: { ...customization.design.colors.button, background: value } 
                    } 
                  })}
                />

                <ColorPicker
                  label="Cor do Texto do Botão"
                  value={customization.design.colors.button.text}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { 
                      ...customization.design.colors, 
                      button: { ...customization.design.colors.button, text: value } 
                    } 
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Formulário</h4>

                <ColorPicker
                  label="Cor de Fundo dos Campos"
                  value={customization.design.colors.form?.background || "#F9FAFB"}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { 
                      ...customization.design.colors, 
                      form: { background: value } 
                    } 
                  })}
                />

                <ColorPicker
                  label="Cor do Pagamento Selecionado"
                  value={customization.design.colors.selectedPayment || customization.design.colors.accent}
                  onChange={(value) => onUpdateDesign({ 
                    colors: { ...customization.design.colors, selectedPayment: value } 
                  })}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

