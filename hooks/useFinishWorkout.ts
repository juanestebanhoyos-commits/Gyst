import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getNetworkStatus } from '@/lib/offline/network';
import { enqueue } from '@/lib/offline/outbox';
import { useSession } from '@/hooks/useSession';

export function useFinishWorkout() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: async (workoutLogId: string) => {
      // Camino offline: encola el finish; el flush replica en orden FIFO
      // (insert de la sesión -> series -> finish).
      if (!getNetworkStatus().isOnline) {
        if (!user?.id) throw new Error('Sesión no encontrada');
        await enqueue('finish_workout', user.id, { id: workoutLogId });
        return { id: workoutLogId, finished_at: new Date().toISOString() };
      }

      const { data, error } = await supabase
        .from('workout_logs')
        .update({ finished_at: new Date().toISOString() })
        .eq('id', workoutLogId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, workoutLogId) => {
      // Reflejo local solo offline: la sesión deja de estar activa.
      if (!getNetworkStatus().isOnline && user?.id) {
        queryClient.setQueryData(['active_workout', user.id], null);
      }
      queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
      queryClient.invalidateQueries({ queryKey: ['workout_logs', workoutLogId] });
      queryClient.invalidateQueries({ queryKey: ['active_workout'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-streak'] });
    },
  });
}
