import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateRoutineInput {
  name: string;
  description?: string | null;
  is_public?: boolean;
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { exercises, ...routineData } = input;

      const { data, error } = await supabase
        .from('routines')
        .insert({ ...routineData, user_id: session.user.id })
        .select()
        .single();
      if (error) throw error;

      if (exercises && exercises.length > 0) {
        const routineExercises = exercises.map((ex) => ({
          routine_id: data.id,
          ...ex,
        }));

        const { error: insertError } = await supabase
          .from('routine_exercises')
          .insert(routineExercises);

        if (insertError) throw insertError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}
