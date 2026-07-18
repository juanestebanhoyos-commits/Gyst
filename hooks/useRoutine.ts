import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Routine } from '@/types/supabase';

export function useRoutine(id: string) {
  return useQuery<Routine>({
    queryKey: ['routines', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
