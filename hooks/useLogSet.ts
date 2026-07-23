import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface LogSetInput {
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe?: number | null;
  rir?: number | null;
  is_warmup?: boolean;
}

export function useLogSet(workoutLogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LogSetInput) => {
      const { data, error } = await supabase
        .from('set_logs')
        .insert({
          workout_log_id: workoutLogId,
          exercise_id: input.exercise_id,
          set_number: input.set_number,
          weight_kg: input.weight_kg,
          reps: input.reps,
          rpe: input.rpe ?? null,
          rir: input.rir ?? null,
          is_warmup: input.is_warmup ?? false,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['set_logs', workoutLogId] });
      queryClient.invalidateQueries({ queryKey: ['set_logs', 'exercise', variables.exercise_id] });
    },
  });
}
