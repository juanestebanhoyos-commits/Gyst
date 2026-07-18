import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SetLog } from '@/types/supabase';

export function useExerciseProgress(exerciseId: string) {
  return useQuery<SetLog[]>({
    queryKey: ['set_logs', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_exercise_progress', { p_exercise_id: exerciseId });
      if (error) throw error;
      return data ?? [];
    },
  });
}
