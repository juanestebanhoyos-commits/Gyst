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
import type { Exercise } from '@/types/supabase';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

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
    ? Math.max(
        ...setLogs
          .filter((s) => s.workout_log_id === activeWorkoutId)
          .map((s) => s.set_number),
        0,
      ) + 1
    : 1;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
