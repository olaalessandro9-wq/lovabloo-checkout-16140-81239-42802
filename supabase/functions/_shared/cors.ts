/**
 * Headers CORS padrão para todas as Edge Functions
 * 
 * Permite requisições de qualquer origem (*) para facilitar desenvolvimento
 * e deploy em múltiplos ambientes (localhost, preview, produção)
 */
export const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/**
 * Resposta padrão para requisições OPTIONS (preflight)
 * 
 * O navegador envia OPTIONS antes de POST/GET para verificar permissões CORS.
 * Esta função retorna 200 OK com headers CORS apropriados.
 */
export function handleCorsPreFlight(): Response {
  return new Response("ok", {
    status: 200,
    headers: corsHeaders,
  });
}
