import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Routine } from '@/types/supabase';

export function useRoutine(id: string) {
  return useQuery<Routine>({
    queryKey: ['routines', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('id, user_id, name, description, scheduled_days, is_public, created_at, updated_at')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
