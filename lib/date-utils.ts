import { DAYS } from '@/constants/days';

/**
 * Normaliza getDay() de JS (0=Dom...6=Sáb) a índice 1-7 (1=Lun...7=Dom).
 * Este es el sistema único de días de la app.
 */
export function normalizeDayIndex(jsDayIndex: number): number {
  return ((jsDayIndex + 6) % 7) + 1;
}

/**
 * Retorna el índice de hoy en formato 1-7 (1=Lun...7=Dom).
 */
export function getTodayIndex(): number {
  return normalizeDayIndex(new Date().getDay());
}

/**
 * Retorna el inicio de la semana (lunes) para una fecha dada.
 * getWeekStart usa Date.getDay() internamente; el resultado en Date no depende del sistema de índices.
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekKey(date: Date = new Date()): string {
  return getWeekStart(date).toISOString().slice(0, 10);
}

export function getDayNames(dayIndices: number[]): string[] {
  return dayIndices.map((i) => DAYS[i] ?? '').filter(Boolean);
}
