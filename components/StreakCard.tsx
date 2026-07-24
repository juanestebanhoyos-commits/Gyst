import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart3 } from 'lucide-react-native';
import { useWeeklyStreak } from '@/hooks/useWeeklyStreak';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function StreakCard() {
  const { colors } = useAppTheme();
  const { data, isLoading, isError } = useWeeklyStreak();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
      padding: spacing.lg,
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.lg,
    },
    topLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    titleBlock: {
      marginLeft: spacing.sm,
    },
    title: {
      ...typography.bodyBold,
      color: colors.text,
    },
    subtitle: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    streakBlock: {
      alignItems: 'flex-end',
    },
    streakNumber: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.primary,
    },
    streakLabel: {
      ...typography.small,
      color: colors.textMuted,
      textAlign: 'right',
    },
    daysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayCell: {
      alignItems: 'center',
      width: 36,
    },
    dayLabel: {
      ...typography.small,
      color: colors.textMuted,
      marginBottom: spacing.xs,
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
    loadingText: {
      ...typography.caption,
      color: colors.textPlaceholder,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
  }), [colors]);

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

  const { currentWeekProgress } = data;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <BarChart3 size={20} color={colors.primary} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Progreso semanal</Text>
            <Text style={styles.subtitle}>Sigue así, vas muy bien!</Text>
          </View>
        </View>

        <View style={styles.streakBlock}>
          <Text style={styles.streakNumber}>{currentWeekProgress}</Text>
          <Text style={styles.streakLabel}>Días de{'\n'}racha</Text>
        </View>
      </View>

      <View style={styles.daysRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{label}</Text>
            <View
              style={[
                styles.dot,
                i < currentWeekProgress ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
