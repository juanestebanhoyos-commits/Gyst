import type { OutboxEntry } from './outbox';
import type { SetLog } from '@/types/supabase';

/**
 * Fusiona los set_logs del servidor con los pendientes del outbox
 * para lecturas offline. Dedup por id: si una serie ya existe en el
 * servidor (flush parcial), no se duplica.
 * Devuelve la misma referencia si no hay cambios (sin re-renders extra).
 */
export function mergePendingSetLogs<T extends SetLog>(
  server: T[],
  pending: OutboxEntry[],
): T[] {
  if (pending.length === 0) return server;

  const byId = new Map<string, T>(server.map((s) => [s.id, s] as const));
  let changed = false;

  for (const entry of pending) {
    const id = entry.payload.id as string;
    if (byId.has(id)) continue;
    byId.set(id, {
      id,
      workout_log_id: entry.payload.workout_log_id as string,
      exercise_id: entry.payload.exercise_id as string,
      set_number: entry.payload.set_number as number,
      weight_kg: entry.payload.weight_kg as number,
      reps: entry.payload.reps as number,
      rpe: (entry.payload.rpe as number | null | undefined) ?? null,
      rir: (entry.payload.rir as number | null | undefined) ?? null,
      is_warmup: (entry.payload.is_warmup as boolean | undefined) ?? false,
      created_at: entry.createdAt,
    } as T);
    changed = true;
  }

  return changed ? Array.from(byId.values()) : server;
}
