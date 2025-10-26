import { useEffect, useRef } from 'react';

/**
 * Hook para enviar heartbeat de checkout
 * 
 * Envia ping a cada 20 segundos para o backend
 * indicando que o usuário ainda está ativo no checkout.
 * 
 * Usado para detectar checkouts abandonados.
 * 
 * @param sessionId - ID da sessão de checkout (UUID)
 * @param enabled - Se o heartbeat está ativo (default: true)
 */
export function useCheckoutHeartbeat(sessionId: string | null, enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Não iniciar se não tiver sessionId ou se desabilitado
    if (!sessionId || !enabled) {
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('[Heartbeat] VITE_SUPABASE_URL não configurado');
      return;
    }

    const heartbeatUrl = `${supabaseUrl}/functions/v1/checkout-heartbeat`;

    // Função para enviar heartbeat
    const sendHeartbeat = async () => {
      try {
        await fetch(heartbeatUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        
        console.log('[Heartbeat] Sent:', sessionId);
      } catch (error) {
        console.error('[Heartbeat] Error:', error);
        // Não quebrar o fluxo se falhar
      }
    };

    // Enviar imediatamente
    sendHeartbeat();

    // Enviar a cada 20 segundos
    intervalRef.current = setInterval(sendHeartbeat, 20000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId, enabled]);
}

