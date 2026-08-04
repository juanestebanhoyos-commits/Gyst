import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getNetworkStatus } from '@/lib/offline/network';
import { enqueueWorkout, getPendingWorkoutInsert } from '@/lib/offline/outbox';
import { randomUuid } from '@/lib/offline/uuid';

export function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, routine_id }: { userId: string; routine_id?: string | null }) => {
      // Camino offline: get-or-create local (evita duplicar la sesión activa).
      // El outbox la replica a Supabase cuando vuelve la conexión.
      if (!getNetworkStatus().isOnline) {
        const existing = await getPendingWorkoutInsert(userId);
        if (existing) return { id: existing.payload.id as string };

        const id = randomUuid();
        await enqueueWorkout(userId, { id, routine_id: routine_id ?? null });
        return { id };
      }

      const existing = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .is('finished_at', null)
        .limit(1)
        .maybeSingle();
      if (existing.error) throw existing.error;

      if (existing.data) return existing.data;

      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: userId,
          routine_id: routine_id ?? null,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, { userId }) => {
      // Reflejo inmediato en caché (crítico offline); online no añade llamadas.
      queryClient.setQueryData(['active_workout', userId], data.id);
      queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
      queryClient.invalidateQueries({ queryKey: ['active_workout'] });
    },
  });
}
