import { useState, useMemo, useEffect } from 'react';
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
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import type { ExerciseEntry } from '@/components/ExercisePicker';
import type { Exercise } from '@/types/supabase';

export default function EditRoutineScreen() {
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

  useEffect(() => {
    if (routine) {
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
    }
  }, [routine, routineExercises]);

  function handleAddExercise(entry: ExerciseEntry) {
    setExercises((prev) => [...prev, entry]);
    setShowPicker(false);
  }

  function handleRemoveExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
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
  }

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
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={isPublic ? '#2563eb' : '#f4f3f4'}
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
                  <Text style={styles.removeText}>Eliminar</Text>
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
            <Text style={styles.addExerciseButtonText}>+ Agregar ejercicio</Text>
          </TouchableOpacity>
        ) : (
          <ExercisePicker
            allExercises={allExercises}
            existingIds={addedIds}
            onAdd={handleAddExercise}
            onClose={() => setShowPicker(false)}
            submitLabel="Agregar ejercicio"
          />
        )}

        <TouchableOpacity
          style={[styles.saveButton, isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isPending}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Save color="#fff" size={20} />
          )}
          <Text style={styles.saveButtonText}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
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
    fontSize: 13,
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
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },  addExerciseButton: {
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: colors.errorText,
    fontSize: 14,
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
});
