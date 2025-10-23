import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckoutComponent, CheckoutDesign, CheckoutRow, LayoutType } from "@/pages/CheckoutCustomizer";
import { ArrowLeft, Trash2, Columns, Columns2, Columns3, LayoutGrid } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

interface CheckoutCustomizationPanelProps {
  customization: any;
  selectedComponent: CheckoutComponent | null;
  onUpdateComponent: (componentId: string, content: any) => void;
  onRemoveComponent: (componentId: string) => void;
  onUpdateDesign: (design: CheckoutDesign) => void;
  onAddRow: (layout: LayoutType) => void;
  onRemoveRow: (rowId: string) => void;
  onBack: () => void;
  rows: CheckoutRow[];
  selectedRowId: string | null;
}

const DraggableComponent = ({ type, icon, label }: { type: string; icon: React.ReactNode; label: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: type,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:border-primary hover:bg-primary/5"
      }`}
    >
      {icon}
      <span className="text-sm mt-2">{label}</span>
    </div>
  );
};

export const CheckoutCustomizationPanel = ({
  customization,
  selectedComponent,
  onUpdateComponent,
  onRemoveComponent,
  onUpdateDesign,
  onAddRow,
  onRemoveRow,
  onBack,
  rows,
  selectedRowId,
}: CheckoutCustomizationPanelProps) => {
  const [activeTab, setActiveTab] = useState("components");

  if (selectedComponent) {
    return (
      <div className="w-96 border-l bg-card p-6 overflow-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold capitalize">Editar {selectedComponent.type}</h3>
        </div>

        <div className="space-y-4">
          {selectedComponent.type === "text" && (
            <>
              <div>
                <Label>Texto</Label>
                <Input
                  value={selectedComponent.content?.text || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      text: e.target.value,
                    })
                  }
                  placeholder="Digite o texto"
                />
              </div>
              <div>
                <Label>Tamanho da Fonte</Label>
                <Input
                  type="number"
                  value={selectedComponent.content?.fontSize || 16}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      fontSize: parseInt(e.target.value),
                    })
                  }
                  min={12}
                  max={48}
                />
              </div>
              <div>
                <Label>Cor</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedComponent.content?.color || "#000000"}
                    onChange={(e) =>
                      onUpdateComponent(selectedComponent.id, {
                        ...selectedComponent.content,
                        color: e.target.value,
                      })
                    }
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={selectedComponent.content?.color || "#000000"}
                    onChange={(e) =>
                      onUpdateComponent(selectedComponent.id, {
                        ...selectedComponent.content,
                        color: e.target.value,
                      })
                    }
                    placeholder="#000000"
                  />
                </div>
              </div>
            </>
          )}

          {selectedComponent.type === "image" && (
            <div>
              <Label>URL da Imagem</Label>
              <Input
                value={selectedComponent.content?.imageUrl || ""}
                onChange={(e) =>
                  onUpdateComponent(selectedComponent.id, {
                    ...selectedComponent.content,
                    imageUrl: e.target.value,
                  })
                }
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          )}

          {selectedComponent.type === "advantage" && (
            <>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={selectedComponent.content?.icon || "check"}
                  onValueChange={(value) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      icon: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check">✓ Check</SelectItem>
                    <SelectItem value="star">★ Estrela</SelectItem>
                    <SelectItem value="heart">♥ Coração</SelectItem>
                    <SelectItem value="shield">🛡️ Escudo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título</Label>
                <Input
                  value={selectedComponent.content?.title || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      title: e.target.value,
                    })
                  }
                  placeholder="Título da vantagem"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={selectedComponent.content?.description || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descrição da vantagem"
                />
              </div>
            </>
          )}

          {selectedComponent.type === "seal" && (
            <>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={selectedComponent.content?.icon || "star"}
                  onValueChange={(value) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      icon: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="star">★ Estrela</SelectItem>
                    <SelectItem value="shield">🛡️ Escudo</SelectItem>
                    <SelectItem value="award">🏆 Prêmio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Texto do Selo</Label>
                <Input
                  value={selectedComponent.content?.sealText || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      sealText: e.target.value,
                    })
                  }
                  placeholder="SELO"
                />
              </div>
            </>
          )}

          {selectedComponent.type === "timer" && (
            <>
              <div>
                <Label>Minutos</Label>
                <Input
                  type="number"
                  value={selectedComponent.content?.minutes || 15}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      minutes: parseInt(e.target.value),
                    })
                  }
                  min={0}
                  max={59}
                />
              </div>
              <div>
                <Label>Segundos</Label>
                <Input
                  type="number"
                  value={selectedComponent.content?.seconds || 0}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      seconds: parseInt(e.target.value),
                    })
                  }
                  min={0}
                  max={59}
                />
              </div>
              <div>
                <Label>Cor do Cronômetro</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedComponent.content?.timerColor || "#10B981"}
                    onChange={(e) =>
                      onUpdateComponent(selectedComponent.id, {
                        ...selectedComponent.content,
                        timerColor: e.target.value,
                      })
                    }
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={selectedComponent.content?.timerColor || "#10B981"}
                    onChange={(e) =>
                      onUpdateComponent(selectedComponent.id, {
                        ...selectedComponent.content,
                        timerColor: e.target.value,
                      })
                    }
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </>
          )}

          {selectedComponent.type === "testimonial" && (
            <>
              <div>
                <Label>Texto do Depoimento</Label>
                <Input
                  value={selectedComponent.content?.testimonialText || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      testimonialText: e.target.value,
                    })
                  }
                  placeholder="Depoimento do cliente"
                />
              </div>
              <div>
                <Label>Nome do Autor</Label>
                <Input
                  value={selectedComponent.content?.authorName || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      authorName: e.target.value,
                    })
                  }
                  placeholder="Nome do Cliente"
                />
              </div>
              <div>
                <Label>Foto do Autor (URL)</Label>
                <Input
                  value={selectedComponent.content?.authorImage || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      authorImage: e.target.value,
                    })
                  }
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
            </>
          )}

          {selectedComponent.type === "video" && (
            <>
              <div>
                <Label>Tipo de Vídeo</Label>
                <Select
                  value={selectedComponent.content?.videoType || "youtube"}
                  onValueChange={(value) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      videoType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="custom">URL Customizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL do Vídeo</Label>
                <Input
                  value={selectedComponent.content?.videoUrl || ""}
                  onChange={(e) =>
                    onUpdateComponent(selectedComponent.id, {
                      ...selectedComponent.content,
                      videoUrl: e.target.value,
                    })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </>
          )}

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onRemoveComponent(selectedComponent.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Componente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-l bg-card overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="rows">Linhas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-4">Componentes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Arraste os componentes para o checkout
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DraggableComponent type="text" icon={<span className="text-2xl">T</span>} label="Texto" />
            <DraggableComponent type="image" icon={<span className="text-2xl">🖼️</span>} label="Imagem" />
            <DraggableComponent type="advantage" icon={<span className="text-2xl">✓</span>} label="Vantagem" />
            <DraggableComponent type="seal" icon={<span className="text-2xl">🏅</span>} label="Selo" />
            <DraggableComponent type="timer" icon={<span className="text-2xl">⏱️</span>} label="Cronômetro" />
            <DraggableComponent type="testimonial" icon={<span className="text-2xl">💬</span>} label="Depoimento" />
            <DraggableComponent type="video" icon={<span className="text-2xl">🎥</span>} label="Vídeo" />
          </div>
        </TabsContent>

        <TabsContent value="rows" className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-4">Layouts de Linhas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione linhas com diferentes layouts
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onAddRow("single")}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Columns className="h-8 w-8 mb-2" />
              <span className="text-sm">1 Coluna</span>
            </button>

            <button
              onClick={() => onAddRow("two-columns")}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Columns2 className="h-8 w-8 mb-2" />
              <span className="text-sm">2 Colunas</span>
            </button>

            <button
              onClick={() => onAddRow("two-columns-asymmetric")}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            >
              <LayoutGrid className="h-8 w-8 mb-2" />
              <span className="text-sm">2 Colunas (33/66)</span>
            </button>

            <button
              onClick={() => onAddRow("three-columns")}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Columns3 className="h-8 w-8 mb-2" />
              <span className="text-sm">3 Colunas</span>
            </button>
          </div>

          {rows.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Linhas Adicionadas</h4>
              <div className="space-y-2">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedRowId === row.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <span className="text-sm capitalize">
                      {row.layout === "single" && "1 Coluna"}
                      {row.layout === "two-columns" && "2 Colunas"}
                      {row.layout === "two-columns-asymmetric" && "2 Colunas (33/66)"}
                      {row.layout === "three-columns" && "3 Colunas"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRow(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Configurações de Design</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Fonte</Label>
              <Select
                value={customization.design.font}
                onValueChange={(value) =>
                  onUpdateDesign({
                    ...customization.design,
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
                </SelectContent>
              </Select>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Cores Principais</h4>
              <div className="space-y-3">
                <div>
                  <Label>Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.design.colors.background}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            background: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.design.colors.background}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            background: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor do Texto Principal</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.design.colors.primaryText}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            primaryText: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.design.colors.primaryText}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            primaryText: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor do Texto Secundário</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.design.colors.secondaryText}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            secondaryText: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.design.colors.secondaryText}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            secondaryText: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.design.colors.accent}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            accent: e.target.value,
                          },
                        })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.design.colors.accent}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            accent: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Botões</h4>
              <div className="space-y-3">
                <div>
                  <Label>Cor do Botão Principal</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.design.colors.button.background}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            button: {
                              ...customization.design.colors.button,
                              background: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.design.colors.button.background}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            button: {
                              ...customization.design.colors.button,
                              background: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor do Texto do Botão</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.design.colors.button.text}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            button: {
                              ...customization.design.colors.button,
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.design.colors.button.text}
                      onChange={(e) =>
                        onUpdateDesign({
                          ...customization.design,
                          colors: {
                            ...customization.design.colors,
                            button: {
                              ...customization.design.colors.button,
                              text: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

