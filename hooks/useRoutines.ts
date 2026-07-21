import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import type { Routine } from '@/types/supabase';

export function useRoutines() {
  const { user } = useSession();

  return useQuery<Routine[]>({
    queryKey: ['routines', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('routines')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (user?.id) {
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
