import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Routine } from '@/types/supabase';

export function useRoutines() {
  return useQuery<Routine[]>({
    queryKey: ['routines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
