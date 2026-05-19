/**
 * Chama o backend FastAPI DIRETAMENTE do browser.
 * Elimina o layer de proxy Next.js (que causava 404 em produção).
 * BACKEND_URL é injetado em build-time via NEXT_PUBLIC_API_URL.
 */
let rawBackend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';
if (rawBackend && !rawBackend.startsWith('http://') && !rawBackend.startsWith('https://') && !rawBackend.startsWith('//')) {
  rawBackend = `https://${rawBackend}`;
}
export const BACKEND = rawBackend;

export const api = {
  leads:        () => fetch(`${BACKEND}/api/leads`, { cache: 'no-store' }),
  scanStart:    (query: string, city: string, target: number) =>
    fetch(`${BACKEND}/api/scan/start?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&target=${target}`, { method: 'POST' }),
  leadsClear:   () => fetch(`${BACKEND}/api/leads/clear`, { method: 'POST' }),
  usage:        () => fetch(`${BACKEND}/api/usage`, { cache: 'no-store' }),
  health:       () => fetch(`${BACKEND}/api/system/health`, { cache: 'no-store' }),
  analyzeLead:  (body: unknown) =>
    fetch(`${BACKEND}/api/analyze-lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  favorite:     (id: string, is_favorite: boolean) =>
    fetch(`${BACKEND}/api/leads/${id}/favorite`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_favorite }) }),
  interaction:  (id: string, body: unknown) =>
    fetch(`${BACKEND}/api/leads/${id}/interaction`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  leadBySlug:   (slug: string) => fetch(`${BACKEND}/api/leads/by-slug/${slug}`, { cache: 'no-store' }),
  status:       () => fetch(`${BACKEND}/api/system/health`, { cache: 'no-store' }),
  importLeads:  (leads: unknown[]) =>
    fetch(`${BACKEND}/api/leads/import`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leads }) }),
};

export const WS_URL = BACKEND
  .replace(/^https:\/\//, 'wss://')
  .replace(/^http:\/\//, 'ws://');

export function resolveLeadImageUrl(url?: string) {
  if (!url) {
    // Retorna uma foto moderna e premium de fachada de edifício do Unsplash como placeholder
    return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";
  }
  
  // Tratar URLs relativas
  if (url.startsWith('/')) {
    return `${BACKEND}${url}`;
  }
  
  // Tratar gravação legada de localhost:8002 no banco de dados quando em produção
  if (url.includes('localhost:8002') && !BACKEND.includes('localhost:8002')) {
    return url.replace(/http:\/\/localhost:8002/, BACKEND);
  }
  
  return url;
}
