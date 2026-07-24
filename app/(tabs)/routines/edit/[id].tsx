import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Save } from 'lucide-react-native';
import { useUpdateRoutine } from '@/hooks/useUpdateRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useExercises } from '@/hooks/useExercises';
import { useSession } from '@/hooks/useSession';
import { useRoutine } from '@/hooks/useRoutine';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import ExercisePicker from '@/components/ExercisePicker';
import { TrainingDaysPicker } from '@/components/TrainingDaysPicker';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { ExerciseEntry } from '@/components/ExercisePicker';
import type { Exercise } from '@/types/supabase';

export default function EditRoutineScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading: sessionLoading } = useSession();
  const { data: routine, isLoading: loadingRoutine, error: routineError } = useRoutine(id);
  const { data: allExercises } = useExercises();
  const { data: routineExercises } = useRoutineExercises(id);
  const { mutate: updateRoutine, isPending } = useUpdateRoutine();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const addedIds = useMemo(() => new Set(exercises.map((e) => e.exercise.id)), [exercises]);

  const initialized = useRef(false);

  useEffect(() => {
    if (!routine) return;
    if (initialized.current) return;
    initialized.current = true;
    setName(routine.name || '');
    setDescription(routine.description || '');
    setIsPublic(routine.is_public || false);
    setScheduledDays(routine.scheduled_days || []);
    setExercises(routineExercises?.flatMap((entry) => 
      entry.exercises ? [{
        exercise: entry.exercises as Exercise,
        target_sets: entry.target_sets,
        target_reps_min: entry.target_reps_min,
        target_reps_max: entry.target_reps_max,
        rest_seconds: entry.rest_seconds,
        notes: entry.notes,
      }] : [],
    ) || []);
  }, [routine, routineExercises]);

  const handleAddExercise = useCallback((entry: ExerciseEntry) => {
    setExercises((prev) => [...prev, entry]);
    setShowPicker(false);
  }, []);

  const handleRemoveExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    setError(null);

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!user?.id) {
      setError('Usuario no encontrado');
      return;
    }

    updateRoutine(
      {
        id,
        name: name.trim(),
        description: description.trim() || null,
        is_public: isPublic,
        scheduled_days: scheduledDays,
        exercises: exercises.map((entry, i) => ({
          exercise_id: entry.exercise.id,
          order_index: i,
          target_sets: entry.target_sets,
          target_reps_min: entry.target_reps_min,
          target_reps_max: entry.target_reps_max,
          rest_seconds: entry.rest_seconds,
          notes: entry.notes,
        })),
      },
      {
        onSuccess: () => {
          router.replace(`/(tabs)/routines/${id}`);
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  }, [name, description, isPublic, scheduledDays, exercises, id, user?.id, updateRoutine, router]);

  const styles = useMemo(() => StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.sm,
      paddingBottom: 40,
    },
    title: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.captionBold,
      color: colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.bgWhite,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      ...typography.body,
      color: colors.text,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.bgWhite,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      marginTop: spacing.md,
    },
    switchLabel: {
      ...typography.bodyBold,
      color: colors.text,
    },
    switchHint: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    exerciseList: {
      gap: spacing.sm,
    },
    exerciseListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    exerciseDetail: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    addExerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      marginTop: spacing.sm,
    },
    addExerciseButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 20,
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
    error: {
      color: colors.errorText,
      ...typography.caption,
      textAlign: 'center',
      backgroundColor: colors.errorBg,
      padding: 10,
      borderRadius: borderRadius.sm,
    },
    daysContainer: {
      marginTop: spacing.xs,
    },
    removeText: {
      color: colors.errorText,
      fontSize: 14,
      fontWeight: '600',
    },
  }), [colors]);

  const exerciseListContent = useMemo(() => exercises.length > 0 ? (
    <View style={styles.exerciseList}>
      {exercises.map((entry, i) => (
        <View key={entry.exercise.id} style={styles.exerciseListItem}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{entry.exercise.name}</Text>
            <Text style={styles.exerciseDetail}>
              {entry.target_sets} series × {entry.target_reps_min}–{entry.target_reps_max} reps · {entry.rest_seconds}s descanso
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleRemoveExercise(i)}>
            <Text style={styles.removeText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  ) : null, [exercises, styles, handleRemoveExercise]);

  if (sessionLoading || loadingRoutine) return <LoadingScreen />;
  if (routineError) return <ErrorScreen message="Error al cargar la rutina" />;
  if (!routine) return <ErrorScreen message="Rutina no encontrada" />;

  if (!user || routine.user_id !== user.id) {
    return <ErrorScreen message="No tienes permiso para editar esta rutina" />;
  }

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
        <Text style={styles.title}>Editar rutina</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Push Pull Legs"
          value={name}
          onChangeText={setName}
          autoCapitalize="sentences"
        />

        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe tu rutina..."
          value={description}
          onChangeText={setDescription}
          autoCapitalize="sentences"
          multiline
          numberOfLines={3}
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Rutina pública</Text>
            <Text style={styles.switchHint}>
              Otros usuarios podrán clonarla
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#d1d5db', true: colors.primaryLight }}
            thumbColor={isPublic ? colors.primary : colors.bgLight}
          />
        </View>

        <Text style={styles.label}>Días programados</Text>
        <View style={styles.daysContainer}>
          <TrainingDaysPicker
            selectedDays={scheduledDays}
            onChange={setScheduledDays}
          />
        </View>

        <Text style={styles.sectionTitle}>Ejercicios</Text>

        {exerciseListContent}

        {!showPicker && (
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addExerciseButtonText}>+ Agregar ejercicio</Text>
          </TouchableOpacity>
        )}
        <View style={showPicker ? undefined : { display: 'none' }}>
          <ExercisePicker
            allExercises={allExercises}
            existingIds={addedIds}
            onAdd={handleAddExercise}
            onClose={() => setShowPicker(false)}
            submitLabel="Agregar ejercicio"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isPending}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Save color={colors.textOnPrimary} size={20} />
          )}
          <Text style={styles.saveButtonText}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
