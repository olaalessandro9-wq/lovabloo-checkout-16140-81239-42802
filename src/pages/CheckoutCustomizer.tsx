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
  components: CheckoutComponent[];
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
  components: CheckoutComponent[];
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
    components: [],
  });

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
      const { data: checkout, error: checkoutError } = await supabase
        .from("checkouts")
        .select("*")
        .eq("id", id)
        .single();

      if (checkoutError) throw checkoutError;

      // Se o checkout tem dados de design e components, carrega eles
      if (checkout.design && checkout.components) {
        setCustomization({
          design: checkout.design,
          components: checkout.components,
        });
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

  const handleAddComponent = (type: CheckoutComponent["type"]) => {
    const newComponent: CheckoutComponent = {
      id: `${type}-${Date.now()}`,
      type,
      content: {
        text: type === "text" ? "Digite seu texto aqui" : undefined,
        fontSize: type === "text" ? "16" : undefined,
        color: type === "text" ? customization.design.colors.primaryText : undefined,
        imageUrl: type === "image" ? "" : undefined,
        title: type === "advantage" ? "Vantagem" : undefined,
        icon: type === "advantage" ? "check" : type === "seal" ? "star" : undefined,
        minutes: type === "timer" ? 15 : undefined,
        seconds: type === "timer" ? 0 : undefined,
        timerColor: type === "timer" ? customization.design.colors.accent : undefined,
        testimonialText: type === "testimonial" ? "Depoimento do cliente aqui" : undefined,
        authorName: type === "testimonial" ? "Nome do Cliente" : undefined,
        sealText: type === "seal" ? "GARANTIA" : undefined,
        videoUrl: type === "video" ? "" : undefined,
        videoType: type === "video" ? "youtube" : undefined,
      },
    };
    
    setCustomization({
      ...customization,
      components: [...customization.components, newComponent],
    });
    setSelectedComponent(newComponent.id);
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<CheckoutComponent>) => {
    setCustomization({
      ...customization,
      components: customization.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      ),
    });
  };

  const handleDeleteComponent = (componentId: string) => {
    setCustomization({
      ...customization,
      components: customization.components.filter(comp => comp.id !== componentId),
    });
    if (selectedComponent === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleUpdateDesign = (updates: Partial<CheckoutDesign>) => {
    setCustomization({
      ...customization,
      design: {
        ...customization.design,
        ...updates,
        colors: {
          ...customization.design.colors,
          ...(updates.colors || {}),
        },
      },
    });
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
          components: customization.components,
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
        description: "Não foi possível salvar o checkout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            Personalizar Checkout
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
          </div>

          {/* Preview Button */}
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {isPreviewMode ? "Sair do Preview" : "Preview"}
          </Button>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <CheckoutPreview
            customization={customization}
            viewMode={viewMode}
            isPreviewMode={isPreviewMode}
            selectedComponentId={selectedComponent}
            onSelectComponent={setSelectedComponent}
          />
        </div>

        {/* Customization Panel */}
        {!isPreviewMode && (
          <CheckoutCustomizationPanel
            customization={customization}
            onAddComponent={handleAddComponent}
            selectedComponentId={selectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            onDeselectComponent={() => setSelectedComponent(null)}
            onUpdateDesign={handleUpdateDesign}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutCustomizer;

