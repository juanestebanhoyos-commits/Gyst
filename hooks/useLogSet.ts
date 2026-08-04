import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getNetworkStatus } from '@/lib/offline/network';
import { enqueue } from '@/lib/offline/outbox';
import { randomUuid } from '@/lib/offline/uuid';
import { useSession } from '@/hooks/useSession';
import type { SetLog } from '@/types/supabase';

interface LogSetInput {
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe?: number | null;
  rir?: number | null;
  is_warmup?: boolean;
}

export function useLogSet(workoutLogId: string) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: async (input: LogSetInput) => {
      // Camino offline: encola la serie y la devuelve con forma de SetLog
      // para reflejarla en la caché. El flush replica con inserts en lote.
      if (!getNetworkStatus().isOnline) {
        if (!user?.id) throw new Error('Sesión no encontrada');

        const id = randomUuid();
        await enqueue('insert_set', user.id, {
          id,
          workout_log_id: workoutLogId,
          exercise_id: input.exercise_id,
          set_number: input.set_number,
          weight_kg: input.weight_kg,
          reps: input.reps,
          rpe: input.rpe ?? null,
          rir: input.rir ?? null,
          is_warmup: input.is_warmup ?? false,
        });

        return {
          id,
          workout_log_id: workoutLogId,
          exercise_id: input.exercise_id,
          set_number: input.set_number,
          weight_kg: input.weight_kg,
          reps: input.reps,
          rpe: input.rpe ?? null,
          rir: input.rir ?? null,
          is_warmup: input.is_warmup ?? false,
          created_at: new Date().toISOString(),
        } satisfies SetLog;
      }

      const { data, error } = await supabase
        .from('set_logs')
        .insert({
          workout_log_id: workoutLogId,
          exercise_id: input.exercise_id,
          set_number: input.set_number,
          weight_kg: input.weight_kg,
          reps: input.reps,
          rpe: input.rpe ?? null,
          rir: input.rir ?? null,
          is_warmup: input.is_warmup ?? false,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Reflejo optimista solo offline; online el refetch cubre la actualización.
      if (!getNetworkStatus().isOnline) {
        // Offline la mutación devolvió el SetLog completo (mismo id que el outbox).
        // La caché de ejercicio está ordenada DESC por created_at: la serie nueva va al inicio.
        const row = data as SetLog;
        queryClient.setQueryData<SetLog[]>(
          ['set_logs', 'exercise', variables.exercise_id],
          (old) => (old ? [row, ...old] : [row]),
        );
      }
      queryClient.invalidateQueries({ queryKey: ['set_logs', workoutLogId] });
      queryClient.invalidateQueries({ queryKey: ['set_logs', 'exercise', variables.exercise_id] });
      queryClient.invalidateQueries({ queryKey: ['latest_exercise_sets'] });
    },
  });
}
