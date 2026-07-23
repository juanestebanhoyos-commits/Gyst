import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import type { Routine } from '@/types/supabase';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export function useRoutines(options?: PaginationOptions) {
  const { user } = useSession();
  const page = options?.page;
  const pageSize = options?.pageSize ?? 50;
  const paginated = page !== undefined;

  return useQuery<Routine[]>({
    queryKey: paginated
      ? ['routines', user?.id, 'paginated', page, pageSize]
      : ['routines', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('routines')
        .select('id, user_id, name, description, scheduled_days, is_public, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(pageSize);

      if (paginated) {
        const from = page * pageSize;
        query = query.range(from, from + pageSize - 1);
      }

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
