import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SetLog } from '@/types/supabase';

export function useExerciseSetLogs(exerciseId: string) {
  return useQuery<SetLog[]>({
    queryKey: ['set_logs', 'exercise', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('set_logs')
        .select('*')
        .eq('exercise_id', exerciseId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
