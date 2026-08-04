import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getNetworkStatus } from '@/lib/offline/network';
import { enqueue } from '@/lib/offline/outbox';
import { useSession } from '@/hooks/useSession';

export function useCancelWorkout() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: async (workoutLogId: string) => {
      // Camino offline: solo se encola. La decisión final (finalizar si hay
      // series en servidor, eliminar si no) la toma el flush al reconectar.
      if (!getNetworkStatus().isOnline) {
        if (!user?.id) throw new Error('Sesión no encontrada');
        await enqueue('cancel_workout', user.id, { id: workoutLogId });
        return workoutLogId;
      }

      const { data: sets, error: setsError } = await supabase
        .from('set_logs')
        .select('id')
        .eq('workout_log_id', workoutLogId)
        .limit(1);
      if (setsError) throw setsError;

      if (sets && sets.length > 0) {
        const { error } = await supabase
          .from('workout_logs')
          .update({ finished_at: new Date().toISOString() })
          .eq('id', workoutLogId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('workout_logs')
          .delete()
          .eq('id', workoutLogId);
        if (error) throw error;
      }

      return workoutLogId;
    },
    onSuccess: (workoutLogId) => {
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
