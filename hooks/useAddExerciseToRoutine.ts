import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AddExerciseInput {
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds?: number;
  notes?: string | null;
}

export function useAddExerciseToRoutine(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddExerciseInput) => {
      const { data, error } = await supabase
        .from('routine_exercises')
        .insert({
          routine_id: routineId,
          exercise_id: input.exercise_id,
          order_index: input.order_index,
          target_sets: input.target_sets,
          target_reps_min: input.target_reps_min,
          target_reps_max: input.target_reps_max,
          rest_seconds: input.rest_seconds ?? 60,
          notes: input.notes ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine_exercises', routineId] });
    },
  });
}
