import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UpdateRoutineInput {
  id: string;
  name: string;
  description?: string | null;
  is_public?: boolean;
  scheduled_days?: number[];
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateRoutineInput) => {
      const { scheduled_days, ...rest } = input;
      const { error } = await supabase
        .from('routines')
        .update({
          name: rest.name,
          description: rest.description ?? null,
          is_public: rest.is_public ?? false,
          scheduled_days: scheduled_days ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', rest.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routines', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['today-routine'] });
    },
  });
}
