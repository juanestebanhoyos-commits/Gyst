import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import type { Database } from '@/types/supabase';

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'training_days' | 'theme_preference'
>;

export function useProfile() {
  const { user } = useSession();

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, training_days, theme_preference')
        .eq('id', user.id)
        .single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
