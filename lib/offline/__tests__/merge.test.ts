import { mergePendingSetLogs } from '../merge';
import type { OutboxEntry } from '../outbox';
import type { SetLog } from '@/types/supabase';

const serverSet: SetLog = {
  id: 'server-1',
  workout_log_id: 'w-1',
  exercise_id: 'e-1',
  set_number: 1,
  weight_kg: 20,
  reps: 10,
  rpe: null,
  rir: null,
  is_warmup: false,
  created_at: '2026-08-01T10:00:00.000Z',
};

function pendingSet(id: string, setNumber: number): OutboxEntry {
  return {
    id,
    kind: 'insert_set',
    userId: 'user-1',
    payload: {
      id,
      workout_log_id: 'w-1',
      exercise_id: 'e-1',
      set_number: setNumber,
      weight_kg: 25,
      reps: 8,
      rpe: null,
      rir: 2,
      is_warmup: false,
    },
    createdAt: '2026-08-02T10:00:00.000Z',
    status: 'pending',
  };
}

describe('mergePendingSetLogs', () => {
  it('devuelve la misma referencia sin pendientes', () => {
    const input = [serverSet];
    expect(mergePendingSetLogs(input, [])).toBe(input);
  });

  it('fusiona las series pendientes al final', () => {
    const merged = mergePendingSetLogs([serverSet], [pendingSet('s-p1', 2)]);
    expect(merged).toHaveLength(2);
    expect(merged[1].id).toBe('s-p1');
    expect(merged[1].rir).toBe(2);
    expect(merged[1].created_at).toBe('2026-08-02T10:00:00.000Z');
  });

  it('no duplica series que ya existen en el servidor', () => {
    const duplicate = {
      ...pendingSet('server-1', 1),
      createdAt: '2026-08-02T10:00:00.000Z',
    };
    const merged = mergePendingSetLogs([serverSet], [duplicate]);
    expect(merged).toHaveLength(1);
  });

  it('completa defaults de rpe/rir/is_warmup', () => {
    const raw = pendingSet('s-p2', 3);
    raw.payload.rpe = null;
    raw.payload.rir = null;
    raw.payload.is_warmup = false;
    delete raw.payload.rpe;
    delete raw.payload.rir;
    delete raw.payload.is_warmup;
    const merged = mergePendingSetLogs([serverSet], [raw]);
    expect(merged[1].rpe).toBeNull();
    expect(merged[1].rir).toBeNull();
    expect(merged[1].is_warmup).toBe(false);
  });
});
