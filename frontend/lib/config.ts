/**
 * URL base do backend Python (FastAPI).
 * Em produção, usa a variável de ambiente NEXT_PUBLIC_API_URL.
 * Em desenvolvimento local, faz fallback para http://localhost:8002.
 */
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

/**
 * URL base do WebSocket do backend.
 * Converte http -> ws e https -> wss automaticamente.
 */
export const BACKEND_WS_URL = BACKEND_URL
  .replace(/^https:\/\//, 'wss://')
  .replace(/^http:\/\//, 'ws://');
