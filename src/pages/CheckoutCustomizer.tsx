import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Monitor, Smartphone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { CheckoutCustomizationPanel } from "@/components/checkout/CheckoutCustomizationPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

export type ViewMode = "desktop" | "mobile";

export interface CheckoutComponent {
  id: string;
  type: "text" | "image" | "advantage" | "seal" | "timer" | "testimonial" | "video";
  content?: any;
}

export type LayoutType = "single" | "two-columns" | "two-columns-asymmetric" | "three-columns";

export interface CheckoutRow {
  id: string;
  layout: LayoutType;
  columns: CheckoutComponent[][];
}

export interface CheckoutDesign {
  theme: string;
  font: string;
  colors: {
    background: string;
    primaryText: string;
    secondaryText: string;
    accent: string;
    button: {
      background: string;
      text: string;
    };
    form?: {
      background: string;
    };
    selectedPayment?: string;
  };
  backgroundImage?: {
    url?: string;
    fixed?: boolean;
    repeat?: boolean;
  };
}

export interface CheckoutCustomization {
  design: CheckoutDesign;
  rows: CheckoutRow[];
  topComponents: CheckoutComponent[];
  bottomComponents: CheckoutComponent[];
}

const CheckoutCustomizer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutId = searchParams.get("id");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [customization, setCustomization] = useState<CheckoutCustomization>({
    design: {
      theme: "custom",
      font: "Inter",
      colors: {
        background: "#FFFFFF",
        primaryText: "#000000",
        secondaryText: "#6B7280",
        accent: "#10B981",
        button: {
          background: "#10B981",
          text: "#FFFFFF",
        },
        form: {
          background: "#F9FAFB",
        },
        selectedPayment: "#10B981",
      },
    },
    rows: [
      {
        id: `row-${Date.now()}`,
        layout: "single",
        columns: [[]],
      },
    ],
    topComponents: [],
    bottomComponents: [],
  });

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number>(0);
  const [productData, setProductData] = useState<any>(null);
  const [orderBumps, setOrderBumps] = useState<any[]>([]);

  // Load checkout data from Supabase
  useEffect(() => {
    if (checkoutId) {
      loadCheckoutData(checkoutId);
    }
  }, [checkoutId]);

  const loadCheckoutData = async (id: string) => {
    setLoading(true);
    try {
      const { data: checkout, error: checkoutError } = await supabase
        .from("checkouts")
        .select("*, products(*)")
        .eq("id", id)
        .single();

      if (checkoutError) throw checkoutError;

      if (checkout) {
        const loadedCustomization: CheckoutCustomization = {
          design: checkout.design || customization.design,
          rows: checkout.components || customization.rows,
          topComponents: checkout.top_components || [],
          bottomComponents: checkout.bottom_components || [],
        };
        setCustomization(loadedCustomization);
        setProductData(checkout.products);
      }

      // Load order bumps
      const { data: bumps, error: bumpsError } = await supabase
        .from("order_bumps")
        .select("*")
        .eq("checkout_id", id)
        .order("position");

      if (bumpsError) {
        console.error("Error loading order bumps:", bumpsError);
      } else {
        setOrderBumps(bumps || []);
      }
    } catch (error: any) {
      console.error("Error loading checkout:", error);
      toast({
        title: "Erro ao carregar checkout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!checkoutId) {
      toast({
        title: "Erro",
        description: "ID do checkout não encontrado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("checkouts")
        .update({
          design: customization.design,
          components: customization.rows,
          top_components: customization.topComponents,
          bottom_components: customization.bottomComponents,
        })
        .eq("id", checkoutId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Checkout salvo com sucesso",
      });
    } catch (error: any) {
      console.error("Error saving checkout:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const componentType = active.id as string;
    const dropZone = over.id as string;

    const newComponent: CheckoutComponent = {
      id: `component-${Date.now()}`,
      type: componentType as any,
      content: {},
    };

    setCustomization((prev) => {
      const newCustomization = { ...prev };

      if (dropZone === "top-drop-zone") {
        // Add to top components
        newCustomization.topComponents = [...prev.topComponents, newComponent];
      } else if (dropZone === "bottom-drop-zone") {
        // Add to bottom components
        newCustomization.bottomComponents = [...prev.bottomComponents, newComponent];
      } else if (dropZone.startsWith("row-")) {
        // Add to row column
        const [, rowId, columnIndex] = dropZone.split("-");
        const rowIndex = prev.rows.findIndex((r) => r.id === `row-${rowId}`);
        
        if (rowIndex !== -1) {
          const updatedRows = [...prev.rows];
          const colIndex = parseInt(columnIndex);
          updatedRows[rowIndex].columns[colIndex] = [
            ...updatedRows[rowIndex].columns[colIndex],
            newComponent,
          ];
          newCustomization.rows = updatedRows;
        }
      }

      return newCustomization;
    });

    // Auto-select the new component
    setSelectedComponent(newComponent.id);
  };

  const handleAddRow = (layout: LayoutType) => {
    const columnCount = 
      layout === "single" ? 1 :
      layout === "two-columns" ? 2 :
      layout === "two-columns-asymmetric" ? 2 :
      3;

    const newRow: CheckoutRow = {
      id: `row-${Date.now()}`,
      layout,
      columns: Array(columnCount).fill([]).map(() => []),
    };

    setCustomization((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));

    setSelectedRow(newRow.id);
  };

  const handleRemoveRow = (rowId: string) => {
    setCustomization((prev) => ({
      ...prev,
      rows: prev.rows.filter((row) => row.id !== rowId),
    }));

    if (selectedRow === rowId) {
      setSelectedRow(null);
    }
  };

  const handleUpdateComponent = (componentId: string, content: any) => {
    setCustomization((prev) => {
      const newCustomization = { ...prev };

      // Check top components
      const topIndex = prev.topComponents.findIndex((c) => c.id === componentId);
      if (topIndex !== -1) {
        newCustomization.topComponents = [...prev.topComponents];
        newCustomization.topComponents[topIndex] = {
          ...newCustomization.topComponents[topIndex],
          content,
        };
        return newCustomization;
      }

      // Check bottom components
      const bottomIndex = prev.bottomComponents.findIndex((c) => c.id === componentId);
      if (bottomIndex !== -1) {
        newCustomization.bottomComponents = [...prev.bottomComponents];
        newCustomization.bottomComponents[bottomIndex] = {
          ...newCustomization.bottomComponents[bottomIndex],
          content,
        };
        return newCustomization;
      }

      // Check rows
      const updatedRows = prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) =>
          column.map((component) =>
            component.id === componentId
              ? { ...component, content }
              : component
          )
        ),
      }));

      newCustomization.rows = updatedRows;
      return newCustomization;
    });
  };

  const handleRemoveComponent = (componentId: string) => {
    setCustomization((prev) => {
      const newCustomization = { ...prev };

      // Remove from top components
      newCustomization.topComponents = prev.topComponents.filter((c) => c.id !== componentId);

      // Remove from bottom components
      newCustomization.bottomComponents = prev.bottomComponents.filter((c) => c.id !== componentId);

      // Remove from rows
      newCustomization.rows = prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) =>
          column.filter((component) => component.id !== componentId)
        ),
      }));

      return newCustomization;
    });

    if (selectedComponent === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleUpdateDesign = (design: CheckoutDesign) => {
    setCustomization((prev) => ({
      ...prev,
      design,
    }));
  };

  const getSelectedComponentData = () => {
    if (!selectedComponent) return null;

    // Check top components
    const topComponent = customization.topComponents.find((c) => c.id === selectedComponent);
    if (topComponent) return topComponent;

    // Check bottom components
    const bottomComponent = customization.bottomComponents.find((c) => c.id === selectedComponent);
    if (bottomComponent) return bottomComponent;

    // Check rows
    for (const row of customization.rows) {
      for (const column of row.columns) {
        const component = column.find((c) => c.id === selectedComponent);
        if (component) return component;
      }
    }

    return null;
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Personalizar Checkout</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Preview Area */}
          <div className="flex-1 overflow-auto">
            <CheckoutPreview
              customization={customization}
              viewMode={viewMode}
              selectedComponentId={selectedComponent}
              onSelectComponent={setSelectedComponent}
              selectedRowId={selectedRow}
              onSelectRow={setSelectedRow}
              selectedColumn={selectedColumn}
              onSelectColumn={setSelectedColumn}
              isPreviewMode={isPreviewMode}
              productData={productData}
              orderBumps={orderBumps}
            />
          </div>

          {/* Customization Panel */}
          {!isPreviewMode && (
            <CheckoutCustomizationPanel
              customization={customization}
              selectedComponent={getSelectedComponentData()}
              onUpdateComponent={handleUpdateComponent}
              onRemoveComponent={handleRemoveComponent}
              onUpdateDesign={handleUpdateDesign}
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
              onBack={() => setSelectedComponent(null)}
              rows={customization.rows}
              selectedRowId={selectedRow}
            />
          )}
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-grabbing">
            <p className="text-sm font-medium capitalize">{activeId}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default CheckoutCustomizer;

