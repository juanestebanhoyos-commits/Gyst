import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import type { WorkoutLogRow, Routine } from '@/types/supabase';

type WorkoutLog = WorkoutLogRow & {
  routines: Pick<Routine, 'name'> | null;
};

interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

function getWorkoutHistoryQueryKey(
  userId: string | undefined,
  options?: PaginationOptions,
): string[] {
  const page = options?.page;
  const pageSize = options?.pageSize ?? 20;
  const paginated = page !== undefined;

  if (paginated) {
    return ['workout_logs', userId ?? '', 'paginated', String(page), String(pageSize)];
  }
  return ['workout_logs', userId ?? ''];
}

export function useWorkoutHistory(options?: PaginationOptions) {
  const { user } = useSession();
  const queryKey = getWorkoutHistoryQueryKey(user?.id, options);

  return useQuery<WorkoutLog[]>({
    queryKey,
    staleTime: 60_000,
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('workout_logs')
        .select('*, routines(name)')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (options?.page !== undefined) {
        const from = options.page * (options.pageSize ?? 20);
        query = query.range(from, from + (options.pageSize ?? 20));
      } else {
        query = query.limit(options?.pageSize ?? 20);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
