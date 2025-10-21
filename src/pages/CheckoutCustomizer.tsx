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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  // Load checkout data from Supabase
  useEffect(() => {
    if (checkoutId) {
      loadCheckoutData(checkoutId);
    }
  }, [checkoutId]);

  const loadCheckoutData = async (id: string) => {
    setLoading(true);
    try {
      // Load checkout configuration
      const { data: checkout, error: checkoutError } = await supabase
        .from("checkouts")
        .select("*")
        .eq("id", id)
        .single();

      if (checkoutError) throw checkoutError;

      // Load checkout rows
      const { data: rows, error: rowsError } = await supabase
        .from("checkout_rows")
        .select("*")
        .eq("checkout_id", id)
        .order("row_order");

      if (rowsError) throw rowsError;

      // Load components for all rows
      const rowIds = rows.map(r => r.id);
      const { data: components, error: componentsError } = await supabase
        .from("checkout_components")
        .select("*")
        .in("row_id", rowIds)
        .order("component_order");

      if (componentsError) throw componentsError;

      // Reconstruct customization state
      const loadedRows = rows.map(row => ({
        id: row.id,
        layout: row.layout as LayoutType,
        components: components
          .filter(c => c.row_id === row.id)
          .map(c => ({
            id: c.id,
            type: c.type as CheckoutComponent["type"],
            content: c.content,
          })),
      }));

      setCustomization({
        primaryColor: checkout.primary_color,
        secondaryColor: checkout.secondary_color,
        backgroundColor: checkout.background_color,
        textColor: checkout.text_color,
        buttonColor: checkout.button_color,
        buttonTextColor: checkout.button_text_color,
        formBackgroundColor: checkout.form_background_color,
        selectedPaymentColor: checkout.selected_payment_color,
        font: checkout.font,
        rows: loadedRows,
      });

      if (loadedRows.length > 0) {
        setSelectedRow(loadedRows[0].id);
      }
    } catch (error) {
      console.error("Error loading checkout:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as configurações do checkout.",
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

  const handleSave = async () => {
    setLoading(true);
    try {
      if (checkoutId) {
        // Update existing checkout
        await updateCheckout(checkoutId);
      } else {
        // Create new checkout
        await createCheckout();
      }

      toast({
        title: "Sucesso!",
        description: "Checkout salvo com sucesso.",
      });
      
      navigate("/produtos/editar");
    } catch (error) {
      console.error("Error saving checkout:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o checkout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    // Create checkout record
    const { data: checkout, error: checkoutError } = await supabase
      .from("checkouts")
      .insert({
        name: "Novo Checkout",
        primary_color: customization.primaryColor,
        secondary_color: customization.secondaryColor,
        background_color: customization.backgroundColor,
        text_color: customization.textColor,
        button_color: customization.buttonColor,
        button_text_color: customization.buttonTextColor,
        form_background_color: customization.formBackgroundColor,
        selected_payment_color: customization.selectedPaymentColor,
        font: customization.font,
      })
      .select()
      .single();

    if (checkoutError) throw checkoutError;

    // Create rows and components
    await saveRowsAndComponents(checkout.id);
  };

  const updateCheckout = async (id: string) => {
    // Update checkout record
    const { error: checkoutError } = await supabase
      .from("checkouts")
      .update({
        primary_color: customization.primaryColor,
        secondary_color: customization.secondaryColor,
        background_color: customization.backgroundColor,
        text_color: customization.textColor,
        button_color: customization.buttonColor,
        button_text_color: customization.buttonTextColor,
        form_background_color: customization.formBackgroundColor,
        selected_payment_color: customization.selectedPaymentColor,
        font: customization.font,
      })
      .eq("id", id);

    if (checkoutError) throw checkoutError;

    // Delete existing rows and components (cascade will handle components)
    await supabase.from("checkout_rows").delete().eq("checkout_id", id);

    // Create new rows and components
    await saveRowsAndComponents(id);
  };

  const saveRowsAndComponents = async (checkoutId: string) => {
    for (let i = 0; i < customization.rows.length; i++) {
      const row = customization.rows[i];

      // Insert row
      const { data: rowData, error: rowError } = await supabase
        .from("checkout_rows")
        .insert({
          checkout_id: checkoutId,
          row_order: i,
          layout: row.layout,
        })
        .select()
        .single();

      if (rowError) throw rowError;

      // Insert components
      for (let j = 0; j < row.components.length; j++) {
        const component = row.components[j];

        const { error: componentError } = await supabase
          .from("checkout_components")
          .insert({
            row_id: rowData.id,
            component_order: j,
            type: component.type,
            content: component.content,
          });

        if (componentError) throw componentError;
      }
    }
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
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
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
