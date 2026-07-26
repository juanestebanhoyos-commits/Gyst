import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import type { Database } from '@/types/supabase';

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'training_days' | 'theme_preference'
>;

export function useProfile() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    supabase
      .from('profiles')
      .select('username, avatar_url, training_days, theme_preference')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error && error.code === 'PGRST116') {
          setProfile(null);
        } else if (error) {
          setProfile(null);
        } else {
          setProfile(data);
        }
      });
  }, [user?.id]);

  return { data: profile };
}
