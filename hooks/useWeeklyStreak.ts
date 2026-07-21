import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { getWeekStart, getWeekKey, normalizeDayIndex, getTodayIndex } from '@/lib/date-utils';

interface WeeklyStreakData {
  currentWeekProgress: number;
  weeklyGoal: number;
  streak: number;
}

export function useWeeklyStreak() {
  const { user } = useSession();

  return useQuery<WeeklyStreakData | null>({
    queryKey: ['weekly-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const [profileResponse, logsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('training_days')
          .eq('id', user.id)
          .single(),
        supabase
          .from('workout_logs')
          .select('started_at')
          .eq('user_id', user.id)
          .not('finished_at', 'is', null)
          .gte('started_at', oneYearAgo.toISOString()),
      ]);

      if (profileResponse.error) throw profileResponse.error;
      if (logsResponse.error) throw logsResponse.error;

      const trainingDays: number[] = profileResponse.data.training_days;
      const weeklyGoal = trainingDays.length;

      if (weeklyGoal === 0) {
        return { currentWeekProgress: 0, weeklyGoal: 0, streak: 0 };
      }

      const workoutsByWeek = new Map<string, Set<number>>();

      for (const log of logsResponse.data) {
        const date = new Date(log.started_at);
        const dayIdx = normalizeDayIndex(date.getDay());
        const weekKey = getWeekKey(date);

        if (!workoutsByWeek.has(weekKey)) {
          workoutsByWeek.set(weekKey, new Set());
        }
        workoutsByWeek.get(weekKey)!.add(dayIdx);
      }

      const currentWeekKey = getWeekKey();
      const todayDayIdx = getTodayIndex();

      const trainingDaysPassed = trainingDays.filter(d => d <= todayDayIdx);
      const passedCount = trainingDaysPassed.length;
      const currentWeekWorkouts = workoutsByWeek.get(currentWeekKey) ?? new Set();
      const currentWeekProgress = trainingDaysPassed.filter(d =>
        currentWeekWorkouts.has(d),
      ).length;

      let streak = 0;
      const currentWeekQualifiesForStreak =
        passedCount > 0 && currentWeekProgress >= passedCount;

      if (currentWeekQualifiesForStreak) {
        streak = 1;
      }

      let cursorDate = new Date(getWeekStart());
      cursorDate.setDate(cursorDate.getDate() - 7);

      while (true) {
        const weekKey = getWeekKey(cursorDate);
        const weekWorkouts = workoutsByWeek.get(weekKey) ?? new Set();
        const weekComplete = trainingDays.every(d => weekWorkouts.has(d));

        if (weekComplete) {
          streak++;
          cursorDate.setDate(cursorDate.getDate() - 7);
        } else {
          break;
        }
      }

      return { currentWeekProgress, weeklyGoal, streak };
    },
    enabled: !!user,
  });
}
