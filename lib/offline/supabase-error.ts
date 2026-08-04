/**
 * Distingue un error de red (sin conexión, DNS, timeout de fetch)
 * de un error de dominio/RLS de Supabase. El outbox y los reintentos
 * dependen de esta distinción: solo los errores de red se reintentan
 * después; los de dominio se marcan como fallidos.
 */
const NETWORK_MESSAGE_PATTERNS = [
  'failed to fetch',
  'network request failed',
  'fetch failed',
  'the network connection was lost',
  'network error',
  'load failed',
];

export function isNetworkError(error: unknown): boolean {
  if (error === null || error === undefined) return false;
  if (typeof error !== 'object' && typeof error !== 'function') return false;

  const e = error as { message?: unknown; code?: unknown; status?: unknown };

  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  for (const pattern of NETWORK_MESSAGE_PATTERNS) {
    if (message.includes(pattern)) return true;
  }

  const code = typeof e.code === 'string' ? e.code : String(e.code ?? '');
  if (code === 'NETWORK_ERROR' || code === 'ERR_NETWORK') return true;

  return e.status === 0 || e.status === -1;
}
