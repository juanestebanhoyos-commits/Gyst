import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateCustomExerciseInput {
  name: string;
  primary_muscle: string;
  equipment?: string | null;
  userId: string;
}

export function useCreateCustomExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ...input }: CreateCustomExerciseInput) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert({ ...input, is_custom: true, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}
