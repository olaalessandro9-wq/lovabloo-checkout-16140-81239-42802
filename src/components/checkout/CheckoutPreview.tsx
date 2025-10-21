import { CreditCard } from "lucide-react";
import { CheckoutCustomization } from "@/pages/CheckoutCustomizer";

interface CheckoutPreviewProps {
  customization: CheckoutCustomization;
}

export const CheckoutPreview = ({ customization }: CheckoutPreviewProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: customization.backgroundColor,
          fontFamily: customization.font,
        }}
      >
        {/* Product Summary */}
        <div className="p-6 border-b" style={{ borderColor: customization.formBackgroundColor }}>
          <div className="flex items-start gap-4">
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: customization.formBackgroundColor }}
            >
              <span style={{ color: customization.textColor }} className="text-sm">
                Produto
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: customization.textColor }}>
                Nome do Produto
              </h3>
              <p className="text-sm opacity-70" style={{ color: customization.textColor }}>
                1 X de R$ 99,00
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Customer Data Section */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: customization.textColor }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: customization.formBackgroundColor }}>
                ⓘ
              </span>
              Seus dados
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: customization.textColor }}>
                  Nome completo
                </label>
                <input
                  type="text"
                  placeholder="Digite seu nome completo"
                  className="w-full px-4 py-3 rounded-lg border outline-none"
                  style={{
                    backgroundColor: customization.formBackgroundColor,
                    borderColor: customization.formBackgroundColor,
                    color: customization.textColor,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: customization.textColor }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border outline-none"
                  style={{
                    backgroundColor: customization.formBackgroundColor,
                    borderColor: customization.formBackgroundColor,
                    color: customization.textColor,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: customization.textColor }}>
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: customization.formBackgroundColor,
                      borderColor: customization.formBackgroundColor,
                      color: customization.textColor,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: customization.textColor }}>
                    Celular
                  </label>
                  <input
                    type="tel"
                    placeholder="+55 (00) 00000-0000"
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: customization.formBackgroundColor,
                      borderColor: customization.formBackgroundColor,
                      color: customization.textColor,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: customization.textColor }}>
              <CreditCard className="w-5 h-5" />
              Pagamento
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                className="p-4 rounded-lg border-2 font-medium transition-all"
                style={{
                  backgroundColor: customization.selectedPaymentColor,
                  borderColor: customization.selectedPaymentColor,
                  color: "#ffffff",
                }}
              >
                PIX
              </button>
              <button
                className="p-4 rounded-lg border-2 font-medium transition-all"
                style={{
                  backgroundColor: customization.formBackgroundColor,
                  borderColor: customization.formBackgroundColor,
                  color: customization.textColor,
                }}
              >
                Cartão de Crédito
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full py-4 rounded-lg font-semibold text-lg transition-all hover:opacity-90"
            style={{
              backgroundColor: customization.buttonColor,
              color: customization.buttonTextColor,
            }}
          >
            Compra segura
          </button>

          {/* Footer Info */}
          <div className="text-center">
            <p className="text-xs opacity-60" style={{ color: customization.textColor }}>
              Seus dados estão protegidos e criptografados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
