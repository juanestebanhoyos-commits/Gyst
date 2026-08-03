import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import Square from 'lucide-react-native/icons/square';
import X from 'lucide-react-native/icons/x';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { useCancelWorkout } from '@/hooks/useCancelWorkout';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

export default function WorkoutSessionScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: routine, isLoading: loadingRoutine } = useRoutine(id);
  const { data: exercises, isLoading: loadingExercises } = useRoutineExercises(id);
  const { user } = useSession();
  const startWorkout = useStartWorkout();
  const finishWorkout = useFinishWorkout();
  const cancelWorkout = useCancelWorkout();
  const navigation = useNavigation();
  const workoutLogIdRef = useRef<string | null>(null);
  const hasStarted = useRef(false);
  const exitedRef = useRef(false);
  const cancelPendingRef = useRef(false);

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

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      const logId = workoutLogIdRef.current;
      if (!logId || exitedRef.current || finishWorkout.isPending) return;
      if (cancelPendingRef.current) return;
      e.preventDefault();
      cancelPendingRef.current = true;
      cancelWorkout.mutate(logId, {
        onSuccess: () => {
          exitedRef.current = true;
          navigation.dispatch(e.data.action);
        },
        onError: () => {
          cancelPendingRef.current = false;
          navigation.dispatch(e.data.action);
        },
      });
    });
    return unsub;
  }, [navigation, cancelWorkout, finishWorkout.isPending]);

  const handleFinish = useCallback(() => {
    const logId = workoutLogIdRef.current;
    if (!logId) {
      exitedRef.current = true;
      router.replace('/(tabs)/routines');
      return;
    }
    finishWorkout.mutate(logId, {
      onSuccess: () => {
        exitedRef.current = true;
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

  const confirmCancel = useCallback(() => {
    Alert.alert(
      'Cancelar sesión',
      '¿Seguro que quieres salir? Si ya registraste series, la sesión se guardará en tu historial.',
      [
        { text: 'Seguir entrenando', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            const logId = workoutLogIdRef.current;
            if (!logId || cancelPendingRef.current) {
              exitedRef.current = true;
              router.back();
              return;
            }
            cancelPendingRef.current = true;
            cancelWorkout.mutate(logId, {
              onSuccess: () => {
                exitedRef.current = true;
                router.back();
              },
              onError: () => {
                cancelPendingRef.current = false;
              },
            });
          },
        },
      ],
    );
  }, [router, cancelWorkout]);

  const isMutating = startWorkout.isPending || finishWorkout.isPending;

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    contentInner: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    subtitle: {
      fontSize: 15,
      color: colors.success,
      fontWeight: '600',
      marginBottom: 20,
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
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    finishButtonText: {
      color: colors.textOnPrimary,
      fontSize: 17,
      fontWeight: '700',
    },
    cancelButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
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
      <ScreenHeader title={routine.name} onBack={confirmCancel} />
      <View style={styles.contentInner}>
        <Text style={styles.subtitle}>Sesión activa</Text>

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

        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={confirmCancel}
          disabled={cancelWorkout.isPending}
        >
          <X color={colors.textSecondary} size={20} />
          <Text style={styles.cancelButtonText}>
            {cancelWorkout.isPending ? 'Cancelando...' : 'Cancelar sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
