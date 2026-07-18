import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SetLog } from '@/types/supabase';

export function useExerciseProgress(exerciseId: string) {
  return useQuery<SetLog[]>({
    queryKey: ['set_logs', exerciseId],
    queryFn: async () => {
      const { data: recentLogs, error: idError } = await supabase
        .from('set_logs')
        .select('workout_log_id')
        .eq('exercise_id', exerciseId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (idError) throw idError;

      const sessionIds = [...new Set(recentLogs?.map(l => l.workout_log_id) ?? [])].slice(0, 10);
      if (sessionIds.length === 0) return [];

      const { data, error } = await supabase
        .from('set_logs')
        .select('*')
        .eq('exercise_id', exerciseId)
        .in('workout_log_id', sessionIds)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}
