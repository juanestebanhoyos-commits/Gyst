import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/types/supabase';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useExercises(options?: PaginationOptions) {
  const page = options?.page;
  const pageSize = options?.pageSize ?? 50;
  const search = options?.search;
  const paginated = page !== undefined;

  return useQuery<Exercise[]>({
    queryKey: paginated
      ? ['exercises', 'paginated', page, pageSize, search]
      : ['exercises', search],
    queryFn: async () => {
      let query = supabase
        .from('exercises')
        .select('*');

      if (search) {
        const q = search.toLowerCase().replace(/[%_]/g, '\\$&');
        query = query.or(`name.ilike.%${q}%,primary_muscle.ilike.%${q}%`);
      }

      query = query.order('name', { ascending: true });

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
  });
}
