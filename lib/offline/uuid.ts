import * as Crypto from 'expo-crypto';

/**
 * Genera un UUID v4 para IDs client-side (offline).
 * En el dispositivo delega en expo-crypto; si el módulo nativo no está
 * disponible (tests, edge cases), cae a un generador RFC 4122 v4.
 * No es criptográfico: solo identifica filas de la BD.
 */
export function randomUuid(): string {
  const native = Crypto.randomUUID?.();
  if (native) return native;

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida formato UUID (independiente de versión) antes de insertar al servidor. */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
