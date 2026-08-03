import { useCallback, useMemo } from 'react';
import { router, Redirect, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useRoutine } from '@/hooks/useRoutine';
import { useSession } from '@/hooks/useSession';
import { useAddExerciseToRoutine } from '@/hooks/useAddExerciseToRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import ExercisePicker from '@/components/ExercisePicker';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppTheme, spacing } from '@/lib/theme';
import type { ExerciseEntry } from '@/components/ExercisePicker';

export default function AddExerciseScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { data: routine, isLoading: loadingRoutine, error } = useRoutine(id);
  const { data: currentExercises } = useRoutineExercises(id);
  const { mutate, isPending } = useAddExerciseToRoutine(id);

  const isLoading = loadingRoutine;

  const handleAdd = useCallback(
    (entry: ExerciseEntry) => {
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
    },
    [currentExercises?.length, mutate, router],
  );

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar ejercicios" />;

  if (!routine || (user && routine.user_id !== user.id)) {
    return <Redirect href="/(tabs)/routines" />;
  }

  const existingIds = useMemo(
    () => new Set(currentExercises?.map((e) => e.exercise_id) ?? []),
    [currentExercises],
  );

  const styles = useMemo(() => StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { flex: 1 },
    content: { paddingBottom: 40 },
    contentInner: { paddingHorizontal: spacing.lg },
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
        <ScreenHeader
          title="Agregar ejercicio"
          onBack={() => router.navigate(`/(tabs)/routines/${id}`)}
        />
        <View style={styles.contentInner}>
        <ExercisePicker
          existingIds={existingIds}
          onAdd={handleAdd}
          submitLabel="Agregar a rutina"
          isLoading={isPending}
        />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
