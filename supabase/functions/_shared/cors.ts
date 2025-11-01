/**
 * Módulo CORS simplificado com whitelist usando Set
 * 
 * Versão otimizada para performance e simplicidade
 */

/**
 * Whitelist de origens permitidas usando Set para lookup O(1)
 */
const ALLOWED_ORIGINS = new Set<string>([
  'https://risecheckout.lovable.app',          // Produção
  'https://preview--risecheckout.lovable.app', // Preview
  'http://localhost:5173',                     // Vite dev
  'http://localhost:3000',                     // Alternativa local
]);

/**
 * Gera headers CORS baseados na origem da requisição
 * 
 * @param origin - Origem da requisição (header Origin)
 * @returns Headers CORS para incluir na resposta
 */
export function corsHeaders(origin: string | null): Record<string, string> {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, x-requested-with',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

/**
 * Trata requisições OPTIONS (preflight)
 * 
 * @param req - Requisição OPTIONS
 * @returns Response 200 OK com headers CORS
 */
export function handleOptions(req: Request): Response {
  const origin = req.headers.get('origin');
  return new Response('ok', { 
    status: 200, 
    headers: corsHeaders(origin) 
  });
}

/**
 * Helper para retornar resposta JSON com CORS
 * 
 * @param req - Requisição original
 * @param body - Corpo da resposta (será convertido para JSON)
 * @param init - Opções adicionais de Response
 * @returns Response com JSON e headers CORS
 */
export function withCorsJson(
  req: Request, 
  body: unknown, 
  init?: ResponseInit
): Response {
  const origin = req.headers.get('origin');
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json', 
      ...corsHeaders(origin) 
    },
    ...init,
  });
}

/**
 * Helper para retornar erro JSON com CORS
 * 
 * @param req - Requisição original
 * @param message - Mensagem de erro
 * @param status - Código HTTP de erro (padrão: 400)
 * @returns Response com erro JSON e headers CORS
 */
export function withCorsError(
  req: Request, 
  message: string, 
  status = 400
): Response {
  const origin = req.headers.get('origin');
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 
      'Content-Type': 'application/json', 
      ...corsHeaders(origin) 
    },
  });
}
