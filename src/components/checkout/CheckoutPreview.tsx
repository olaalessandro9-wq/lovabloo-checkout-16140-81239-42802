import { CheckoutCustomization, CheckoutComponent, CheckoutRow, ViewMode } from "@/pages/CheckoutCustomizer";
import { CreditCard, User, CreditCard as CardIcon, Trash2 } from "lucide-react";

interface CheckoutPreviewProps {
  customization: CheckoutCustomization;
  viewMode: ViewMode;
  onAddComponent: (type: CheckoutComponent["type"], rowId?: string) => void;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  selectedRow: string;
  onSelectRow: (id: string) => void;
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
          className={`p-4 bg-white/5 rounded-lg border border-white/10 ${baseClasses}`}
          onClick={onClick}
        >
          <p 
            className="text-sm"
            style={{
              color: component.content?.color || "inherit",
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
          className={`p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center ${baseClasses}`}
          onClick={onClick}
          style={{ minHeight: component.content?.imageUrl ? "auto" : "128px" }}
        >
          {component.content?.imageUrl ? (
            <img 
              src={component.content.imageUrl} 
              alt="Componente" 
              className="max-w-full h-auto rounded"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Imagem - Clique para adicionar</p>
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
          className={`p-4 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3 ${baseClasses}`}
          onClick={onClick}
        >
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">{advantageIcons[advantageIcon]}</span>
          </div>
          <p className="text-sm">{component.content?.title || "Vantagem - Clique para editar"}</p>
        </div>
      );
    case "seal":
      const sealIcon = component.content?.icon || "star";
      const sealIcons: Record<string, string> = {
        star: "★",
        badge: "🏆",
        certificate: "📜",
        medal: "🥇"
      };
      return (
        <div 
          className={`p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center ${baseClasses}`}
          onClick={onClick}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">{sealIcons[sealIcon]}</span>
            <span className="text-white text-xs font-bold">
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
          className={`p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-500/30 ${baseClasses}`}
          onClick={onClick}
        >
          <div className="flex items-center justify-center gap-2">
            <span 
              className="text-lg font-bold"
              style={{ color: component.content?.timerColor }}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}:00
            </span>
          </div>
          <p className="text-xs text-center mt-1 text-muted-foreground">Oferta expira em</p>
        </div>
      );
    case "testimonial":
      return (
        <div 
          className={`p-4 bg-white/5 rounded-lg border border-white/10 ${baseClasses}`}
          onClick={onClick}
        >
          <p className="text-sm italic">"{component.content?.testimonialText || "Depoimento do cliente aqui"}"</p>
          <p className="text-xs text-muted-foreground mt-2">- {component.content?.authorName || "Nome do Cliente"}</p>
        </div>
      );
    default:
      return null;
  }
};

const RowRenderer = ({ 
  row,
  customization,
  selectedComponentId,
  onSelectComponent,
  isSelected,
  onSelectRow,
  isPreviewMode = false,
}: { 
  row: CheckoutRow;
  customization: CheckoutCustomization;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isSelected: boolean;
  onSelectRow: (id: string) => void;
  isPreviewMode?: boolean;
}) => {
  const { layout, components, id: rowId } = row;

  const renderColumn = (columnComponents: CheckoutComponent[]) => (
    <div 
      className={`rounded-lg p-4 flex flex-col gap-3 ${
        isPreviewMode 
          ? 'min-h-0' 
          : 'min-h-[200px] border-2 border-dashed border-muted-foreground/30'
      }`}
      onClick={!isPreviewMode ? (e) => {
        e.stopPropagation();
        onSelectRow(rowId);
      } : undefined}
    >
      {columnComponents.length === 0 && !isPreviewMode ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Arraste componentes aqui
        </div>
      ) : (
        columnComponents.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            customization={customization}
            isSelected={selectedComponentId === component.id}
            onClick={() => !isPreviewMode && onSelectComponent(component.id)}
            isPreviewMode={isPreviewMode}
          />
        ))
      )}
    </div>
  );

  return (
    <div 
      className={`w-full rounded-lg p-2 transition-all ${!isPreviewMode && isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={!isPreviewMode ? (e) => {
        e.stopPropagation();
        onSelectRow(rowId);
      } : undefined}
    >
      {layout === "single" && renderColumn(components)}
      
      {layout === "two-columns" && (
        <div className="grid grid-cols-2 gap-4">
          {renderColumn(components.slice(0, Math.ceil(components.length / 2)))}
          {renderColumn(components.slice(Math.ceil(components.length / 2)))}
        </div>
      )}
      
      {layout === "two-columns-asymmetric" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">{renderColumn(components.slice(0, Math.ceil(components.length / 2)))}</div>
          <div className="col-span-2">{renderColumn(components.slice(Math.ceil(components.length / 2)))}</div>
        </div>
      )}
      
      {layout === "three-columns" && (
        <div className="grid grid-cols-3 gap-4">
          {renderColumn(components.slice(0, Math.ceil(components.length / 3)))}
          {renderColumn(components.slice(Math.ceil(components.length / 3), Math.ceil(2 * components.length / 3)))}
          {renderColumn(components.slice(Math.ceil(2 * components.length / 3)))}
        </div>
      )}
    </div>
  );
};

export const CheckoutPreview = ({
  customization,
  viewMode,
  onAddComponent,
  selectedComponentId,
  onSelectComponent,
  selectedRow,
  onSelectRow,
  isPreviewMode = false,
}: CheckoutPreviewProps) => {

  if (viewMode === "mobile") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: customization.backgroundColor,
          fontFamily: customization.font,
        }}
      >
        <div className="w-full max-w-md space-y-4">
          {/* Rows Area - Mobile always uses single layout */}
          <div className="space-y-4">
            {customization.rows.map((row) => (
              <RowRenderer
                key={row.id}
                row={{
                  ...row,
                  layout: "single",
                }}
                customization={customization}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
                isSelected={selectedRow === row.id}
                onSelectRow={onSelectRow}
                isPreviewMode={isPreviewMode}
              />
            ))}
          </div>

          {/* Product Header */}
          <div
            className="p-5 rounded-2xl"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-xs flex-shrink-0"
                style={{ 
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                }}
              >
                IMG
              </div>
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base font-bold mb-1 truncate"
                  style={{ color: customization.textColor }}
                >
                  Nome do Produto
                </h3>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: customization.buttonColor }}
                >
                  1 X de R$ 5,00
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: customization.textColor, opacity: 0.6 }}
                >
                  ou R$ 5,00 à vista
                </p>
              </div>
            </div>
          </div>

          {/* Customer Data */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <h3 
              className="font-bold text-base flex items-center gap-2"
              style={{ color: customization.textColor }}
            >
              <User className="w-5 h-5" />
              Seus dados
            </h3>

            <div className="space-y-3">
              <div>
                <label 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: customization.textColor }}
                >
                  Nome completo
                </label>
                <input
                  type="text"
                  placeholder="Digite seu nome completo"
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm border"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    borderColor: customization.backgroundColor,
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: customization.textColor }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Digite seu email"
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm border"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    borderColor: customization.backgroundColor,
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: customization.textColor }}
                >
                  Celular
                </label>
                <div className="flex gap-2">
                  <div 
                    className="w-14 px-3 py-2.5 rounded-lg flex items-center justify-center text-sm border"
                    style={{
                      backgroundColor: customization.backgroundColor,
                      color: customization.textColor,
                      borderColor: customization.backgroundColor,
                    }}
                  >
                    🇧🇷
                  </div>
                  <input
                    type="tel"
                    placeholder="+55 (00) 00000-0000"
                    className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm border"
                    style={{
                      backgroundColor: customization.backgroundColor,
                      color: customization.textColor,
                      borderColor: customization.backgroundColor,
                    }}
                  />
                </div>
              </div>
            </div>

            <a 
              href="#" 
              className="text-xs inline-block"
              style={{ color: customization.buttonColor }}
            >
              Porque pedimos esse dado?
            </a>
          </div>

          {/* Payment */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <h3 
              className="font-bold text-base flex items-center gap-2"
              style={{ color: customization.textColor }}
            >
              <CardIcon className="w-5 h-5" />
              Pagamento
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="p-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  border: `2px solid ${customization.backgroundColor}`,
                }}
              >
                <span className="text-lg">⬛</span>
                PIX
              </button>
              <button
                className="p-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: customization.selectedPaymentColor,
                  color: "#ffffff",
                }}
              >
                <CreditCard className="w-4 h-4" />
                Cartão de Crédito
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <h3 
              className="font-bold text-base"
              style={{ color: customization.textColor }}
            >
              Resumo do pedido
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: customization.backgroundColor }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xs"
                    style={{ 
                      backgroundColor: customization.formBackgroundColor,
                      color: customization.textColor,
                    }}
                  >
                    IMG
                  </div>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: customization.textColor }}
                  >
                    Nome do Produto
                  </span>
                </div>
                <span 
                  className="text-sm font-bold"
                  style={{ color: customization.textColor }}
                >
                  R$ 19,90
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span style={{ color: customization.textColor, opacity: 0.7 }}>Taxa de serviço</span>
                  <span className="text-xs" style={{ color: customization.textColor, opacity: 0.5 }}>ⓘ</span>
                </div>
                <span 
                  className="font-medium"
                  style={{ color: customization.textColor }}
                >
                  R$ 0,99
                </span>
              </div>

              <div className="h-px" style={{ backgroundColor: customization.backgroundColor }} />

              <div className="flex items-center justify-between">
                <span 
                  className="text-sm font-medium"
                  style={{ color: customization.textColor }}
                >
                  Total
                </span>
                <span 
                  className="text-lg font-bold"
                  style={{ color: customization.textColor }}
                >
                  R$ 20,89
                </span>
              </div>
            </div>

            <button
              className="w-full py-3 rounded-lg font-bold text-base transition-all"
              style={{
                backgroundColor: customization.selectedPaymentColor,
                color: "#ffffff",
              }}
            >
              Pagar com PIX
            </button>

            <div className="pt-3 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl" style={{ color: customization.textColor, opacity: 0.6 }}>🔒</span>
              </div>
              <p 
                className="text-xs leading-relaxed"
                style={{ color: customization.textColor, opacity: 0.6 }}
              >
                Cakto está processando este pagamento para o vendedor <span className="font-semibold">Nome do Vendedor</span>
              </p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-medium" style={{ color: customization.selectedPaymentColor }}>✓</span>
                <span className="text-xs" style={{ color: customization.selectedPaymentColor }}>Compra 100% segura</span>
              </div>
              <p 
                className="text-xs leading-relaxed"
                style={{ color: customization.textColor, opacity: 0.5 }}
              >
                Este site é protegido pelo reCAPTCHA do Google<br />
                <a href="#" className="underline">Política de privacidade</a> e <a href="#" className="underline">Termos de serviço</a><br />
                * Parcelamento com acréscimo<br />
                Ao continuar, você concorda com os <a href="#" className="underline">Termos de Compra</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        backgroundColor: customization.backgroundColor,
        fontFamily: customization.font,
      }}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Rows Area */}
          <div className="space-y-4">
            {customization.rows.map((row) => (
              <RowRenderer
                key={row.id}
                row={row}
                customization={customization}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
                isSelected={selectedRow === row.id}
                onSelectRow={onSelectRow}
                isPreviewMode={isPreviewMode}
              />
            ))}
          </div>

          {/* Product Info */}
          <div
            className="p-6 rounded-2xl"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center text-xs"
                style={{ 
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                }}
              >
                Produto
              </div>
              <div className="flex-1">
                <h3 
                  className="text-lg font-bold mb-1"
                  style={{ color: customization.textColor }}
                >
                  Nome do Produto
                </h3>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: customization.buttonColor }}
                >
                  R$ 99,00 à vista
                </p>
              </div>
            </div>
          </div>

          {/* Customer Data Section */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <h3 
              className="font-bold text-lg flex items-center gap-2 mb-4"
              style={{ color: customization.textColor }}
            >
              <User className="w-5 h-5" />
              Seus dados
            </h3>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: customization.textColor }}
              >
                Nome completo
              </label>
              <input
                type="text"
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all border"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  borderColor: customization.backgroundColor,
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: customization.textColor }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Digite seu email"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all border"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  borderColor: customization.backgroundColor,
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: customization.textColor }}
              >
                Celular
              </label>
              <div className="flex gap-3">
                <div 
                  className="w-16 px-3 py-3 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    borderColor: customization.backgroundColor,
                  }}
                >
                  🇧🇷
                </div>
                <input
                  type="tel"
                  placeholder="+55 (00) 00000-0000"
                  className="flex-1 px-4 py-3 rounded-lg outline-none transition-all border"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    borderColor: customization.backgroundColor,
                  }}
                />
              </div>
            </div>

            <a 
              href="#" 
              className="text-sm inline-block mt-2"
              style={{ color: customization.buttonColor }}
            >
              Porque pedimos esse dado?
            </a>
          </div>

          {/* Payment Section */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <h3 
              className="font-bold text-lg flex items-center gap-2 mb-4"
              style={{ color: customization.textColor }}
            >
              <CardIcon className="w-5 h-5" />
              Pagamento
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="p-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border-2"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  borderColor: customization.backgroundColor,
                }}
              >
                <span className="text-lg">⬛</span>
                PIX
              </button>
              <button
                className="p-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: customization.selectedPaymentColor,
                  color: "#ffffff",
                }}
              >
                <CreditCard className="w-5 h-5" />
                Cartão de Crédito
              </button>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: customization.textColor }}
              >
                Número do cartão
              </label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all border"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  borderColor: customization.backgroundColor,
                }}
              />
            </div>
          </div>

          {/* Order Summary Desktop */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <h3 
              className="font-bold text-lg"
              style={{ color: customization.textColor }}
            >
              Resumo do pedido
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: customization.backgroundColor }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-xs"
                    style={{ 
                      backgroundColor: customization.formBackgroundColor,
                      color: customization.textColor,
                    }}
                  >
                    IMG
                  </div>
                  <span 
                    className="text-base font-medium"
                    style={{ color: customization.textColor }}
                  >
                    Nome do Produto
                  </span>
                </div>
                <span 
                  className="text-base font-bold"
                  style={{ color: customization.textColor }}
                >
                  R$ 19,90
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm" style={{ color: customization.textColor, opacity: 0.7 }}>Taxa de serviço</span>
                  <span className="text-xs" style={{ color: customization.textColor, opacity: 0.5 }}>ⓘ</span>
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: customization.textColor }}
                >
                  R$ 0,99
                </span>
              </div>

              <div className="h-px" style={{ backgroundColor: customization.backgroundColor }} />

              <div className="flex items-center justify-between">
                <span 
                  className="text-base font-medium"
                  style={{ color: customization.textColor }}
                >
                  Total
                </span>
                <span 
                  className="text-xl font-bold"
                  style={{ color: customization.textColor }}
                >
                  R$ 20,89
                </span>
              </div>
            </div>

            <button
              className="w-full py-4 rounded-lg font-bold text-lg transition-all"
              style={{
                backgroundColor: customization.selectedPaymentColor,
                color: "#ffffff",
              }}
            >
              Pagar com PIX
            </button>

            <div className="pt-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl" style={{ color: customization.textColor, opacity: 0.6 }}>🔒</span>
              </div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: customization.textColor, opacity: 0.6 }}
              >
                Cakto está processando este pagamento para o vendedor <span className="font-semibold">Nome do Vendedor</span>
              </p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-medium" style={{ color: customization.selectedPaymentColor }}>✓</span>
                <span className="text-sm" style={{ color: customization.selectedPaymentColor }}>Compra 100% segura</span>
              </div>
              <p 
                className="text-xs leading-relaxed"
                style={{ color: customization.textColor, opacity: 0.5 }}
              >
                Este site é protegido pelo reCAPTCHA do Google<br />
                <a href="#" className="underline">Política de privacidade</a> e <a href="#" className="underline">Termos de serviço</a><br />
                * Parcelamento com acréscimo<br />
                Ao continuar, você concorda com os <a href="#" className="underline">Termos de Compra</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Summary Sidebar */}
        <div className="space-y-6">
          <div
            className="p-6 rounded-2xl sticky top-8"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <button
              className="w-full py-3 rounded-lg font-bold text-base transition-all hover:opacity-90 mb-6"
              style={{
                backgroundColor: customization.selectedPaymentColor,
                color: "#ffffff",
              }}
            >
              Compra segura
            </button>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b" style={{ borderColor: customization.backgroundColor }}>
                <div 
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                  style={{ 
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                  }}
                >
                  IMG
                </div>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-bold mb-1 text-sm"
                    style={{ color: customization.textColor }}
                  >
                    Nome do Produto
                  </h4>
                  <p 
                    className="text-xs mb-1"
                    style={{ color: customization.textColor, opacity: 0.7 }}
                  >
                    Precisa de ajuda?
                  </p>
                  <a 
                    href="#" 
                    className="text-xs hover:underline"
                    style={{ color: customization.buttonColor }}
                  >
                    Veja o contato do vendedor
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span 
                    className="font-bold text-base"
                    style={{ color: customization.textColor }}
                  >
                    Total
                  </span>
                  <div className="text-right">
                    <div 
                      className="font-bold text-lg"
                      style={{ color: customization.selectedPaymentColor }}
                    >
                      Em até 4 X de R$ 5,77
                    </div>
                    <p 
                      className="text-xs mt-1"
                      style={{ color: customization.textColor, opacity: 0.7 }}
                    >
                      ou R$ 19,90 à vista
                    </p>
                  </div>
                </div>
                <p 
                  className="text-xs"
                  style={{ color: customization.textColor, opacity: 0.6 }}
                >
                  Renovação atual
                </p>
              </div>

              <div className="pt-4 border-t space-y-3" style={{ borderColor: customization.backgroundColor }}>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl" style={{ color: customization.textColor, opacity: 0.6 }}>🔒</span>
                </div>
                <p 
                  className="text-xs text-center leading-relaxed"
                  style={{ color: customization.textColor, opacity: 0.6 }}
                >
                  Cakto está processando este pagamento para o vendedor <span className="font-semibold">Nome do Vendedor</span>
                </p>
                <p 
                  className="text-xs text-center leading-relaxed"
                  style={{ color: customization.textColor, opacity: 0.5 }}
                >
                  Este site é protegido pelo reCAPTCHA do Google<br />
                  <a href="#" className="underline">Política de privacidade</a> e <a href="#" className="underline">Termos de serviço</a>
                </p>
                <p 
                  className="text-xs text-center"
                  style={{ color: customization.textColor, opacity: 0.5 }}
                >
                  * Parcelamento com acréscimo
                </p>
                <p 
                  className="text-xs text-center"
                  style={{ color: customization.textColor, opacity: 0.5 }}
                >
                  Ao continuar, você concorda com os <a href="#" className="underline">Termos de Compra</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
