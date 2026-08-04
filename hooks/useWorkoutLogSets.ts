import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getNetworkStatus } from '@/lib/offline/network';
import { getPendingSetsForWorkout } from '@/lib/offline/outbox';
import { mergePendingSetLogs } from '@/lib/offline/merge';
import { useSession } from '@/hooks/useSession';
import type { SetLog, Exercise } from '@/types/supabase';

export interface WorkoutLogExercise {
  exercise: Pick<Exercise, 'id' | 'name' | 'primary_muscle'> | null;
  sets: SetLog[];
}

type SetLogJoined = SetLog & {
  exercises: Pick<Exercise, 'id' | 'name' | 'primary_muscle'> | null;
};

export function useWorkoutLogSets(workoutLogId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useQuery<WorkoutLogExercise[]>({
    queryKey: ['workout_log_sets', workoutLogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('set_logs')
        .select('*, exercises(id, name, primary_muscle)')
        .eq('workout_log_id', workoutLogId!)
        .order('created_at', { ascending: true });
      if (error) throw error;

      let rows: SetLogJoined[] = data ?? [];

      // Merge solo offline: los sets pendientes del outbox se adjuntan y se
      // intenta resolver el ejercicio desde la caché (name/primary_muscle).
      if (!getNetworkStatus().isOnline) {
        const pending = await getPendingSetsForWorkout(workoutLogId!, user?.id);
        if (pending.length > 0) {
          rows = mergePendingSetLogs(data ?? [], pending).map((set) => {
            const joined = set as SetLogJoined;
            if (joined.exercises) return joined;
            const cached = queryClient.getQueryData<Exercise>(['exercise', set.exercise_id]);
            return cached
              ? {
                  ...set,
                  exercises: {
                    id: cached.id,
                    name: cached.name,
                    primary_muscle: cached.primary_muscle,
                  },
                }
              : { ...set, exercises: null };
          });
        }
      }

      const groups = new Map<string, WorkoutLogExercise>();
      for (const set of rows) {
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
