import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import { ProgressChart } from '@/components/ProgressChart';
import { NewSetForm } from '@/components/NewSetForm';
import { SetHistoryList } from '@/components/SetHistoryList';
import type { SetLog } from '@/types/supabase';

interface ExerciseDetailScreenProps {
  exerciseId: string;
  activeWorkoutId?: string;
  setLogs: SetLog[];
  nextSetNumber: number;
}

export function ExerciseHeaderComponent() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgWhite,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    title: {
      ...typography.h2,
      color: colors.text,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
  }), [colors]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Press banca</Text>
        <Text style={styles.subtitle}>Pecho</Text>
      </View>

      <ProgressChart data={[]} />

      <NewSetForm workoutLogId="test" exerciseId="test" nextSetNumber={1} />

      <SetHistoryList exerciseId="test" />
    </ScrollView>
  );
}
