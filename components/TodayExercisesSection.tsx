import { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Play } from 'lucide-react-native';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

function PressableCard({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      stiffness: 300,
      damping: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 300,
      damping: 20,
    }).start();
  };

  if (!onPress) return <>{children}</>;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

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
          marginTop: spacing.sm,
          marginBottom: spacing.sm,
        },
        title: {
          ...typography.h3,
          color: colors.text,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.lg,
        },
        titleRoutineName: {
          ...typography.h3,
          color: colors.textSecondary,
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
          paddingLeft: spacing.lg + 6,
          overflow: 'hidden',
        },
        accentBar: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: colors.primary,
          borderTopLeftRadius: borderRadius.md,
          borderBottomLeftRadius: borderRadius.md,
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
        setsRepsValue: {
          ...typography.bodyBold,
          color: colors.primary,
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
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.sm,
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
        <Text style={styles.title} numberOfLines={1}>
          Ejercicios de hoy
          {todayRoutine ? (
            <Text style={styles.titleRoutineName}> · {todayRoutine.name}</Text>
          ) : null}
        </Text>
        <Text style={styles.emptyText}>No hay rutina programada para hoy</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(tabs)/routines/new')}
        >
          <Play color={colors.textOnPrimary} size={18} />
          <Text style={styles.ctaText}>Crear rutina</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (exercisesLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title} numberOfLines={1}>
          Ejercicios de hoy
          {todayRoutine ? (
            <Text style={styles.titleRoutineName}> · {todayRoutine.name}</Text>
          ) : null}
        </Text>
        <Text style={styles.loadingText}>Cargando ejercicios…</Text>
      </View>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title} numberOfLines={1}>
          Ejercicios de hoy
          {todayRoutine ? (
            <Text style={styles.titleRoutineName}> · {todayRoutine.name}</Text>
          ) : null}
        </Text>
        <Text style={styles.emptyText}>
          Esta rutina aún no tiene ejercicios
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push(`/(tabs)/routines/${routineId}`)}
        >
          <Play color={colors.textOnPrimary} size={18} />
          <Text style={styles.ctaText}>Agregar ejercicios</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title} numberOfLines={1}>
        Ejercicios de hoy
        {todayRoutine ? (
          <Text style={styles.titleRoutineName}> · {todayRoutine.name}</Text>
        ) : null}
      </Text>
      <View style={styles.list}>
        {exercises.map((re) => (
          <PressableCard
            key={re.id}
            onPress={() => router.push(`/exercise/${re.exercise_id}`)}
          >
            <View style={styles.card}>
              <View style={styles.accentBar} />
              <View style={styles.cardTop}>
                <Text style={styles.category} numberOfLines={1}>
                  {re.exercises?.primary_muscle ?? 'Ejercicio'}
                </Text>
                <View style={styles.setsRepsBlock}>
                  <Text style={styles.setsRepsValue}>
                    {re.target_sets} × {re.target_reps_min}
                  </Text>
                  <Text style={styles.setsRepsLabel}>SERIES × REPS</Text>
                </View>
              </View>

              <Text style={styles.exerciseName} numberOfLines={1}>
                {re.exercises?.name ?? 'Ejercicio'}
              </Text>

              <View style={styles.cardBottom}>
                <View style={styles.verButton}>
                  <Text style={styles.verText}>Ver</Text>
                  <ChevronRight size={14} color={colors.text} />
                </View>
              </View>
            </View>
          </PressableCard>
        ))}
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => {
          router.push(`/workout/${routineId}`);
        }}
      >
        <Play color={colors.textOnPrimary} size={20} />
        <Text style={styles.ctaText}>
          {activeWorkoutId ? 'Continuar entrenamiento' : 'Empezar entrenamiento'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
