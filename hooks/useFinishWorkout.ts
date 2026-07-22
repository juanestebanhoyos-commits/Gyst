import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useFinishWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workoutLogId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
      queryClient.invalidateQueries({ queryKey: ['workout_logs', workoutLogId] });
      queryClient.invalidateQueries({ queryKey: ['weekly-streak'] });
    },
  });
}
