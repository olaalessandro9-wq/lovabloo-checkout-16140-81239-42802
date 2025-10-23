import { CheckoutCustomization, CheckoutComponent, ViewMode } from "@/pages/CheckoutCustomizer";
import { useState } from "react";

interface CheckoutPreviewProps {
  customization: CheckoutCustomization;
  viewMode: ViewMode;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isPreviewMode?: boolean;
}

const ComponentRenderer = ({ 
  component, 
  isSelected, 
  onClick,
  customization,
  isPreviewMode = false,
}: { 
  component: CheckoutComponent;
  isSelected: boolean;
  onClick: () => void;
  customization: CheckoutCustomization;
  isPreviewMode?: boolean;
}) => {
  const baseClasses = isPreviewMode ? '' : `cursor-pointer transition-all ${
    isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:ring-1 hover:ring-primary/50"
  }`;

  switch (component.type) {
    case "text":
      return (
        <div 
          className={`p-4 rounded-lg ${baseClasses}`}
          onClick={onClick}
          style={{
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <p 
            style={{
              color: component.content?.color || customization.design.colors.primaryText,
              fontSize: `${component.content?.fontSize || 16}px`,
            }}
          >
            {component.content?.text || "Texto editável - Clique para editar"}
          </p>
        </div>
      );
    
    case "image":
      return (
        <div 
          className={`p-4 rounded-lg flex items-center justify-center ${baseClasses}`}
          onClick={onClick}
          style={{ 
            minHeight: component.content?.imageUrl ? "auto" : "128px",
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          {component.content?.imageUrl ? (
            <img 
              src={component.content.imageUrl} 
              alt="Componente" 
              className="max-w-full h-auto rounded"
            />
          ) : (
            <p 
              className="text-sm"
              style={{ color: customization.design.colors.secondaryText }}
            >
              Imagem - Clique para adicionar
            </p>
          )}
        </div>
      );
    
    case "advantage":
      const advantageIcon = component.content?.icon || "check";
      const advantageIcons: Record<string, string> = {
        check: "✓",
        star: "★",
        heart: "♥",
        shield: "🛡️"
      };
      return (
        <div 
          className={`p-4 rounded-lg flex items-start gap-3 ${baseClasses}`}
          onClick={onClick}
          style={{
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: customization.design.colors.accent }}
          >
            <span className="text-white text-sm">{advantageIcons[advantageIcon]}</span>
          </div>
          <div className="flex-1">
            <p 
              className="font-semibold mb-1"
              style={{ color: customization.design.colors.primaryText }}
            >
              {component.content?.title || "Vantagem"}
            </p>
            {component.content?.description && (
              <p 
                className="text-sm"
                style={{ color: customization.design.colors.secondaryText }}
              >
                {component.content.description}
              </p>
            )}
          </div>
        </div>
      );
    
    case "seal":
      const sealIcon = component.content?.icon || "star";
      const sealIcons: Record<string, string> = {
        star: "★",
        shield: "🛡️",
        award: "🏆"
      };
      return (
        <div 
          className={`p-6 rounded-lg flex items-center justify-center ${baseClasses}`}
          onClick={onClick}
          style={{
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <div 
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${customization.design.colors.accent}, ${customization.design.colors.button.background})` 
            }}
          >
            <span className="text-3xl mb-1">{sealIcons[sealIcon]}</span>
            <span className="text-white text-xs font-bold text-center px-2">
              {component.content?.sealText || "SELO"}
            </span>
          </div>
        </div>
      );
    
    case "timer":
      const minutes = component.content?.minutes || 15;
      const seconds = component.content?.seconds || 0;
      return (
        <div 
          className={`p-4 rounded-lg ${baseClasses}`}
          onClick={onClick}
          style={{ 
            backgroundColor: component.content?.timerColor || customization.design.colors.accent,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}:00
            </span>
          </div>
          <p className="text-sm text-center mt-1 text-white/90">Oferta expira em</p>
        </div>
      );
    
    case "testimonial":
      return (
        <div 
          className={`p-6 rounded-lg ${baseClasses}`}
          onClick={onClick}
          style={{
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <div className="flex gap-4">
            {component.content?.authorImage && (
              <img 
                src={component.content.authorImage} 
                alt={component.content.authorName} 
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <p 
                className="italic mb-2"
                style={{ color: customization.design.colors.primaryText }}
              >
                "{component.content?.testimonialText || "Depoimento do cliente aqui"}"
              </p>
              <p 
                className="text-sm font-semibold"
                style={{ color: customization.design.colors.secondaryText }}
              >
                - {component.content?.authorName || "Nome do Cliente"}
              </p>
            </div>
          </div>
        </div>
      );
    
    case "video":
      const getEmbedUrl = (url: string, type: string) => {
        if (!url) return "";
        
        if (type === "youtube") {
          const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
          return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
        } else if (type === "vimeo") {
          const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
          return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
        }
        return url;
      };

      const embedUrl = getEmbedUrl(
        component.content?.videoUrl || "", 
        component.content?.videoType || "youtube"
      );

      return (
        <div 
          className={`p-4 rounded-lg ${baseClasses}`}
          onClick={onClick}
          style={{
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          {embedUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                className="w-full h-full rounded"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex items-center justify-center border-2 border-dashed rounded"
              style={{ borderColor: customization.design.colors.secondaryText }}
            >
              <p 
                className="text-sm"
                style={{ color: customization.design.colors.secondaryText }}
              >
                Vídeo - Clique para configurar
              </p>
            </div>
          )}
        </div>
      );
    
    default:
      return null;
  }
};

export const CheckoutPreview = ({
  customization,
  viewMode,
  selectedComponentId,
  onSelectComponent,
  isPreviewMode = false,
}: CheckoutPreviewProps) => {
  const [selectedPayment, setSelectedPayment] = useState<"pix" | "card">("pix");

  const maxWidth = viewMode === "mobile" ? "max-w-md" : "max-w-2xl";

  return (
    <div 
      className="min-h-screen flex items-start justify-center p-6"
      style={{
        backgroundColor: customization.design.colors.background,
        fontFamily: customization.design.font,
      }}
    >
      <div className={`w-full ${maxWidth} space-y-4`}>
        {/* Custom Components Area */}
        {customization.components.length > 0 && (
          <div className="space-y-4">
            {customization.components.map((component) => (
              <ComponentRenderer
                key={component.id}
                component={component}
                customization={customization}
                isSelected={selectedComponentId === component.id}
                onClick={() => !isPreviewMode && onSelectComponent(component.id)}
                isPreviewMode={isPreviewMode}
              />
            ))}
          </div>
        )}

        {/* Product Header */}
        <div
          className="p-6 rounded-2xl"
          style={{ 
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{ 
                backgroundColor: customization.design.colors.background,
                color: customization.design.colors.secondaryText,
              }}
            >
              IMG
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-bold mb-2"
                style={{ color: customization.design.colors.primaryText }}
              >
                Nome do Produto
              </h3>
              <p 
                className="text-xl font-bold"
                style={{ color: customization.design.colors.accent }}
              >
                1 X de R$ 99,00
              </p>
              <p 
                className="text-sm mt-1"
                style={{ color: customization.design.colors.secondaryText }}
              >
                ou R$ 99,00 à vista
              </p>
            </div>
          </div>
        </div>

        {/* Customer Data Form */}
        <div
          className="p-6 rounded-2xl space-y-4"
          style={{ 
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <h4 
            className="font-semibold flex items-center gap-2"
            style={{ color: customization.design.colors.primaryText }}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ 
                backgroundColor: customization.design.colors.accent,
                color: "#FFFFFF",
              }}
            >
              1
            </span>
            Seus dados
          </h4>
          
          <div className="space-y-3">
            <div>
              <label 
                className="text-sm mb-1 block"
                style={{ color: customization.design.colors.secondaryText }}
              >
                Nome completo
              </label>
              <input
                type="text"
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: customization.design.colors.background,
                  borderColor: customization.design.colors.secondaryText + "40",
                  color: customization.design.colors.primaryText,
                }}
              />
            </div>
            
            <div>
              <label 
                className="text-sm mb-1 block"
                style={{ color: customization.design.colors.secondaryText }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Digite seu email"
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: customization.design.colors.background,
                  borderColor: customization.design.colors.secondaryText + "40",
                  color: customization.design.colors.primaryText,
                }}
              />
            </div>

            <div>
              <label 
                className="text-sm mb-1 block"
                style={{ color: customization.design.colors.secondaryText }}
              >
                Celular
              </label>
              <input
                type="tel"
                placeholder="+55 (00) 00000-0000"
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: customization.design.colors.background,
                  borderColor: customization.design.colors.secondaryText + "40",
                  color: customization.design.colors.primaryText,
                }}
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div
          className="p-6 rounded-2xl space-y-4"
          style={{ 
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <h4 
            className="font-semibold flex items-center gap-2"
            style={{ color: customization.design.colors.primaryText }}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ 
                backgroundColor: customization.design.colors.accent,
                color: "#FFFFFF",
              }}
            >
              2
            </span>
            Pagamento
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPayment("pix")}
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                borderColor: selectedPayment === "pix" 
                  ? customization.design.colors.selectedPayment || customization.design.colors.accent
                  : customization.design.colors.secondaryText + "40",
                backgroundColor: selectedPayment === "pix"
                  ? (customization.design.colors.selectedPayment || customization.design.colors.accent) + "10"
                  : customization.design.colors.background,
                color: customization.design.colors.primaryText,
              }}
            >
              <div className="text-2xl mb-1">💳</div>
              <div className="text-sm font-semibold">PIX</div>
            </button>

            <button
              onClick={() => setSelectedPayment("card")}
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                borderColor: selectedPayment === "card" 
                  ? customization.design.colors.selectedPayment || customization.design.colors.accent
                  : customization.design.colors.secondaryText + "40",
                backgroundColor: selectedPayment === "card"
                  ? (customization.design.colors.selectedPayment || customization.design.colors.accent) + "10"
                  : customization.design.colors.background,
                color: customization.design.colors.primaryText,
              }}
            >
              <div className="text-2xl mb-1">💳</div>
              <div className="text-sm font-semibold">Cartão</div>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div
          className="p-6 rounded-2xl"
          style={{ 
            backgroundColor: customization.design.colors.form?.background || "#F9FAFB",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <span 
              className="font-semibold"
              style={{ color: customization.design.colors.primaryText }}
            >
              Total
            </span>
            <span 
              className="text-2xl font-bold"
              style={{ color: customization.design.colors.accent }}
            >
              R$ 99,00
            </span>
          </div>

          <button
            className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
            style={{
              backgroundColor: customization.design.colors.button.background,
              color: customization.design.colors.button.text,
            }}
          >
            Compra segura
          </button>

          <p 
            className="text-xs text-center mt-4"
            style={{ color: customization.design.colors.secondaryText }}
          >
            🔒 Pagamento 100% seguro
          </p>
        </div>
      </div>
    </div>
  );
};

