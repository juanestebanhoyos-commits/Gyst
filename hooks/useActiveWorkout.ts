import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

export function useActiveWorkout() {
  const { user } = useSession();

  return useQuery<string | null>({
    queryKey: ['active_workout', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', user.id)
        .is('finished_at', null)
        .maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    },
    enabled: !!user?.id,
  });
}
