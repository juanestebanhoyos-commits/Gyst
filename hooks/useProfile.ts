import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { useSyncOnboardingProfile } from '@/hooks/useSyncOnboardingProfile';
import type { Database } from '@/types/supabase';

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'training_days' | 'theme_preference'
>;

const PROFILE_COLUMNS = 'username, avatar_url, training_days, theme_preference';

export function useProfile() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { sync } = useSyncOnboardingProfile();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      syncedRef.current = false;
      return;
    }

    let cancelled = false;
    const userId = user.id;

    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .single();

      if (cancelled) return;

      if (data?.username) {
        setProfile(data);
        return;
      }

      if (!syncedRef.current) {
        syncedRef.current = true;
        await sync(userId);

        const { data: retry } = await supabase
          .from('profiles')
          .select(PROFILE_COLUMNS)
          .eq('id', userId)
          .single();

        if (!cancelled) {
          setProfile(retry?.username ? retry : null);
        }
        return;
      }

      setProfile(null);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id, sync]);

  return { data: profile };
}
