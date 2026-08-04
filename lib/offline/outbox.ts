import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUuid, isUuid } from './uuid';
import { isNetworkError } from './supabase-error';

export const OUTBOX_KEY = '@gyst_outbox_v1';

/** Una entrada que se replicará a Supabase cuando vuelva la conexión. */
export interface OutboxEntry {
  id: string;
  kind: OutboxKind;
  userId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'failed';
  error?: string;
}

export type OutboxKind =
  | 'insert_workout'
  | 'insert_set'
  | 'finish_workout'
  | 'cancel_workout';

export type OutboxPayload = Record<string, unknown>;

/** Superficie mínima del cliente Supabase que el flush necesita. */
export interface FlushResultData {
  data: unknown;
  error: unknown;
}

export interface FlushChain extends PromiseLike<FlushResultData> {
  insert(values: unknown): FlushChain;
  upsert(values: unknown, opts?: { onConflict?: string; ignoreDuplicates?: boolean }): FlushChain;
  update(values: Record<string, unknown>): FlushChain;
  delete(): FlushChain;
  select(columns?: string): FlushChain;
  eq(column: string, value: unknown): FlushChain;
  limit(count: number): FlushChain;
  single(): Promise<FlushResultData>;
  maybeSingle(): Promise<FlushResultData>;
}

export interface FlushSupabase {
  from(table: string): FlushChain;
}

export interface FlushResult {
  synced: number;
  failed: number;
  networkAborted: boolean;
  skipped: boolean;
  /** Prefijos de queryKey a invalidar tras el flush (invalidación acotada). */
  touched: string[][];
}

const PRUNE_OLDER_THAN_MS = 30 * 24 * 60 * 60 * 1000;
const OUTBOX_MAX_ENTRIES = 2000;

let flushing = false;

function isPending(e: OutboxEntry): boolean {
  return e.status === 'pending';
}

function parseList(raw: string | null): OutboxEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readAll(): Promise<OutboxEntry[]> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  const now = Date.now();
  const pruned = parseList(raw).filter(
    (e) => isPending(e) || now - new Date(e.createdAt).getTime() <= PRUNE_OLDER_THAN_MS,
  );
  if (pruned.length !== parseList(raw).length) {
    await writeAll(pruned);
  }
  return pruned;
}

async function writeAll(entries: OutboxEntry[]): Promise<void> {
  const trimmed = entries.slice(-OUTBOX_MAX_ENTRIES);
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(trimmed));
}

