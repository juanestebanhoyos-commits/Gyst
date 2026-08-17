import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/types/supabase';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

function getExercisesQueryKey(options?: PaginationOptions): string[] {
  const page = options?.page;
  const pageSize = options?.pageSize ?? 20;
  const search = options?.search;
  const paginated = page !== undefined;

  if (paginated) {
    return ['exercises', 'paginated', String(page), String(pageSize), search ?? ''];
  }
  return ['exercises', search ?? ''];
}

export function useExercises(options?: PaginationOptions) {
  const queryKey = getExercisesQueryKey(options);

  return useQuery<Exercise[]>({
    queryKey,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const page = options?.page;
      const pageSize = options?.pageSize ?? 20;
      const search = options?.search;
      const paginated = page !== undefined;

      let query = supabase
        .from('exercises')
        .select('*');

      if (search) {
        const q = search.toLowerCase().replace(/[%_]/g, '\\$&');
        query = query.or(`name.ilike.%${q}%,primary_muscle.ilike.%${q}%`);
      }

      query = query.order('name', { ascending: true });

      if (paginated) {
        const from = page! * pageSize;
        query = query.range(from, from + pageSize);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
