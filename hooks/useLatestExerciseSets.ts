import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface LatestSet {
  weight_kg: number;
  reps: number;
}

async function fetchAllExerciseIds(supabase: any): Promise<string[]> {
  const pageSize = 1000;
  const allIds: string[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('set_logs')
      .select('exercise_id')
      .range(from, from + pageSize - 1);
    if (error) throw error;
    for (const row of data) allIds.push(row.exercise_id);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allIds;
}

export function useLatestExerciseSets() {
  return useQuery<{ latestByExercise: Map<string, LatestSet>; hasHistory: Set<string> }>({
    queryKey: ['latest_exercise_sets'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data: recent, error: recentError } = await supabase
        .from('set_logs')
        .select('exercise_id, weight_kg, reps')
        .order('created_at', { ascending: false })
        .limit(500);

      if (recentError) throw recentError;

      const latestByExercise = new Map<string, LatestSet>();
      for (const set of recent ?? []) {
        if (!latestByExercise.has(set.exercise_id)) {
          latestByExercise.set(set.exercise_id, {
            weight_kg: set.weight_kg,
            reps: set.reps,
          });
        }
      }

      const allExerciseIds = await fetchAllExerciseIds(supabase);
      const hasHistory = new Set(allExerciseIds);

      return { latestByExercise, hasHistory };
    },
  });
}
