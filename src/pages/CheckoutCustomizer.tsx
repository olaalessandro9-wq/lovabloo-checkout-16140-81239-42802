import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { CheckoutCustomizationPanel } from "@/components/checkout/CheckoutCustomizationPanel";

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
}

const CheckoutCustomizer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutId = searchParams.get("id");

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
  });

  const handleSave = () => {
    // Salvar customização (será implementado com banco de dados depois)
    console.log("Saving customization:", customization);
    navigate("/produtos/editar");
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/produtos/editar")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Personalizar Checkout
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure as cores e aparência do seu checkout
                </p>
              </div>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview */}
          <div className="flex-1 p-6 overflow-auto bg-muted/20">
            <CheckoutPreview customization={customization} />
          </div>

          {/* Customization Panel */}
          <CheckoutCustomizationPanel
            customization={customization}
            onChange={setCustomization}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutCustomizer;
