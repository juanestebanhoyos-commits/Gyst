import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

export function TodayExercisesSection() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { data: todayRoutine, isLoading: routineLoading } = useTodayRoutine();
  const { data: activeWorkoutId } = useActiveWorkout();
  const { data: exercises, isLoading: exercisesLoading } = useRoutineExercises(
    todayRoutine?.id ?? '',
  );

  const routineId = todayRoutine?.id;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        },
        title: {
          ...typography.h3,
          color: colors.text,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
        list: {
          gap: spacing.sm,
          marginHorizontal: spacing.lg,
        },
        card: {
          backgroundColor: colors.bgWhite,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
        },
        cardTop: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.xs,
        },
        category: {
          ...typography.small,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        setsRepsBlock: {
          alignItems: 'flex-end',
        },
        setsReps: {
          ...typography.bodyBold,
          color: colors.text,
        },
        setsRepsLabel: {
          ...typography.small,
          color: colors.textMuted,
          fontSize: 10,
          marginTop: 2,
        },
        exerciseName: {
          ...typography.bodyBold,
          color: colors.text,
          fontSize: 18,
          marginBottom: spacing.md,
        },
        cardBottom: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
        },
        verButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: colors.bgLight,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.sm,
        },
        verText: {
          ...typography.captionBold,
          color: colors.text,
        },
        emptyText: {
          ...typography.caption,
          color: colors.textMuted,
          marginHorizontal: spacing.lg,
        },
        loadingText: {
          ...typography.caption,
          color: colors.textPlaceholder,
          marginHorizontal: spacing.lg,
        },
        ctaButton: {
          backgroundColor: colors.primary,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.md,
          alignItems: 'center',
          marginHorizontal: spacing.lg,
          marginTop: spacing.md,
        },
        ctaText: {
          color: colors.textOnPrimary,
          ...typography.bodyBold,
        },
      }),
    [colors],
  );

  if (routineLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Ejercicios de hoy</Text>
        <Text style={styles.loadingText}>Cargando ejercicios de hoy…</Text>
      </View>
    );
  }

  if (!routineId) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Ejercicios de hoy</Text>
        <Text style={styles.emptyText}>No hay rutina programada para hoy</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(tabs)/routines/new')}
        >
          <Text style={styles.ctaText}>Crear rutina</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (exercisesLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Ejercicios de hoy</Text>
        <Text style={styles.loadingText}>Cargando ejercicios…</Text>
      </View>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Ejercicios de hoy</Text>
        <Text style={styles.emptyText}>
          Esta rutina aún no tiene ejercicios
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push(`/(tabs)/routines/${routineId}`)}
        >
          <Text style={styles.ctaText}>Agregar ejercicios</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Ejercicios de hoy</Text>
      <View style={styles.list}>
        {exercises.map((re) => (
          <View key={re.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.category}>
                {re.exercises?.primary_muscle ?? 'Ejercicio'}
              </Text>
              <View style={styles.setsRepsBlock}>
                <Text style={styles.setsReps}>
                  {re.target_sets} x {re.target_reps_min}
                </Text>
                <Text style={styles.setsRepsLabel}>SERIES X REPS</Text>
              </View>
            </View>

            <Text style={styles.exerciseName}>
              {re.exercises?.name ?? 'Ejercicio'}
            </Text>

            <View style={styles.cardBottom}>
              <TouchableOpacity
                style={styles.verButton}
                onPress={() => router.push(`/exercise/${re.exercise_id}`)}
              >
                <Text style={styles.verText}>Ver</Text>
                <ChevronRight size={14} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => {
          if (activeWorkoutId) {
            router.push(`/workout/${activeWorkoutId}`);
          } else {
            router.push(`/workout/${routineId}`);
          }
        }}
      >
        <Text style={styles.ctaText}>
          {activeWorkoutId ? 'Continuar entrenamiento' : 'Empezar entrenamiento'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
