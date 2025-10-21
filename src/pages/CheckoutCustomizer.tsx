import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Monitor, Smartphone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { CheckoutCustomizationPanel } from "@/components/checkout/CheckoutCustomizationPanel";

export type ViewMode = "desktop" | "mobile";

export interface CheckoutComponent {
  id: string;
  type: "text" | "image" | "advantage" | "seal" | "timer" | "testimonial";
  content?: any;
}

export type LayoutType = "single" | "two-columns" | "two-columns-asymmetric" | "three-columns";

export interface CheckoutRow {
  id: string;
  layout: LayoutType;
  components: CheckoutComponent[];
}

export interface CheckoutCustomization {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  formBackgroundColor: string;
  selectedPaymentColor: string;
  font: string;
  rows: CheckoutRow[];
}

const CheckoutCustomizer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutId = searchParams.get("id");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [customization, setCustomization] = useState<CheckoutCustomization>({
    primaryColor: "hsl(0, 84%, 60%)",
    secondaryColor: "hsl(216, 15%, 14%)",
    backgroundColor: "hsl(216, 18%, 10%)",
    textColor: "hsl(210, 20%, 98%)",
    buttonColor: "hsl(0, 84%, 60%)",
    buttonTextColor: "hsl(0, 0%, 100%)",
    formBackgroundColor: "hsl(216, 15%, 18%)",
    selectedPaymentColor: "hsl(142, 76%, 36%)",
    font: "Inter",
    rows: [
      {
        id: "row-1",
        layout: "single",
        components: [],
      },
    ],
  });

  const [selectedRow, setSelectedRow] = useState<string>("row-1");

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const handleAddRow = (layout: LayoutType) => {
    const newRow: CheckoutRow = {
      id: `row-${Date.now()}`,
      layout,
      components: [],
    };
    setCustomization({
      ...customization,
      rows: [...customization.rows, newRow],
    });
    setSelectedRow(newRow.id);
  };

  const handleDeleteRow = (rowId: string) => {
    const updatedRows = customization.rows.filter(row => row.id !== rowId);
    setCustomization({
      ...customization,
      rows: updatedRows.length > 0 ? updatedRows : [{
        id: "row-1",
        layout: "single",
        components: [],
      }],
    });
    if (selectedRow === rowId) {
      setSelectedRow(updatedRows[0]?.id || "row-1");
    }
  };

  const handleAddComponent = (type: CheckoutComponent["type"], rowId?: string) => {
    const targetRowId = rowId || selectedRow;
    const newComponent: CheckoutComponent = {
      id: `${type}-${Date.now()}`,
      type,
      content: {
        text: type === "text" ? "Digite seu texto aqui" : undefined,
        fontSize: type === "text" ? "16" : undefined,
        color: type === "text" ? customization.textColor : undefined,
        imageUrl: type === "image" ? "" : undefined,
        title: type === "advantage" ? "Vantagem" : undefined,
        icon: type === "advantage" ? "check" : type === "seal" ? "star" : undefined,
        minutes: type === "timer" ? 15 : undefined,
        seconds: type === "timer" ? 0 : undefined,
        timerColor: type === "timer" ? customization.buttonColor : undefined,
        testimonialText: type === "testimonial" ? "Depoimento do cliente aqui" : undefined,
        authorName: type === "testimonial" ? "Nome do Cliente" : undefined,
        sealText: type === "seal" ? "GARANTIA" : undefined,
      },
    };
    setCustomization({
      ...customization,
      rows: customization.rows.map(row =>
        row.id === targetRowId
          ? { ...row, components: [...row.components, newComponent] }
          : row
      ),
    });
    setSelectedComponent(newComponent.id);
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<CheckoutComponent>) => {
    setCustomization({
      ...customization,
      rows: customization.rows.map(row => ({
        ...row,
        components: row.components.map(comp =>
          comp.id === componentId ? { ...comp, ...updates } : comp
        ),
      })),
    });
  };

  const handleDeleteComponent = (componentId: string) => {
    setCustomization({
      ...customization,
      rows: customization.rows.map(row => ({
        ...row,
        components: row.components.filter(comp => comp.id !== componentId),
      })),
    });
    if (selectedComponent === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleSave = () => {
    // Salvar customização (será implementado com banco de dados depois)
    console.log("Saving customization:", customization);
    navigate("/produtos/editar");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/produtos/editar")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            {/* View Mode Toggle - Moved to left */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("desktop")}
                className="gap-2"
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </Button>
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("mobile")}
                className="gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </Button>
            </div>
            
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Personalizar Checkout
              </h1>
              <p className="text-sm text-muted-foreground">
                Configure as cores e aparência do seu checkout
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsPreviewMode(!isPreviewMode)} 
              variant={isPreviewMode ? "default" : "outline"}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="flex-1 overflow-auto">
          <CheckoutPreview 
            customization={customization} 
            viewMode={viewMode}
            onAddComponent={handleAddComponent}
            selectedComponentId={selectedComponent}
            onSelectComponent={setSelectedComponent}
            selectedRow={selectedRow}
            onSelectRow={setSelectedRow}
            isPreviewMode={isPreviewMode}
          />
        </div>

        {/* Customization Panel */}
        {!isPreviewMode && (
          <CheckoutCustomizationPanel
          customization={customization}
          onChange={setCustomization}
          onAddComponent={handleAddComponent}
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
          selectedComponentId={selectedComponent}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
          onDeselectComponent={() => setSelectedComponent(null)}
          viewMode={viewMode}
          selectedRow={selectedRow}
          onSelectRow={setSelectedRow}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutCustomizer;
