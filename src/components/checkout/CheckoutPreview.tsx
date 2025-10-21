import { CreditCard, User, CreditCard as CardIcon } from "lucide-react";
import { CheckoutCustomization, ViewMode } from "@/pages/CheckoutCustomizer";

interface CheckoutPreviewProps {
  customization: CheckoutCustomization;
  viewMode: ViewMode;
}

export const CheckoutPreview = ({ customization, viewMode }: CheckoutPreviewProps) => {
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
