import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCancelWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workoutLogId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
      queryClient.invalidateQueries({ queryKey: ['workout_logs', workoutLogId] });
      queryClient.invalidateQueries({ queryKey: ['active_workout'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-streak'] });
    },
  });
}
