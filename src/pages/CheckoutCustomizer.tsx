import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Monitor, Smartphone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { CheckoutCustomizationPanel } from "@/components/checkout/CheckoutCustomizationPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const CheckoutCustomizer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutId = searchParams.get("id");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    rows: [],
  });

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number>(0);

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
        .select("*")
        .eq("id", id)
        .single();

      if (checkoutError) throw checkoutError;

      if (checkout) {
        // Load design and rows from database
        const loadedCustomization: CheckoutCustomization = {
          design: checkout.design || customization.design,
          rows: checkout.components || [],
        };
        setCustomization(loadedCustomization);
      }
    } catch (error) {
      console.error("Error loading checkout:", error);
      toast({
        title: "Erro ao carregar checkout",
        description: "Não foi possível carregar os dados do checkout.",
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
        description: "ID do checkout não encontrado.",
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", checkoutId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Checkout salvo com sucesso.",
      });
    } catch (error) {
      console.error("Error saving checkout:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = (layout: LayoutType) => {
    const newRow: CheckoutRow = {
      id: `row-${Date.now()}`,
      layout,
      columns: Array(getColumnCount(layout)).fill([]).map(() => []),
    };

    setCustomization({
      ...customization,
      rows: [...customization.rows, newRow],
    });

    setSelectedRow(newRow.id);
  };

  const getColumnCount = (layout: LayoutType): number => {
    switch (layout) {
      case "single":
        return 1;
      case "two-columns":
      case "two-columns-asymmetric":
        return 2;
      case "three-columns":
        return 3;
      default:
        return 1;
    }
  };

  const handleAddComponent = (type: CheckoutComponent["type"], rowId?: string, columnIndex?: number) => {
    const newComponent: CheckoutComponent = {
      id: `component-${Date.now()}`,
      type,
      content: getDefaultContent(type),
    };

    if (rowId && columnIndex !== undefined) {
      // Add to specific row and column
      setCustomization({
        ...customization,
        rows: customization.rows.map((row) => {
          if (row.id === rowId) {
            const newColumns = [...row.columns];
            newColumns[columnIndex] = [...newColumns[columnIndex], newComponent];
            return { ...row, columns: newColumns };
          }
          return row;
        }),
      });
    } else {
      // Add to selected row or create new single-column row
      if (selectedRow) {
        setCustomization({
          ...customization,
          rows: customization.rows.map((row) => {
            if (row.id === selectedRow) {
              const newColumns = [...row.columns];
              newColumns[selectedColumn] = [...newColumns[selectedColumn], newComponent];
              return { ...row, columns: newColumns };
            }
            return row;
          }),
        });
      } else {
        // Create new single-column row
        const newRow: CheckoutRow = {
          id: `row-${Date.now()}`,
          layout: "single",
          columns: [[newComponent]],
        };
        setCustomization({
          ...customization,
          rows: [...customization.rows, newRow],
        });
        setSelectedRow(newRow.id);
      }
    }

    setSelectedComponent(newComponent.id);
  };

  const getDefaultContent = (type: CheckoutComponent["type"]) => {
    switch (type) {
      case "text":
        return { text: "Texto editável", fontSize: 16, color: "#000000" };
      case "timer":
        return { minutes: 15, seconds: 0, timerColor: "#EF4444" };
      case "advantage":
        return { title: "Vantagem", description: "", icon: "check" };
      case "seal":
        return { sealText: "SELO", icon: "star" };
      case "testimonial":
        return { testimonialText: "Depoimento", authorName: "Nome", authorImage: "" };
      case "video":
        return { videoUrl: "", videoType: "youtube" };
      case "image":
        return { imageUrl: "" };
      default:
        return {};
    }
  };

  const handleUpdateComponent = (componentId: string, content: any) => {
    setCustomization({
      ...customization,
      rows: customization.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) =>
          column.map((comp) =>
            comp.id === componentId ? { ...comp, content } : comp
          )
        ),
      })),
    });
  };

  const handleDeleteComponent = (componentId: string) => {
    setCustomization({
      ...customization,
      rows: customization.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) =>
          column.filter((comp) => comp.id !== componentId)
        ),
      })),
    });
    setSelectedComponent(null);
  };

  const handleDeleteRow = (rowId: string) => {
    setCustomization({
      ...customization,
      rows: customization.rows.filter((row) => row.id !== rowId),
    });
    if (selectedRow === rowId) {
      setSelectedRow(null);
    }
  };

  const handleUpdateDesign = (design: Partial<CheckoutDesign>) => {
    setCustomization({
      ...customization,
      design: { ...customization.design, ...design },
    });
  };

  const getSelectedComponent = () => {
    if (!selectedComponent) return null;

    for (const row of customization.rows) {
      for (const column of row.columns) {
        const component = column.find((c) => c.id === selectedComponent);
        if (component) return component;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
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
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-muted/20">
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
          />
        </div>

        {/* Customization Panel */}
        {!isPreviewMode && (
          <CheckoutCustomizationPanel
            customization={customization}
            selectedComponent={getSelectedComponent()}
            onAddComponent={handleAddComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            onUpdateDesign={handleUpdateDesign}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            selectedRow={selectedRow}
            onSelectRow={setSelectedRow}
            rows={customization.rows}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutCustomizer;

