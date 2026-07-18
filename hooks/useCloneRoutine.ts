import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCloneRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sourceRoutineId: string) => {
      const { data, error } = await supabase.rpc('clone_routine', {
        source_id: sourceRoutineId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}
