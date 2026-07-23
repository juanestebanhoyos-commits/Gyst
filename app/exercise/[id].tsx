import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useExerciseSetLogs } from '@/hooks/useExerciseSetLogs';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { ProgressChart } from '@/components/ProgressChart';
import { NewSetForm } from '@/components/NewSetForm';
import { SetHistoryList } from '@/components/SetHistoryList';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAppTheme, spacing, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();

  const { data: exercise, isLoading: loadingExercise, error: exerciseError } = useQuery<Exercise>({
    queryKey: ['exercise', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
  const { data: setLogs, isLoading: loadingLogs, error: logsError } = useExerciseSetLogs(id);
  const { data: activeWorkoutId, isLoading: loadingWorkout } = useActiveWorkout();

  const isLoading = loadingExercise || loadingLogs || loadingWorkout;
  const error = exerciseError || logsError;

  const nextSetNumber = activeWorkoutId && setLogs
    ? (setLogs
        .filter((s) => s.workout_log_id === activeWorkoutId)
        .reduce((max, s) => Math.max(max, s.set_number), 0)) + 1
    : 1;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.bg,
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
          marginTop: spacing.xs,
        },
      }),
    [colors],
  );

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar el ejercicio" />;
  if (!exercise) return <ErrorScreen message="Ejercicio no encontrado" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.subtitle}>{exercise.primary_muscle}</Text>
      </View>

      <ProgressChart data={setLogs ?? []} />

      {activeWorkoutId ? (
        <NewSetForm
          workoutLogId={activeWorkoutId}
          exerciseId={id}
          nextSetNumber={nextSetNumber}
        />
      ) : null}

      <SetHistoryList exerciseId={id} />
    </ScrollView>
  );
}
