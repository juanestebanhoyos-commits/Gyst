import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import type { Routine } from '@/types/supabase';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  mineOnly?: boolean;
}

function getRoutinesQueryKey(
  userId: string | undefined,
  options?: PaginationOptions,
): string[] {
  const page = options?.page;
  const pageSize = options?.pageSize ?? 50;
  const paginated = page !== undefined;
  const mineOnly = options?.mineOnly ?? false;

  if (paginated) {
    return ['routines', userId ?? '', 'paginated', String(page), String(pageSize)];
  }
  if (mineOnly) {
    return ['routines', userId ?? '', 'mine', String(pageSize)];
  }
  return ['routines', userId ?? ''];
}

export function useRoutines(options?: PaginationOptions) {
  const { user } = useSession();
  const queryKey = getRoutinesQueryKey(user?.id, options);

  return useQuery<Routine[]>({
    queryKey,
    staleTime: 60_000,
    queryFn: async () => {
      if (options?.mineOnly && !user?.id) return [];

      let query = supabase
        .from('routines')
        .select('id, user_id, name, description, scheduled_days, is_public, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(options?.pageSize ?? 50);

      if (options?.page !== undefined) {
        const from = options.page * (options.pageSize ?? 50);
        query = query.range(from, from + (options.pageSize ?? 50) - 1);
      }

      if (options?.mineOnly) {
        query = query.eq('user_id', user!.id);
      } else if (user?.id) {
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
