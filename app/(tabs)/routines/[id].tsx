import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Copy, Plus } from 'lucide-react-native';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useSession } from '@/hooks/useSession';
import { useCloneRoutine } from '@/hooks/useCloneRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { getDayNames } from '@/lib/date-utils';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

const keyExtractor = (item: { id: string }) => item.id;

const renderItem = useCallback(({ item, index }: { item: { id: string; exercises: { name: string; primary_muscle: string } | null; target_sets: number; target_reps_min: number; target_reps_max: number }; index: number }) => (
  <View style={styles.exerciseCard}>
    <Text style={styles.exerciseIndex}>{index + 1}</Text>
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
    <Text style={styles.exerciseSets}>
      {item.target_sets} × {item.target_reps_min}-{item.target_reps_max}
    </Text>
  </View>
), []);

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: routine, isLoading: loadingRoutine, error: routineError } = useRoutine(id);
  const {
    data: exercises,
    isLoading: loadingExercises,
    error: exercisesError,
  } = useRoutineExercises(id);

  const { user } = useSession();
  const cloneMutation = useCloneRoutine();
  const [cloneError, setCloneError] = useState<string | null>(null);

  const isOwner = user ? routine?.user_id === user.id : false;
  const canClone = !isOwner && !!routine?.is_public;
  const canEdit = isOwner;

  const handleClone = () => {
    setCloneError(null);
    cloneMutation.mutate(id, {
      onSuccess: (newRoutineId) => {
        router.replace(`/(tabs)/routines/${newRoutineId}`);
      },
      onError: (err) => setCloneError(err.message),
    });
  };

  const handleEdit = () => {
    if (canEdit) {
      router.push(`/(tabs)/routines/edit/${id}`);
    }
  };

  if (routineError || exercisesError) return <ErrorScreen message="Error al cargar la rutina" />;
  if (loadingRoutine && !routine) return <LoadingScreen />;
  if (!routine) return <ErrorScreen message="Rutina no encontrada" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routine.name}</Text>
      {routine.description ? (
        <Text style={styles.description}>{routine.description}</Text>
      ) : null}
      <View style={styles.buttonsRow}>
        {canClone ? (
          <TouchableOpacity
            style={styles.cloneButton}
            activeOpacity={0.8}
            onPress={handleClone}
            disabled={cloneMutation.isPending}
          >
            <Copy color="#fff" size={18} />
            <Text style={styles.cloneButtonText}>
              {cloneMutation.isPending ? 'Clonando...' : 'Clonar rutina'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {canEdit ? (
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={handleEdit}
          >
            <Text style={styles.editButtonText}>Editar rutina</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {cloneError ? (
        <Text style={styles.errorText}>{cloneError}</Text>
      ) : null}
        {routine.scheduled_days && routine.scheduled_days.length > 0 ? (
          <View style={styles.scheduledSection}>
            <Text style={styles.scheduledLabel}>Días programados</Text>
            <Text style={styles.scheduledDays}>
              {getDayNames(routine.scheduled_days).join(' · ')}
            </Text>
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>Ejercicios</Text>
      {loadingExercises ? (
        <LoadingScreen />
      ) : (
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
          ListFooterComponent={
            canEdit ? (
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.8}
                onPress={() => router.push(`/(tabs)/routines/add-exercise?id=${id}`)}
              >
                <Plus color="#fff" size={20} />
                <Text style={styles.addButtonText}>Agregar ejercicio</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
  scheduledSection: {
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg - 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  scheduledLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  scheduledDays: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: 24,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg - 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  exerciseIndex: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPlaceholder,
    minWidth: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  exerciseMuscle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  exerciseSets: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg - 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cloneButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cloneButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textPlaceholder,
    textAlign: 'center',
    marginTop: 24,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.errorText,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: colors.errorBg,
    padding: 10,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
});
