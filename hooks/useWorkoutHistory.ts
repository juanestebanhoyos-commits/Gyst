import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { WorkoutLogRow, Routine } from '@/types/supabase';

type WorkoutLog = WorkoutLogRow & {
  routines: Pick<Routine, 'name'> | null;
};

export function useWorkoutHistory() {
  return useQuery<WorkoutLog[]>({
    queryKey: ['workout_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*, routines(name)')
        .order('started_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
