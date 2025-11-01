import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface PixData {
  providerPaymentId: string;
  qrText: string;
  qrBase64: string;
}

export function usePushinPay() {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);

  const createPix = async (workspaceId: string, checkoutId: string, amountCents: number) => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pushinpay-create-pix`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workspaceId, checkoutId, amountCents }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Erro ao gerar PIX");
      }

      const data = await res.json();
      setPixData({
        providerPaymentId: data.providerPaymentId,
        qrText: data.qrText,
        qrBase64: data.qrBase64,
      });

      return data;
    } catch (error: any) {
      console.error("Erro ao criar PIX:", error);
      toast.error(error.message || "Erro ao gerar código PIX");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPixData(null);
  };

  return {
    loading,
    pixData,
    createPix,
    reset,
  };
}
