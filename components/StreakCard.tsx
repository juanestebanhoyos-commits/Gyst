import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useWeeklyStreak } from '@/hooks/useWeeklyStreak';
import { colors, spacing, borderRadius } from '@/constants/theme';

export function StreakCard() {
  const { data, isLoading, isError } = useWeeklyStreak();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando racha…</Text>
      </View>
    );
  }

  if (isError || !data) {
    return null;
  }

  const { currentWeekProgress, weeklyGoal, streak } = data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Flame size={20} color={colors.primary} />
        <Text style={styles.title}>Progreso semanal</Text>
      </View>

      <Text style={styles.progressText}>
        Vas {currentWeekProgress} de {weeklyGoal} días
      </Text>

      <View style={styles.dotsRow}>
        {Array.from({ length: 7 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentWeekProgress ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </View>

      <View style={styles.streakRow}>
        <Text style={styles.streakCount}>{streak}</Text>
        <Text style={styles.streakLabel}>semanas consecutivas</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    backgroundColor: colors.borderLight,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textPlaceholder,
  },
});
