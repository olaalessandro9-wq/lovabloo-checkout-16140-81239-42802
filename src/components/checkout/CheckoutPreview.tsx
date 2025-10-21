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
}

const ComponentRenderer = ({ 
  component, 
  isSelected, 
  onClick,
  customization
}: { 
  component: CheckoutComponent;
  isSelected: boolean;
  onClick: () => void;
  customization: CheckoutCustomization;
}) => {
  const baseClasses = `cursor-pointer transition-all ${
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
}: { 
  row: CheckoutRow;
  customization: CheckoutCustomization;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isSelected: boolean;
  onSelectRow: (id: string) => void;
}) => {
  const { layout, components, id: rowId } = row;

  const renderColumn = (columnComponents: CheckoutComponent[]) => (
    <div 
      className="min-h-[200px] rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 flex flex-col gap-3"
      onClick={(e) => {
        e.stopPropagation();
        onSelectRow(rowId);
      }}
    >
      {columnComponents.length === 0 ? (
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
            onClick={() => onSelectComponent(component.id)}
          />
        ))
      )}
    </div>
  );

  return (
    <div 
      className={`w-full rounded-lg p-2 transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectRow(rowId);
      }}
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
                  placeholder="Nome do comprador"
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    border: `1px solid ${customization.backgroundColor}`,
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
                  placeholder="email@email.com"
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    border: `1px solid ${customization.backgroundColor}`,
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: customization.textColor }}
                >
                  CPF
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    border: `1px solid ${customization.backgroundColor}`,
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
                    className="w-14 px-3 py-2.5 rounded-xl flex items-center justify-center text-sm"
                    style={{
                      backgroundColor: customization.backgroundColor,
                      color: customization.textColor,
                    }}
                  >
                    🇧🇷
                  </div>
                  <input
                    type="tel"
                    placeholder="+55 (99) 99999-9999"
                    className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm"
                    style={{
                      backgroundColor: customization.backgroundColor,
                      color: customization.textColor,
                      border: `1px solid ${customization.backgroundColor}`,
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
                className="p-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: customization.selectedPaymentColor,
                  color: "#ffffff",
                }}
              >
                PIX
              </button>
              <button
                className="p-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }}
              >
                <CreditCard className="w-4 h-4" />
                Cartão
              </button>
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
                placeholder="Nome do comprador"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  border: `1px solid ${customization.backgroundColor}`,
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
                placeholder="email@email.com"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor,
                  border: `1px solid ${customization.backgroundColor}`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: customization.textColor }}
                >
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    border: `1px solid ${customization.backgroundColor}`,
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
                <input
                  type="tel"
                  placeholder="+55 (00) 00000-0000"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                    border: `1px solid ${customization.backgroundColor}`,
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
                className="p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: customization.selectedPaymentColor,
                  color: "#ffffff",
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                PIX
              </button>
              <button
                className="p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "#ffffff",
                  color: customization.backgroundColor,
                }}
              >
                <CreditCard className="w-5 h-5" />
                Cartão de Crédito
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div
            className="p-6 rounded-2xl sticky top-8"
            style={{ 
              backgroundColor: customization.formBackgroundColor,
            }}
          >
            <button
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 mb-6"
              style={{
                backgroundColor: customization.buttonColor,
                color: customization.buttonTextColor,
              }}
            >
              Compra segura
            </button>

            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b" style={{ borderColor: customization.backgroundColor }}>
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-xs"
                  style={{ 
                    backgroundColor: customization.backgroundColor,
                    color: customization.textColor,
                  }}
                >
                  Produto
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-bold mb-1"
                    style={{ color: customization.textColor }}
                  >
                    Nome do Produto
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: customization.textColor, opacity: 0.7 }}
                  >
                    Precisa de ajuda?
                  </p>
                  <a 
                    href="#" 
                    className="text-sm"
                    style={{ color: customization.buttonColor }}
                  >
                    Veja o contato do vendedor
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span 
                    className="font-bold text-lg"
                    style={{ color: customization.textColor }}
                  >
                    Total
                  </span>
                  <span 
                    className="font-bold text-xl"
                    style={{ color: customization.buttonColor }}
                  >
                    R$ 99,00
                  </span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: customization.textColor, opacity: 0.7 }}
                >
                  ou R$ 99,00 à vista
                </p>
                <p 
                  className="text-xs"
                  style={{ color: customization.textColor, opacity: 0.6 }}
                >
                  Renovação atual
                </p>
              </div>

              <div className="pt-4 border-t space-y-2" style={{ borderColor: customization.backgroundColor }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-8 h-8 opacity-60" style={{ color: customization.textColor }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: customization.textColor, opacity: 0.6 }}
                  >
                    Processamento seguro
                  </span>
                </div>
                <p 
                  className="text-xs text-center leading-relaxed"
                  style={{ color: customization.textColor, opacity: 0.5 }}
                >
                  Este site é protegido pelo reCAPTCHA do Google<br />
                  Política de privacidade e Termos de serviço<br />
                  Parcelamento com acréscimo<br />
                  Ao continuar, você concorda com os Termos de Compra
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
