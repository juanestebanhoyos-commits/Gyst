import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateCustomExerciseInput {
  name: string;
  primary_muscle: string;
  equipment?: string | null;
}

export function useCreateCustomExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCustomExerciseInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión para crear un ejercicio');

      const { data, error } = await supabase
        .from('exercises')
        .insert({ ...input, is_custom: true, user_id: user.id })
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
