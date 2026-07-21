import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UpdateRoutineInput {
  id: string;
  name: string;
  description?: string | null;
  is_public?: boolean;
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateRoutineInput) => {
      const { error } = await supabase
        .from('routines')
        .update({
          name: input.name,
          description: input.description ?? null,
          is_public: input.is_public ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routines', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}
