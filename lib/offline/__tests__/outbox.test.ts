import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  enqueue,
  enqueueWorkout,
  getPending,
  getPendingWorkoutInsert,
  getPendingSetsForWorkout,
  getPendingSetsForExercise,
  flushPending,
  getFailed,
  dropOutbox,
  OUTBOX_KEY,
  type FlushSupabase,
  type FlushResultData,
} from '../outbox';

const userId = 'user-1';
const workoutId = '11111111-1111-4111-8111-111111111111';
const exerciseId = '22222222-2222-4222-8222-222222222222';
const setId1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const setId2 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';

function chain(terminal: {
  single?: FlushResultData;
  maybeSingle?: FlushResultData;
  awaitable?: FlushResultData;
  reject?: unknown;
}) {
  const data =
    terminal.awaitable ??
    terminal.single ??
    terminal.maybeSingle ??
    ({ data: null, error: null } as FlushResultData);
  const thenable = terminal.reject !== undefined
    ? Promise.reject(terminal.reject)
    : Promise.resolve(data);
  const c: Record<string, unknown> = {
    insert: jest.fn(() => c),
    upsert: jest.fn(() => c),
    update: jest.fn(() => c),
    delete: jest.fn(() => c),
    select: jest.fn(() => c),
    eq: jest.fn(() => c),
    limit: jest.fn(() => c),
    single: jest.fn(() => Promise.resolve(terminal.single ?? { data: null, error: null })),
    maybeSingle: jest.fn(() =>
      Promise.resolve(terminal.maybeSingle ?? { data: null, error: null }),
    ),
    then: thenable.then.bind(thenable),
  };
  return c as unknown as FlushChainMock;
}

type FlushChainMock = {
  insert: jest.Mock;
  upsert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  select: jest.Mock;
  eq: jest.Mock;
  limit: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
  then: (...args: unknown[]) => Promise<unknown>;
};

function supabaseMock() {
  const from = jest.fn<FlushChainMock, [string]>();
  const supabase = { from } as unknown as FlushSupabase;
  const queues: Record<string, { insert: unknown[][] }> = {};
  return {
    supabase,
    from,
    queueInsertCalls(table: string) {
      queues[table] ??= { insert: [] };
      return queues[table].insert;
    },
    setTable(table: string, factory: (chain: { insert: jest.Mock }) => FlushChainMock) {
      from.mockImplementation((t: string) => (t === table ? factory(chain({})) : chain({})));
    },
    setDefault(table: string, chainFor: FlushChainMock) {
      from.mockImplementation((t: string) => (t === table ? chainFor : chain({})));
    },
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('outbox — persistencia', () => {
  it('enqueue + getPending respeta orden FIFO por createdAt', async () => {
    const a = await enqueue('insert_workout', userId, { id: workoutId });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });
    const b = await enqueue('finish_workout', userId, { id: workoutId });

    const pending = await getPending();
    expect(pending).toHaveLength(3);
    expect(pending[0].kind).toBe('insert_workout');
    expect(pending[1].kind).toBe('insert_set');
    expect(pending[2].kind).toBe('finish_workout');
    expect(new Set(pending.map((e) => e.id)).size).toBe(3);
    expect(pending[0].createdAt <= pending[1].createdAt).toBe(true);
    expect(pending[1].createdAt <= pending[2].createdAt).toBe(true);
  });

  it('enqueueWorkout deduplica el insert pendiente por usuario', async () => {
    const first = await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    const second = await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    expect(second.id).toBe(first.id);
    const pending = await getPending();
    expect(pending.filter((e) => e.kind === 'insert_workout')).toHaveLength(1);
  });

  it('getPendingWorkoutInsert y getPendingSetsForWorkout filtran correctamente', async () => {
    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });
    await enqueue('insert_set', userId, {
      id: setId2, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 2,
    });

    const insert = await getPendingWorkoutInsert(userId);
    expect(insert?.payload.id).toBe(workoutId);

    const sets = await getPendingSetsForWorkout(workoutId);
    expect(sets).toHaveLength(2);
    expect(sets[0].payload.set_number).toBe(1);
  });

  it('poda entradas fallidas con más de 30 días', async () => {
    const entry = await enqueue('insert_set', userId, {
      id: 's-old', workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });
    await AsyncStorage.setItem(
      OUTBOX_KEY,
      JSON.stringify([
        { ...entry, status: 'failed', createdAt: new Date(Date.now() - 40 * 86400000).toISOString() },
      ]),
    );
    await getPending();
    const raw = await AsyncStorage.getItem(OUTBOX_KEY);
    expect(JSON.parse(raw ?? '[]')).toHaveLength(0);
  });

  it('getPendingSetsForExercise filtra por usuario (aislamiento multi-usuario)', async () => {
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });
    await enqueue('insert_set', 'user-2', {
      id: setId2, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });

    const mine = await getPendingSetsForExercise(exerciseId, userId);
    const theirs = await getPendingSetsForExercise(exerciseId, 'user-2');

    expect(mine).toHaveLength(1);
    expect(mine[0].userId).toBe(userId);
    expect(theirs).toHaveLength(1);
    expect(theirs[0].userId).toBe('user-2');
  });

  it('dropOutbox elimina todos los pendientes y fallidos', async () => {
    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });

    await dropOutbox();

    expect(await getPending()).toHaveLength(0);
    expect(await getFailed()).toHaveLength(0);
    const raw = await AsyncStorage.getItem(OUTBOX_KEY);
    expect(raw).toBeNull();
  });
});

