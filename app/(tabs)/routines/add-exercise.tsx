import { router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useExercises } from '@/hooks/useExercises';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useAddExerciseToRoutine } from '@/hooks/useAddExerciseToRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import ExercisePicker from '@/components/ExercisePicker';
import type { ExerciseEntry } from '@/components/ExercisePicker';

export default function AddExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: allExercises, isLoading, error } = useExercises();
  const { data: currentExercises } = useRoutineExercises(id);
  const { mutate, isPending } = useAddExerciseToRoutine(id);

  const existingIds = new Set(currentExercises?.map((e) => e.exercise_id) ?? []);

  function handleAdd(entry: ExerciseEntry) {
    mutate(
      {
        exercise_id: entry.exercise.id,
        order_index: (currentExercises?.length ?? 0) + 1,
        target_sets: entry.target_sets,
        target_reps_min: entry.target_reps_min,
        target_reps_max: entry.target_reps_max,
        rest_seconds: entry.rest_seconds,
        notes: entry.notes,
      },
      {
        onSuccess: () => router.back(),
      },
    );
  }

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar ejercicios" />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Agregar ejercicio</Text>

        <ExercisePicker
          allExercises={allExercises}
          existingIds={existingIds}
          onAdd={handleAdd}
          submitLabel="Agregar a rutina"
          isLoading={isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
});
