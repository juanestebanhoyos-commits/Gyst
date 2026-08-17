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

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export function useProfile() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { sync } = useSyncOnboardingProfile();
  const syncedRef = useRef(false);
  const userIdRef = useRef<string | undefined>(user?.id);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      syncedRef.current = false;
      userIdRef.current = undefined;
      return;
    }

    let cancelled = false;
    const userId = user.id;
    userIdRef.current = userId;

    async function load() {
      const data = await fetchProfile(userId);

      if (cancelled) return;

      if (data?.username) {
        setProfile(data);
        return;
      }

      if (!syncedRef.current) {
        syncedRef.current = true;
        await sync(userId);

        const retry = await fetchProfile(userId);

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
