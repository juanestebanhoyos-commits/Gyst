import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/types/supabase';

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}
