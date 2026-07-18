import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, routine_id }: { userId: string; routine_id?: string | null }) => {
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
    },
  });
}
