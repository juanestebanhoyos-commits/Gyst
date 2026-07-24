import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
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
  const router = useRouter();

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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: spacing.lg,
          position: 'relative',
        },
        backButton: {
          position: 'absolute',
          left: spacing.lg,
          padding: spacing.xs,
        },
        title: {
          ...typography.h1,
          color: colors.text,
          textAlign: 'center',
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{exercise.name}</Text>
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
