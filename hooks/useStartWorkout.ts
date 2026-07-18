import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input?: { routine_id?: string | null }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: session.user.id,
          routine_id: input?.routine_id ?? null,
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
