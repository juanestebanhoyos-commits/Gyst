import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import Square from 'lucide-react-native/icons/square';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

export default function WorkoutSessionScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: routine, isLoading: loadingRoutine } = useRoutine(id);
  const { data: exercises, isLoading: loadingExercises } = useRoutineExercises(id);
  const { user } = useSession();
  const startWorkout = useStartWorkout();
  const finishWorkout = useFinishWorkout();
  const workoutLogIdRef = useRef<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (user && !hasStarted.current) {
      hasStarted.current = true;
      startWorkout.mutate(
        { userId: user.id, routine_id: id },
        {
          onSuccess: (data) => {
            workoutLogIdRef.current = data.id;
          },
        },
      );
    }
  }, [id, user?.id]);

  const handleFinish = useCallback(() => {
    const logId = workoutLogIdRef.current;
    if (!logId) {
      router.replace('/(tabs)/routines');
      return;
    }
    finishWorkout.mutate(logId, {
      onSuccess: () => {
        router.replace('/(tabs)/routines');
      },
    });
  }, [router, finishWorkout]);

  const confirmFinish = useCallback(() => {
    Alert.alert(
      'Finalizar sesión',
      '¿Seguro que quieres finalizar la sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: handleFinish,
        },
      ],
    );
  }, [handleFinish]);

  const isMutating = startWorkout.isPending || finishWorkout.isPending;

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: 15,
      color: colors.success,
      fontWeight: '600',
    },
    list: {
      paddingBottom: 80,
    },
    exerciseCard: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      paddingLeft: spacing.lg + 6,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    exerciseAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: colors.primary,
      borderTopLeftRadius: borderRadius.md,
      borderBottomLeftRadius: borderRadius.md,
    },
    exerciseTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    exerciseIndex: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      ...typography.bodyBold,
      color: colors.text,
      fontSize: 16,
    },
    exerciseMuscle: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    exerciseSets: {
      ...typography.captionBold,
      color: colors.primary,
      fontSize: 15,
    },
    finishButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: 24,
    },
    finishButtonText: {
      color: colors.textOnPrimary,
      fontSize: 17,
      fontWeight: '700',
    },
    emptyText: {
      fontSize: 15,
      color: colors.textPlaceholder,
      textAlign: 'center',
      marginTop: 24,
    },
  }), [colors]);

  const renderItem = useCallback(({ item, index }: { item: { id: string; exercise_id: string; exercises: { name: string; primary_muscle: string } | null; target_sets: number; target_reps_min: number; target_reps_max: number }; index: number }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/exercise/${item.exercise_id}`)}
    >
      <View style={styles.exerciseAccent} />
      <View style={styles.exerciseTop}>
        <Text style={styles.exerciseIndex}>Ejercicio {index + 1}</Text>
        <Text style={styles.exerciseSets}>
          {item.target_sets} × {item.target_reps_min}-{item.target_reps_max}
        </Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>
          {item.exercises?.name ?? 'Ejercicio desconocido'}
        </Text>
        {item.exercises?.primary_muscle ? (
          <Text style={styles.exerciseMuscle}>
            {item.exercises.primary_muscle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  ), [styles]);

  if (loadingRoutine || loadingExercises || isMutating) return <LoadingScreen />;
  if (startWorkout.isError || !routine)
    return <ErrorScreen message={startWorkout.error?.message ?? 'No se pudo iniciar la sesión'} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{routine.name}</Text>
        <Text style={styles.subtitle}>Sesión activa</Text>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Esta rutina no tiene ejercicios asignados
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.finishButton}
        activeOpacity={0.8}
        onPress={confirmFinish}
        disabled={finishWorkout.isPending}
      >
        <Square color={colors.textOnPrimary} size={20} />
        <Text style={styles.finishButtonText}>
          {finishWorkout.isPending ? 'Finalizando...' : 'Finalizar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
