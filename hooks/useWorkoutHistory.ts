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

export function useWorkoutHistory(options?: PaginationOptions) {
  const { user } = useSession();
  const page = options?.page;
  const pageSize = options?.pageSize ?? 20;
  const paginated = page !== undefined;

  return useQuery<WorkoutLog[]>({
    queryKey: paginated
      ? ['workout_logs', user?.id, 'paginated', page, pageSize]
      : ['workout_logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('workout_logs')
        .select('*, routines(name)')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (paginated) {
        const from = page * pageSize;
        query = query.range(from, from + pageSize);
      } else {
        query = query.limit(pageSize);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}
