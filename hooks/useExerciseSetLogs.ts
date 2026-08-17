import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getNetworkStatus } from '@/lib/offline/network';
import { getPendingSetsForExercise } from '@/lib/offline/outbox';
import { mergePendingSetLogs } from '@/lib/offline/merge';
import { useSession } from '@/hooks/useSession';
import type { SetLog } from '@/types/supabase';

function getExerciseSetLogsQueryKey(
  userId: string | undefined,
  exerciseId: string,
): string[] {
  return ['set_logs', 'exercise', userId ?? '', exerciseId];
}

export function useExerciseSetLogs(exerciseId: string) {
  const { user } = useSession();
  const queryKey = getExerciseSetLogsQueryKey(user?.id, exerciseId);

  return useQuery<SetLog[]>({
    queryKey,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('set_logs')
        .select('*')
        .eq('exercise_id', exerciseId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const server = data ?? [];
      // Merge solo offline: con conexión el servidor ya es la verdad.
      if (getNetworkStatus().isOnline) return server;

      const pending = await getPendingSetsForExercise(exerciseId, user?.id);
      if (pending.length === 0) return server;

      return mergePendingSetLogs(server, pending).sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
    },
    enabled: !!exerciseId && !!user?.id,
  });
}