/** Pone una entrada al final de la cola (FIFO garantizado por createdAt). */
export async function enqueue(
  kind: OutboxKind,
  userId: string,
  payload: OutboxPayload,
): Promise<OutboxEntry> {
  const entry: OutboxEntry = {
    id: randomUuid(),
    kind,
    userId,
    payload,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  const all = await readAll();
  all.push(entry);
  await writeAll(all);
  return entry;
}

/**
 * Inserta el workout pendiente del usuario si no existe ya uno.
 * Evita duplicar la sesión activa al re-entrar a la pantalla de entrenamiento offline.
 */
export async function enqueueWorkout(
  userId: string,
  payload: { id: string; routine_id: string | null },
): Promise<OutboxEntry> {
  const existing = await getPendingWorkoutInsert(userId);
  if (existing) return existing;
  return enqueue('insert_workout', userId, payload);
}

export async function getPending(): Promise<OutboxEntry[]> {
  const all = await readAll();
  return all
    .filter(isPending)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Descarta TODA la cola pendiente (outbox + fallos). Se usa al cerrar sesión:
 * los pendientes de una cuenta no deben replicarse ni mostrarse en otra.
 */
export async function dropOutbox(): Promise<void> {
  await AsyncStorage.removeItem(OUTBOX_KEY);
}

/** Entradas que fallaron por error de dominio (para diagnóstico de la UI). */
export async function getFailed(): Promise<OutboxEntry[]> {
  const all = await readAll();
  return all
    .filter((e) => e.status === 'failed')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getPendingWorkoutInsert(
  userId: string,
): Promise<OutboxEntry | undefined> {
  const pending = await getPending();
  return pending.find((e) => e.kind === 'insert_workout' && e.userId === userId);
}

export async function getPendingSetsForWorkout(
  workoutLogId: string,
  userId?: string,
): Promise<OutboxEntry[]> {
  const pending = await getPending();
  return pending
    .filter(
      (e) =>
        e.kind === 'insert_set' &&
        e.payload.workout_log_id === workoutLogId &&
        (userId ? e.userId === userId : true),
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getPendingSetsForExercise(
  exerciseId: string,
  userId?: string,
): Promise<OutboxEntry[]> {
  const pending = await getPending();
  return pending.filter(
    (e) =>
      e.kind === 'insert_set' &&
      e.payload.exercise_id === exerciseId &&
      (userId ? e.userId === userId : true),
  );
}

export async function getPendingWorkoutOps(
  workoutLogId: string,
  userId?: string,
): Promise<OutboxEntry[]> {
  const pending = await getPending();
  return pending.filter(
    (e) =>
      e.payload.id === workoutLogId &&
      e.kind !== 'insert_set' &&
      (userId ? e.userId === userId : true),
  );
}

async function markFailed(id: string, error: string): Promise<void> {
  const all = await readAll();
  const entry = all.find((e) => e.id === id);
  if (entry) {
    entry.status = 'failed';
    entry.error = error;
    await writeAll(all);
  }
}

async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const all = await readAll();
  const remaining = all.filter((e) => !ids.includes(e.id));
  await writeAll(remaining);
}

function errorMessage(error: unknown): string {
  const message = (error as { message?: unknown })?.message;
  return typeof message === 'string' ? message : String(error);
}

function workoutTouched(entry: OutboxEntry, userId: string): string[][] {
  const id = entry.payload.id as string;
  return [
    ['workout_logs'],
    ['workout_log_sets', id],
    ['active_workout', userId],
    ['latest_exercise_sets'],
  ];
}

async function insertWorkout(supabase: FlushSupabase, entry: OutboxEntry): Promise<void> {
  // Upsert idempotente (mismo criterio que insertSets): si un flush anterior
  // llegó al servidor pero su respuesta se perdió, el reintento no falla con
  // 23505 ni duplica la sesión. Sin .single(): con ignoreDuplicates, si la
  // fila ya existía el select devuelve [] y .single() fallaría con PGRST116.
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert(
      {
        id: entry.payload.id,
        user_id: entry.userId,
        routine_id: entry.payload.routine_id ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
    .select('id');
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error('No se pudo crear la sesión de entrenamiento');
}

/** Normaliza `data` de un insert/update/delete con .select() a un array. */
function toRows(data: unknown): unknown[] {
  return Array.isArray(data) ? data : [];
}

async function insertSets(supabase: FlushSupabase, entries: OutboxEntry[]): Promise<void> {
  const rows = entries.map((e) => ({
    id: e.payload.id,
    workout_log_id: e.payload.workout_log_id,
    exercise_id: e.payload.exercise_id,
    set_number: e.payload.set_number,
    weight_kg: e.payload.weight_kg,
    reps: e.payload.reps,
    rpe: e.payload.rpe ?? null,
    rir: e.payload.rir ?? null,
    is_warmup: e.payload.is_warmup ?? false,
  }));
  // Upsert con ignoreDuplicates: si un flush anterior llegó al servidor pero su
  // respuesta se perdió, el reintento no falla con 23505 (idempotencia real).
  // Sin .single(): con lote >1 postgREST respondería error; además así se
  // puede verificar que el servidor aceptó todas las filas.
  const { data, error } = await supabase
    .from('set_logs')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
    .select('id');
  if (error) throw error;
  // Con ignoreDuplicates las filas ya existentes no se devuelven: `data`
  // contiene solo las insertadas, así que no se exige length exacto.
  if (!Array.isArray(data)) {
    throw new Error('No se pudieron registrar las series');
  }
}

async function finishWorkout(supabase: FlushSupabase, entry: OutboxEntry): Promise<void> {
  const { data, error } = await supabase
    .from('workout_logs')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', entry.payload.id)
    .select('id');
  if (error) throw error;
  if (toRows(data).length === 0) {
    throw new Error('La sesión de entrenamiento no existe');
  }
}

async function cancelWorkout(supabase: FlushSupabase, entry: OutboxEntry): Promise<void> {
  const { data: sets, error: setsError } = await supabase
    .from('set_logs')
    .select('id')
    .eq('workout_log_id', entry.payload.id)
    .limit(1);
  if (setsError) throw setsError;

  if (Array.isArray(sets) && sets.length > 0) {
    const { data, error } = await supabase
      .from('workout_logs')
      .update({ finished_at: new Date().toISOString() })
      .eq('id', entry.payload.id)
      .select('id');
    if (error) throw error;
    if (toRows(data).length === 0) {
      throw new Error('La sesión de entrenamiento no existe');
    }
  } else {
    const { data, error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', entry.payload.id)
      .select('id');
    if (error) throw error;
    if (toRows(data).length === 0) {
      throw new Error('La sesión de entrenamiento no existe');
    }
  }
}

/**
 * Replica la cola pendiente a Supabase en orden FIFO.
 * - Agrupa insert_set del mismo workout en UN insert (batch).
 * - Error de red => aborta y conserva todo (se reintenta al reconectar).
 * - Error de dominio => marca la entrada como failed y continúa.
 * - Idempotente por diseño: los IDs client-side se insertan explícitamente.
 */
export async function flushPending(deps: {
  supabase: FlushSupabase;
  /** Si se indica, solo replica las entradas de este usuario (evita
   *  sincronizar pendientes de una cuenta anterior en un dispositivo compartido). */
  userId?: string;
}): Promise<FlushResult> {
  if (flushing) {
    return { synced: 0, failed: 0, networkAborted: false, skipped: true, touched: [] };
  }
  flushing = true;
  const result: FlushResult = {
    synced: 0,
    failed: 0,
    networkAborted: false,
    skipped: false,
    touched: [],
  };
  try {
    const all = await getPending();
    const pending = deps.userId
      ? all.filter((e) => e.userId === deps.userId)
      : all;
    const { supabase } = deps;
    let i = 0;

    while (i < pending.length) {
      const entry = pending[i];

      // Agrupa series consecutivas del mismo workout para el insert en lote.
      let batchEnd = i + 1;
      if (entry.kind === 'insert_set') {
        const workoutId = entry.payload.workout_log_id;
        while (
          batchEnd < pending.length &&
          pending[batchEnd].kind === 'insert_set' &&
          pending[batchEnd].payload.workout_log_id === workoutId
        ) {
          batchEnd++;
        }
      }
      const batch = pending.slice(i, batchEnd);

      // Defensa en profundidad: rechazar payloads corruptos antes de tocar
      // el servidor (IDs sin formato UUID válido).
      if (batch.some((e) => typeof e.payload.id !== 'string' || !isUuid(e.payload.id))) {
        for (const e of batch) {
          await markFailed(e.id, 'ID de fila inválido');
        }
        result.failed += batch.length;
        i += batch.length;
        continue;
      }

      try {
        switch (entry.kind) {
          case 'insert_workout':
            await insertWorkout(supabase, entry);
            result.touched.push(['workout_logs'], ['active_workout', entry.userId]);
            break;
          case 'insert_set':
            await insertSets(supabase, batch);
            result.touched.push(
              ['set_logs'],
              ['workout_log_sets', entry.payload.workout_log_id as string],
              ['latest_exercise_sets'],
            );
            break;
          case 'finish_workout':
            await finishWorkout(supabase, entry);
            result.touched.push(...workoutTouched(entry, entry.userId), [
              'weekly-streak',
              entry.userId,
            ]);
            break;
          case 'cancel_workout':
            await cancelWorkout(supabase, entry);
            result.touched.push(...workoutTouched(entry, entry.userId), [
              'weekly-streak',
              entry.userId,
            ]);
            break;
        }
      } catch (err) {
        if (isNetworkError(err)) {
          result.networkAborted = true;
          break;
        }
        for (const e of batch) {
          await markFailed(e.id, errorMessage(err));
        }
        result.failed += batch.length;
        i += batch.length;
        continue;
      }

      await remove(batch.map((e) => e.id));
      result.synced += batch.length;
      i = batchEnd;
    }

    return result;
  } finally {
    flushing = false;
  }
}
