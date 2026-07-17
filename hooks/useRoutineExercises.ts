import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type RoutineExercise = Database['public']['Tables']['routine_exercises']['Row'] & {
  exercises: Pick<Database['public']['Tables']['exercises']['Row'], 'name' | 'primary_muscle'> | null;
};

export function useRoutineExercises(routineId: string) {
  return useQuery<RoutineExercise[]>({
    queryKey: ['routine_exercises', routineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routine_exercises')
        .select('*, exercises(name, primary_muscle)')
        .eq('routine_id', routineId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}
