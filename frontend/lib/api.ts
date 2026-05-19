/**
 * Chama o backend FastAPI DIRETAMENTE do browser.
 * Elimina o layer de proxy Next.js (que causava 404 em produção).
 * BACKEND_URL é injetado em build-time via NEXT_PUBLIC_API_URL.
 */
const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export const api = {
  leads:       () => fetch(`${BACKEND}/api/leads`, { cache: 'no-store' }),
  scanStart:   (query: string, city: string, target: number) =>
    fetch(`${BACKEND}/api/scan/start?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&target=${target}`, { method: 'POST' }),
  leadsClear:  () => fetch(`${BACKEND}/api/leads/clear`, { method: 'POST' }),
  usage:       () => fetch(`${BACKEND}/api/usage`, { cache: 'no-store' }),
  health:      () => fetch(`${BACKEND}/api/system/health`, { cache: 'no-store' }),
  analyzeLead: (body: unknown) =>
    fetch(`${BACKEND}/api/analyze-lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  favorite:    (id: string, is_favorite: boolean) =>
    fetch(`${BACKEND}/api/leads/${id}/favorite`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_favorite }) }),
  interaction: (id: string, body: unknown) =>
    fetch(`${BACKEND}/api/leads/${id}/interaction`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  leadBySlug:  (slug: string) => fetch(`${BACKEND}/api/leads/by-slug/${slug}`, { cache: 'no-store' }),
  status:      () => fetch(`${BACKEND}/api/system/health`, { cache: 'no-store' }),
};

export const WS_URL = BACKEND
  .replace(/^https:\/\//, 'wss://')
  .replace(/^http:\/\//, 'ws://');
