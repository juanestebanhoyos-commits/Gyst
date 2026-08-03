import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Copy, User, Globe, Play } from 'lucide-react-native';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useSession } from '@/hooks/useSession';
import { useCloneRoutine } from '@/hooks/useCloneRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { ScreenHeader } from '@/components/ScreenHeader';
import { getDayNames } from '@/lib/date-utils';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

const keyExtractor = (item: { id: string }) => item.id;

export default function RoutineDetailScreen() {
  const { colors } = useAppTheme();
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    detailBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    detailBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    summaryCard: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.lg,
      padding: spacing.lg - 2,
      borderWidth: 1,
      borderColor: colors.borderLight,
      marginBottom: spacing.lg,
    },
    description: {
      fontSize: 15,
      color: colors.textMuted,
      marginTop: spacing.sm,
      lineHeight: 22,
    },
    scheduleBlock: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    scheduledLabel: {
      ...typography.small,
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
      paddingBottom: spacing.xl,
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
    exerciseIndex: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    exerciseTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
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
    secondaryButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 15,
      color: colors.textPlaceholder,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    startButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    startButtonText: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
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
  }), [colors]);

  const renderItem = useCallback(({ item, index }: { item: { id: string; exercises: { name: string; primary_muscle: string } | null; target_sets: number; target_reps_min: number; target_reps_max: number }; index: number }) => (
    <View style={styles.exerciseCard}>
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
    </View>
  ), [styles]);

  if (routineError || exercisesError) return <ErrorScreen message="Error al cargar la rutina" />;
  if (loadingRoutine && !routine) return <LoadingScreen />;
  if (!routine) return <ErrorScreen message="Rutina no encontrada" />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={routine.name}
        onBack={() => router.navigate('/(tabs)/routines')}
      />
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={[
            styles.detailBadge,
            { backgroundColor: isOwner ? colors.primaryBg : colors.bgLight },
          ]}>
            {isOwner
              ? <User size={12} color={colors.primary} />
              : <Globe size={12} color={colors.textMuted} />
            }
            <Text style={[
              styles.detailBadgeText,
              { color: isOwner ? colors.primary : colors.textMuted },
            ]}>
              {isOwner ? 'Personal' : 'Pública'}
            </Text>
          </View>
          {routine.description ? (
            <Text style={styles.description}>{routine.description}</Text>
          ) : null}
          {routine.scheduled_days && routine.scheduled_days.length > 0 ? (
            <View style={styles.scheduleBlock}>
              <Text style={styles.scheduledLabel}>Días programados</Text>
              <Text style={styles.scheduledDays}>
                {getDayNames(routine.scheduled_days).join(' · ')}
              </Text>
            </View>
          ) : null}
        </View>
        {isOwner ? (
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => router.push(`/workout/${id}`)}
          >
            <Play color={colors.textOnPrimary} size={18} />
            <Text style={styles.startButtonText}>Empezar rutina</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.buttonsRow}>
        {canClone ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleClone}
            disabled={cloneMutation.isPending}
          >
            {cloneMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Copy color={colors.primary} size={16} />
            )}
            <Text style={styles.secondaryButtonText}>
              {cloneMutation.isPending ? 'Clonando...' : 'Clonar'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {canEdit ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleEdit}
          >
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {cloneError ? (
        <Text style={styles.errorText}>{cloneError}</Text>
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
        />
      )}
      </View>
    </View>
  );
}