describe('outbox — flush', () => {
  it('inserta workout y agrupa sets del mismo workout en un solo insert', async () => {
    const m = supabaseMock();
    const workoutChain = chain({
      single: { data: { id: workoutId }, error: null },
      awaitable: { data: [{ id: workoutId }], error: null },
    });
    const setInserts: unknown[][] = [];
    m.from.mockImplementation((t: string) => {
      if (t === 'workout_logs') return workoutChain;
      const ch = chain({
        awaitable: { data: [{ id: setId1 }, { id: setId2 }], error: null },
      });
      ch.upsert.mockImplementation((rows: unknown[]) => {
        setInserts.push(Array.isArray(rows) ? rows : [rows]);
        return ch;
      });
      return ch;
    });

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1, weight_kg: 20, reps: 10,
    });
    await enqueue('insert_set', userId, {
      id: setId2, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 2, weight_kg: 25, reps: 8,
    });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.synced).toBe(3);
    expect(workoutChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: workoutId, user_id: userId }),
      { onConflict: 'id', ignoreDuplicates: true },
    );
    expect(setInserts).toHaveLength(1);
    expect(setInserts[0]).toHaveLength(2);
    expect(await getPending()).toHaveLength(0);
  });

  it('aborta con error de red y conserva todo pendiente', async () => {
    const m = supabaseMock();
    const setChain = chain({ reject: new TypeError('Network request failed') });
    m.from.mockImplementation((t: string) => {
      if (t === 'set_logs') return setChain;
      return chain({
        single: { data: { id: workoutId }, error: null },
        awaitable: { data: [{ id: workoutId }], error: null },
      });
    });

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.networkAborted).toBe(true);
    expect(result.synced).toBe(1);
    expect((await getPending()).map((e) => e.kind)).toEqual(['insert_set']);
  });

  it('marca failed un error de dominio y continúa con el resto', async () => {
    const m = supabaseMock();
    const workoutChain = chain({
      reject: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    const setChain = chain({ single: { data: [{ id: setId1 }], error: null } });
    m.from.mockImplementation((t: string) => {
      if (t === 'workout_logs') return workoutChain;
      return setChain;
    });

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.failed).toBe(1);
    expect(result.synced).toBe(1);
    const failed = await getFailed();
    expect(failed).toHaveLength(1);
    expect(failed[0].status).toBe('failed');
  });

  it('cancel sin sets en servidor elimina el workout', async () => {
    const m = supabaseMock();
    const workoutChain = chain({
      single: { data: { id: workoutId }, error: null },
      awaitable: { data: [{ id: workoutId }], error: null },
    });
    const setsChain = chain({ awaitable: { data: [], error: null } });
    m.from.mockImplementation((t: string) => {
      if (t === 'workout_logs') return workoutChain;
      return setsChain;
    });

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('cancel_workout', userId, { id: workoutId });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.synced).toBe(2);
    expect(workoutChain.delete).toHaveBeenCalled();
    expect(workoutChain.update).not.toHaveBeenCalled();
    expect(await getPending()).toHaveLength(0);
  });

  it('cancel con sets en servidor finaliza en lugar de eliminar', async () => {
    const m = supabaseMock();
    const workoutChain = chain({
      single: { data: { id: workoutId }, error: null },
      awaitable: { data: [{ id: workoutId }], error: null },
    });
    const setsChain = chain({ awaitable: { data: [{ id: setId1 }], error: null } });
    m.from.mockImplementation((t: string) => {
      if (t === 'workout_logs') return workoutChain;
      return setsChain;
    });

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('cancel_workout', userId, { id: workoutId });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.synced).toBe(2);
    expect(workoutChain.delete).not.toHaveBeenCalled();
    expect(workoutChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ finished_at: expect.any(String) }),
    );
  });

  it('finish actualiza finished_at y es idempotente si el workout no existe', async () => {
    const m = supabaseMock();
    const workoutChain = chain({
      single: { data: { id: workoutId }, error: null },
      awaitable: { data: [{ id: workoutId }], error: null },
    });
    m.from.mockImplementation(() => workoutChain);

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('finish_workout', userId, { id: workoutId });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.synced).toBe(2);
    expect(workoutChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ finished_at: expect.any(String) }),
    );
    expect(await getPending()).toHaveLength(0);
  });

  it('el batch de sets es idempotente: upsert con ignoreDuplicates', async () => {
    const m = supabaseMock();
    // Respuesta vacía = todas las filas ya existían en el servidor (flush
    // anterior cuya respuesta se perdió): no debe marcar failed ni reintentar.
    const setChain = chain({ awaitable: { data: [], error: null } });
    m.from.mockImplementation((t: string) =>
      t === 'workout_logs'
        ? chain({
            single: { data: { id: workoutId }, error: null },
            awaitable: { data: [{ id: workoutId }], error: null },
          })
        : setChain,
    );

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.synced).toBe(2);
    expect(result.failed).toBe(0);
    expect(setChain.upsert).toHaveBeenCalledWith(
      expect.any(Array),
      { onConflict: 'id', ignoreDuplicates: true },
    );
    expect(await getPending()).toHaveLength(0);
  });

  it('no re-ejecuta flush si ya hay uno en curso', async () => {
    const m = supabaseMock();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const workoutChain = chain({
      single: { data: { id: workoutId }, error: null },
      awaitable: { data: [{ id: workoutId }], error: null },
    });
    workoutChain.single.mockImplementation(() =>
      gate.then(() => ({ data: { id: workoutId }, error: null })),
    );
    m.from.mockImplementation(() => workoutChain);

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });

    const first = flushPending({ supabase: m.supabase });
    await Promise.resolve();
    const second = await flushPending({ supabase: m.supabase });
    release();
    await first;

    expect(second.skipped).toBe(true);
  });

  it('reporta los prefijos de cache tocados para invalidación acotada', async () => {
    const m = supabaseMock();
    m.from.mockImplementation(() =>
      chain({
        single: { data: { id: workoutId }, error: null },
        awaitable: { data: [{ id: setId1 }], error: null },
      }),
    );

    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueue('insert_set', userId, {
      id: setId1, workout_log_id: workoutId, exercise_id: exerciseId, set_number: 1,
    });
    await enqueue('finish_workout', userId, { id: workoutId });

    const result = await flushPending({ supabase: m.supabase });

    expect(result.touched).toEqual(
      expect.arrayContaining([
        ['workout_logs'],
        ['set_logs'],
        ['workout_log_sets', workoutId],
        ['active_workout', userId],
        ['weekly-streak', userId],
        ['latest_exercise_sets'],
      ]),
    );
  });

  it('con userId solo replica las entradas de ese usuario', async () => {
    const m = supabaseMock();
    const workoutChain = chain({
      single: { data: { id: workoutId }, error: null },
      awaitable: { data: [{ id: workoutId }], error: null },
    });
    m.from.mockImplementation(() => workoutChain);

    const otherUser = 'user-2';
    await enqueueWorkout(userId, { id: workoutId, routine_id: null });
    await enqueueWorkout(otherUser, { id: workoutId, routine_id: null });

    const result = await flushPending({ supabase: m.supabase, userId });

    expect(result.synced).toBe(1);
    expect(workoutChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: workoutId, user_id: userId }),
      { onConflict: 'id', ignoreDuplicates: true },
    );
    expect(await getPending()).toHaveLength(1);
  });
});
