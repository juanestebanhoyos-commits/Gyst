import { useState, useMemo } from 'react';
import type { SetLog } from '@/types/supabase';

export interface ChartPoint {
  id: string;
  value: number;
  createdAt: string;
}

export const VIEW_OPTIONS = ['Volumen', 'Peso', 'Reps'] as const;
export const VIEW_TITLES = [
  'Volumen por sesión',
  'Peso máximo por sesión',
  'Reps totales por sesión',
] as const;
export const Y_AXIS_SUFFIX = [' kg', ' kg', ' reps'] as const;
export type ViewIndex = 0 | 1 | 2;

function computeValue(session: { sets: SetLog[] }, view: ViewIndex): number {
  switch (view) {
    case 0:
      return session.sets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);
    case 1:
      return Math.max(...session.sets.map((s) => s.weight_kg));
    case 2:
      return session.sets.reduce((sum, s) => sum + s.reps, 0);
  }
}

export function useChartView(data: SetLog[]) {
  const [selectedView, setSelectedView] = useState<ViewIndex>(0);

  const chartPoints = useMemo(() => {
    const sessionMap = new Map<string, { sets: SetLog[]; createdAt: string }>();
    for (const log of data) {
      const session = sessionMap.get(log.workout_log_id) || {
        sets: [],
        createdAt: log.created_at,
      };
      session.sets.push(log);
      if (log.created_at < session.createdAt) {
        session.createdAt = log.created_at;
      }
      sessionMap.set(log.workout_log_id, session);
    }

    return Array.from(sessionMap.entries())
      .map(([id, session]) => ({
        id,
        value: computeValue(session, selectedView),
        createdAt: session.createdAt,
      }))
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .slice(-10);
  }, [data, selectedView]);

  return {
    selectedView,
    setSelectedView,
    chartPoints,
    viewOptions: VIEW_OPTIONS,
    currentTitle: VIEW_TITLES[selectedView],
    currentSuffix: Y_AXIS_SUFFIX[selectedView],
  };
}
