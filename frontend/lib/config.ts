/**
 * URL base do backend Python (FastAPI) — para uso nos Route Handlers (server-side).
 * Lida em RUNTIME, portanto funciona mesmo sem ser embutida no build.
 * Configure BACKEND_URL nas variáveis de ambiente do Railway (serviço frontend).
 */
let rawBackendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8002';

if (rawBackendUrl && !rawBackendUrl.startsWith('http://') && !rawBackendUrl.startsWith('https://') && !rawBackendUrl.startsWith('//')) {
  rawBackendUrl = `https://${rawBackendUrl}`;
}
export const BACKEND_URL = rawBackendUrl;

/**
 * URL base do WebSocket — para uso em Client Components.
 * NEXT_PUBLIC_ é embutida no build, necessária para o browser.
 */
export const BACKEND_WS_URL = BACKEND_URL
  .replace(/^https:\/\//, 'wss://')
  .replace(/^http:\/\//, 'ws://');
