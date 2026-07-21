import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Routine, RoutineExerciseRow } from '@/types/supabase';

export function useCloneRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceRoutineId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión para clonar una rutina');

      const [routineResult, exercisesResult] = await Promise.all([
        supabase
          .from('routines')
          .select('*')
          .eq('id', sourceRoutineId)
          .single<Routine>(),
        supabase
          .from('routine_exercises')
          .select('*')
          .eq('routine_id', sourceRoutineId)
          .order('order_index', { ascending: true }),
      ]);

      if (routineResult.error) throw routineResult.error;
      if (exercisesResult.error) throw exercisesResult.error;

      const source = routineResult.data;
      const sourceExercises = exercisesResult.data ?? [];

      const { data: newRoutine, error: createError } = await supabase
        .from('routines')
        .insert({
          name: `${source.name} (copia)`,
          description: source.description,
          scheduled_days: source.scheduled_days,
          is_public: false,
          user_id: user.id,
        })
        .select()
        .single<{ id: string }>();

      if (createError) throw createError;

      if (sourceExercises.length > 0) {
        const copiedExercises = sourceExercises.map((ex) => ({
          routine_id: newRoutine.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          target_sets: ex.target_sets,
          target_reps_min: ex.target_reps_min,
          target_reps_max: ex.target_reps_max,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
        }));

        const { error: insertError } = await supabase
          .from('routine_exercises')
          .insert(copiedExercises);

        if (insertError) throw insertError;
      }

      return newRoutine.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}
