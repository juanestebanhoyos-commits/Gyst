import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ExerciseInput {
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
}

interface UpdateRoutineInput {
  id: string;
  name: string;
  description?: string | null;
  is_public?: boolean;
  scheduled_days?: number[];
  exercises?: ExerciseInput[];
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateRoutineInput) => {
      const { scheduled_days, exercises, ...rest } = input;
      const { error: updateError } = await supabase
        .from('routines')
        .update({
          name: rest.name,
          description: rest.description ?? null,
          is_public: rest.is_public ?? false,
          scheduled_days: scheduled_days ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', rest.id);

      if (updateError) throw updateError;

      if (exercises) {
        const { error: deleteError } = await supabase
          .from('routine_exercises')
          .delete()
          .eq('routine_id', rest.id);

        if (deleteError) throw deleteError;

        if (exercises.length > 0) {
          const { error: insertError } = await supabase
            .from('routine_exercises')
            .insert(exercises.map((e) => ({
              routine_id: rest.id,
              exercise_id: e.exercise_id,
              order_index: e.order_index,
              target_sets: e.target_sets,
              target_reps_min: e.target_reps_min,
              target_reps_max: e.target_reps_max,
              rest_seconds: e.rest_seconds,
              notes: e.notes,
            })));

          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routines', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['today-routine'] });
    },
  });
}
