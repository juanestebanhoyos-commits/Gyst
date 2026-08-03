import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface LatestSet {
  weight_kg: number;
  reps: number;
}

export function useLatestExerciseSets() {
  return useQuery<{ latestByExercise: Map<string, LatestSet>; hasHistory: Set<string> }>({
    queryKey: ['latest_exercise_sets'],
    queryFn: async () => {
      const { data: recent } = await supabase
        .from('set_logs')
        .select('exercise_id, weight_kg, reps')
        .order('created_at', { ascending: false })
        .limit(500);

      const latestByExercise = new Map<string, LatestSet>();
      for (const set of recent ?? []) {
        if (!latestByExercise.has(set.exercise_id)) {
          latestByExercise.set(set.exercise_id, {
            weight_kg: set.weight_kg,
            reps: set.reps,
          });
        }
      }

      const hasHistory = new Set<string>();
      const pageSize = 1000;
      let from = 0;
      for (;;) {
        const { data, error } = await supabase
          .from('set_logs')
          .select('exercise_id')
          .range(from, from + pageSize - 1);
        if (error) throw error;
        for (const row of data) hasHistory.add(row.exercise_id);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      return { latestByExercise, hasHistory };
    },
  });
}
