/**
 * SockJS URL for STOMP (Spring registers `/ws` with SockJS).
 * Dev: same origin `http://localhost:5173/ws` → vite proxy → user-service :8081
 * Prod: set VITE_STOMP_SOCKJS_URL or derive from VITE_API_BASE_URL (gateway strips /api → …/ws)
 */
export function getSockJsHttpUrl(): string {
  const explicit = import.meta.env.VITE_STOMP_SOCKJS_URL as string | undefined;
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}/ws`;
  }
  const raw = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api') as string;
  const absoluteBase = raw.startsWith('/')
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${raw}`
    : raw;
  const base = absoluteBase.replace(/\/api\/?$/, '');
  return `${base}/ws`;
}
