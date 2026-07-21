import { useMemo } from 'react';
import type { Exercise } from '@/types/supabase';

export function useExerciseSearch(
  exercises: Exercise[] | undefined,
  query: string,
): Exercise[] {
  return useMemo(() => {
    if (!exercises) return [];
    if (!query.trim()) return exercises;
    const q = query.toLowerCase();
    return exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.primary_muscle.toLowerCase().includes(q),
    );
  }, [exercises, query]);
}
