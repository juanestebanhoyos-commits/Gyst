import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const ONBOARDING_KEY = '@gyst_onboarding';

interface PendingOnboardingData {
  name: string;
  training_days: number[];
}

export function useSyncOnboardingProfile() {
  const sync = useCallback(async (userId: string) => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!stored) return;

      const data = JSON.parse(stored) as PendingOnboardingData;
      if (!data.name?.trim()) return;

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            username: data.name.trim(),
            training_days: data.training_days ?? [],
          },
          { onConflict: 'id' },
        );

      if (!error) {
        await AsyncStorage.removeItem(ONBOARDING_KEY);
      }
    } catch {
      // no bloquear el ingreso; se reintenta en el próximo login
    }
  }, []);

  return { sync };
}
