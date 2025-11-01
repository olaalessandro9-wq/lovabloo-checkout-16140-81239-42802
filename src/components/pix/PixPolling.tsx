import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface PixPollingProps {
  workspaceId: string;
  providerPaymentId: string;
  onPaid: () => void;
}

export function PixPolling({ workspaceId, providerPaymentId, onPaid }: PixPollingProps) {
  useEffect(() => {
    let tries = 0;
    const maxTries = 15; // ~2 minutos (15 * 8s)

    const checkStatus = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pushinpay-get-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ workspaceId, providerPaymentId }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.status === "paid") {
            clearInterval(interval);
            onPaid();
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status do PIX:", error);
      }

      tries++;
      if (tries >= maxTries) {
        clearInterval(interval);
      }
    };

    const interval = setInterval(checkStatus, 8000);

    return () => clearInterval(interval);
  }, [workspaceId, providerPaymentId, onPaid]);

  return null;
}
