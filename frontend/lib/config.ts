/**
 * URL base do backend Python (FastAPI) — para uso nos Route Handlers (server-side).
 * Lida em RUNTIME, portanto funciona mesmo sem ser embutida no build.
 * Configure BACKEND_URL nas variáveis de ambiente do Railway (serviço frontend).
 */
export const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8002';

/**
 * URL base do WebSocket — para uso em Client Components.
 * NEXT_PUBLIC_ é embutida no build, necessária para o browser.
 */
export const BACKEND_WS_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  'http://localhost:8002'
)
  .replace(/^https:\/\//, 'wss://')
  .replace(/^http:\/\//, 'ws://');
