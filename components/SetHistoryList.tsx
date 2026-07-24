import { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useExerciseSetLogs } from '@/hooks/useExerciseSetLogs';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

interface SetHistoryListProps {
  exerciseId: string;
}

export function SetHistoryList({ exerciseId }: SetHistoryListProps) {
  const { colors } = useAppTheme();
  const { data, isLoading, isError, error } = useExerciseSetLogs(exerciseId);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    center: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    heading: {
      ...typography.bodyBold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    rowLabel: {
      ...typography.body,
      color: colors.text,
      fontWeight: '500',
    },
    rowDetail: {
      ...typography.caption,
      color: colors.textMuted,
    },
    emptyText: {
      ...typography.caption,
      color: colors.textPlaceholder,
      textAlign: 'center',
      paddingVertical: 20,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
      textAlign: 'center',
    },
  }), [colors]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error?.message ?? 'Error al cargar el historial'}</Text>
      </View>
    );
  }

  const lastFive = (data ?? []).slice(0, 5);

  if (lastFive.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>Series registradas</Text>
        <Text style={styles.emptyText}>Aún no hay series registradas para este ejercicio</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Series registradas</Text>
      {lastFive.map((set) => (
        <View key={set.id} style={styles.row}>
          <Text style={styles.rowLabel}>Serie #{set.set_number}</Text>
          <Text style={styles.rowDetail}>
            {set.weight_kg} kg x {set.reps} Reps · RIR {set.rir ?? '-'}
          </Text>
        </View>
      ))}
    </View>
  );
}
