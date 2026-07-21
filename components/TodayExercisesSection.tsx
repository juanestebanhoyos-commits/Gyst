import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { colors, spacing, borderRadius } from '@/constants/theme';

export function TodayExercisesSection() {
  const router = useRouter();
  const { data: todayRoutine, isLoading: routineLoading } = useTodayRoutine();
  const { data: exercises, isLoading: exercisesLoading } = useRoutineExercises(
    todayRoutine?.id ?? '',
  );
  const { data: activeWorkoutId } = useActiveWorkout();

  const routineId = todayRoutine?.id;

  if (routineLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando ejercicios de hoy…</Text>
      </View>
    );
  }

  if (!routineId) {
    return (
      <View style={styles.container}>
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
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando ejercicios…</Text>
      </View>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <View style={styles.container}>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Dumbbell size={18} color={colors.primary} />
        <Text style={styles.title}>Ejercicios de hoy</Text>
        <Text style={styles.routineLabel}>{todayRoutine?.name}</Text>
      </View>

      {exercises.map((re) => (
        <TouchableOpacity
          key={re.id}
          style={styles.exerciseRow}
          onPress={() => router.push(`/exercise/${re.exercise_id}`)}
        >
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>
              {re.exercises?.name ?? 'Ejercicio'}
            </Text>
            <Text style={styles.exerciseMeta}>
              {re.target_sets} × {re.target_reps_min}–{re.target_reps_max} reps
              {re.exercises?.primary_muscle
                ? ` · ${re.exercises.primary_muscle}`
                : ''}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.workoutButton}
        onPress={() => {
          if (activeWorkoutId) {
            router.push(`/workout/${activeWorkoutId}`);
          } else {
            router.push(`/(tabs)/routines/${routineId}`);
          }
        }}
      >
        <Text style={styles.workoutButtonText}>
          {activeWorkoutId ? 'Continuar entrenamiento' : 'Empezar entrenamiento'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  routineLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  exerciseMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textPlaceholder,
    marginLeft: spacing.sm,
  },
  workoutButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  workoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textPlaceholder,
    textAlign: 'center',
  },
});
