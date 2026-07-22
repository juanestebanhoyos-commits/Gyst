import { useMemo } from 'react';
import { router, Redirect, useLocalSearchParams } from 'expo-router';
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
import { useRoutine } from '@/hooks/useRoutine';
import { useSession } from '@/hooks/useSession';
import { useAddExerciseToRoutine } from '@/hooks/useAddExerciseToRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import ExercisePicker from '@/components/ExercisePicker';
import { useAppTheme, spacing, typography } from '@/lib/theme';
import type { ExerciseEntry } from '@/components/ExercisePicker';

export default function AddExerciseScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { data: routine, isLoading: loadingRoutine } = useRoutine(id);
  const { data: allExercises, isLoading: loadingExercises, error } = useExercises();
  const { data: currentExercises } = useRoutineExercises(id);
  const { mutate, isPending } = useAddExerciseToRoutine(id);

  const isLoading = loadingExercises || loadingRoutine;

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

  if (!routine || (user && routine.user_id !== user.id)) {
    return <Redirect href="/(tabs)/routines" />;
  }

  const existingIds = new Set(currentExercises?.map((e) => e.exercise_id) ?? []);

  const styles = useMemo(() => StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { flex: 1 },
    content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 40 },
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  }), [colors]);

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
