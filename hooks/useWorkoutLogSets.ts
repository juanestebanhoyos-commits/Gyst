import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SetLog, Exercise } from '@/types/supabase';

export interface WorkoutLogExercise {
  exercise: Pick<Exercise, 'id' | 'name' | 'primary_muscle'> | null;
  sets: SetLog[];
}

export function useWorkoutLogSets(workoutLogId: string | null) {
  return useQuery<WorkoutLogExercise[]>({
    queryKey: ['workout_log_sets', workoutLogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('set_logs')
        .select('*, exercises(id, name, primary_muscle)')
        .eq('workout_log_id', workoutLogId!)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const groups = new Map<string, WorkoutLogExercise>();
      for (const set of data ?? []) {
        const existing = groups.get(set.exercise_id);
        if (existing) {
          existing.sets.push(set);
        } else {
          groups.set(set.exercise_id, {
            exercise: set.exercises ?? null,
            sets: [set],
          });
        }
      }
      return Array.from(groups.values());
    },
    enabled: !!workoutLogId,
  });
}
