import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { getTodayIndex } from '@/lib/date-utils';
import type { Database } from '@/types/supabase';

type Routine = Pick<
  Database['public']['Tables']['routines']['Row'],
  'id' | 'name' | 'scheduled_days'
>;

export function useTodayRoutine() {
  const { user } = useSession();
  const today = getTodayIndex();

  return useQuery<Routine | null>({
    queryKey: ['today-routine', user?.id, today],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('routines')
        .select('id, name, scheduled_days')
        .eq('user_id', user.id)
        .contains('scheduled_days', [today])
        .single();

      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
