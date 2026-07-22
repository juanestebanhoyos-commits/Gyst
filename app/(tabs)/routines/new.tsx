import { useState, useMemo } from 'react';
import { router } from 'expo-router';
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
import { Plus, X } from 'lucide-react-native';
import { useCreateRoutine } from '@/hooks/useCreateRoutine';
import { useExercises } from '@/hooks/useExercises';
import ExercisePicker from '@/components/ExercisePicker';
import { TrainingDaysPicker } from '@/components/TrainingDaysPicker';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { ExerciseEntry } from '@/components/ExercisePicker';

export default function NewRoutineScreen() {
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createRoutine } = useCreateRoutine();
  const { data: allExercises } = useExercises();

  const addedIds = useMemo(() => new Set(exercises.map((e) => e.exercise.id)), [exercises]);

  function handleAddExercise(entry: ExerciseEntry) {
    setExercises((prev) => [...prev, entry]);
    setShowPicker(false);
  }

  function handleRemoveExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCreate() {
    setError(null);

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setIsSubmitting(true);

    createRoutine(
      {
        name: name.trim(),
        description: description.trim() || null,
        is_public: isPublic,
        scheduled_days: scheduledDays,
        exercises: exercises.map((ex, i) => ({
          exercise_id: ex.exercise.id,
          order_index: i + 1,
          target_sets: ex.target_sets,
          target_reps_min: ex.target_reps_min,
          target_reps_max: ex.target_reps_max,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
        })),
      },
      {
        onSuccess: (routineId) => {
          router.replace(`/(tabs)/routines/${routineId}`);
        },
        onError: (err) => {
          setError(err.message);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  }

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
      ...typography.h1,
      color: colors.text,
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
    createButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 20,
    },
    createButtonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
    daysContainer: {
      marginTop: spacing.xs,
    },
    error: {
      color: colors.errorText,
      ...typography.caption,
      textAlign: 'center',
      backgroundColor: colors.errorBg,
      padding: 10,
      borderRadius: borderRadius.sm,
    },
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
        <Text style={styles.title}>Nueva rutina</Text>

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

        {exercises.length > 0 ? (
          <View style={styles.exerciseList}>
            {exercises.map((entry, i) => (
              <View key={`${entry.exercise.id}-${i}`} style={styles.exerciseListItem}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{entry.exercise.name}</Text>
                  <Text style={styles.exerciseDetail}>
                    {entry.target_sets} series × {entry.target_reps_min}–{entry.target_reps_max} reps · {entry.rest_seconds}s descanso
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveExercise(i)}>
                  <X color={colors.error} size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {!showPicker ? (
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Plus color={colors.primary} size={20} />
            <Text style={styles.addExerciseButtonText}>Agregar ejercicio</Text>
          </TouchableOpacity>
        ) : (
          <ExercisePicker
            allExercises={allExercises}
            existingIds={addedIds}
            onAdd={handleAddExercise}
            onClose={() => setShowPicker(false)}
          />
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Plus color={colors.textOnPrimary} size={20} />
          )}
          <Text style={styles.createButtonText}>
            {isSubmitting ? 'Creando...' : 'Crear rutina'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
