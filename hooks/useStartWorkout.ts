import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, routine_id }: { userId: string; routine_id?: string | null }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
      queryClient.invalidateQueries({ queryKey: ['active_workout'] });
    },
  });
}
