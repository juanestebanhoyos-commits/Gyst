import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gyst_onboarding';

export interface OnboardingData {
  name: string;
  training_days: number[];
  completed: boolean;
}

const defaultData: OnboardingData = {
  name: '',
  training_days: [],
  completed: false,
};

export function useOnboardingLocal() {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setData(JSON.parse(stored));
        }
      })
      .catch(() => {
        setData(defaultData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const persist = useCallback(async (next: OnboardingData) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setData(next);
  }, []);

  const updateName = useCallback(
    async (name: string) => {
      await persist({ ...data, name });
    },
    [data, persist],
  );

  const updateTrainingDays = useCallback(
    async (training_days: number[]) => {
      await persist({ ...data, training_days });
    },
    [data, persist],
  );

  const completeOnboarding = useCallback(
    async (name: string, training_days: number[]) => {
      await persist({ name, training_days, completed: true });
    },
    [persist],
  );

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
  }, []);

  return { data, isLoading, updateName, updateTrainingDays, completeOnboarding, reset };
}
