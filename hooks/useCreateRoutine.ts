import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateRoutineInput {
  name: string;
  description?: string | null;
  is_public?: boolean;
  scheduled_days?: number[];
  exercises?: {
    exercise_id: string;
    order_index: number;
    target_sets: number;
    target_reps_min: number;
    target_reps_max: number;
    rest_seconds: number;
    notes: string | null;
  }[];
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRoutineInput) => {
      const { exercises, scheduled_days, ...routineData } = input;

      const { data: routineId, error } = await supabase.rpc('create_routine', {
        name: routineData.name,
        description: routineData.description ?? null,
        is_public: routineData.is_public ?? false,
        exercises: exercises ?? [],
      });
      if (error) throw error;

      if (scheduled_days && scheduled_days.length > 0) {
        const { error: updateError } = await supabase
          .from('routines')
          .update({ scheduled_days })
          .eq('id', routineId);
        if (updateError) throw updateError;
      }

      return routineId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['today-routine'] });
    },
  });
}
