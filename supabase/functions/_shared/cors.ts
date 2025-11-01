/**
 * Módulo CORS com whitelist de origens e validação adequada
 * 
 * Este módulo garante que apenas origens autorizadas possam fazer
 * requisições às Edge Functions do frontend.
 */

/**
 * Lista de origens permitidas
 * Inclui domínios de produção, preview e desenvolvimento local
 */
export const ALLOWED_ORIGINS = [
  'https://risecheckout.lovable.app',           // Produção
  'https://preview--risecheckout.lovable.app',  // Preview da Lovable
  'http://localhost:5173',                      // Vite dev server
  'http://localhost:3000',                      // Alternativa local
  'http://127.0.0.1:5173',                      // Localhost alternativo
  'http://127.0.0.1:3000',                      // Localhost alternativo
];

/**
 * Verifica se uma origem é permitida
 * 
 * Valida contra a whitelist e também permite qualquer subdomínio *.lovable.app
 * para suportar previews dinâmicos da Lovable
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Verificar whitelist exata
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  
  // Permitir qualquer subdomínio *.lovable.app
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.lovable.app');
  } catch {
    return false;
  }
}

/**
 * Gera headers CORS apropriados baseados na origem da requisição
 * 
 * @param origin - Origem da requisição (header Origin)
 * @returns Headers CORS para incluir na resposta
 */
export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Vary': 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, x-client-info, apikey',
  };
  
  // Só adiciona Access-Control-Allow-Origin se a origem for permitida
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin!;
  }
  
  return headers;
}

/**
 * Trata requisições OPTIONS (preflight)
 * 
 * O navegador envia OPTIONS antes de POST/GET para verificar permissões CORS.
 * Esta função sempre retorna 200 OK com headers CORS apropriados.
 * 
 * @param request - Requisição OPTIONS
 * @returns Response 200 OK com headers CORS
 */
export function handleOptions(request: Request): Response {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(origin);
  
  // IMPORTANTE: Sempre retornar 200 no preflight
  return new Response(null, { 
    status: 200, 
    headers 
  });
}
