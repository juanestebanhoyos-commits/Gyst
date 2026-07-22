import { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useExerciseSetLogs } from '@/hooks/useExerciseSetLogs';
import { useAppTheme, spacing, typography } from '@/lib/theme';

interface SetHistoryListProps {
  exerciseId: string;
}

export function SetHistoryList({ exerciseId }: SetHistoryListProps) {
  const { colors } = useAppTheme();
  const { data, isLoading, isError, error } = useExerciseSetLogs(exerciseId);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
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
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.bgLight,
    },
    rowText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: 'monospace',
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
      <View style={styles.container}>
        <Text style={styles.heading}>Historial de series</Text>
        <Text style={styles.emptyText}>Aún no hay series registradas para este ejercicio</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Historial de series</Text>
      {lastFive.map((set) => (
        <View key={set.id} style={styles.row}>
          <Text style={styles.rowText}>
            {`Serie #${set.set_number}     ${set.weight_kg} x ${set.reps} reps - Rir ${set.rir ?? '-'}`}
          </Text>
        </View>
      ))}
    </View>
  );
}
