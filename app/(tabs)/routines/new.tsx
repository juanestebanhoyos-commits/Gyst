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
import type { ExerciseEntry } from '@/components/ExercisePicker';

export default function NewRoutineScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
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
        onSuccess: (routine) => {
          router.replace(`/(tabs)/routines/${routine.id}`);
        },
        onError: (err) => {
          setError(err.message);
          setIsSubmitting(false);
        },
      },
    );
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
        <Text style={styles.title}>Nueva rutina</Text>

        {error && <Text style={styles.error}>{error}</Text>}

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

        <Text style={styles.sectionTitle}>Ejercicios</Text>

        {exercises.length > 0 && (
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
                  <X color="#ef4444" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {!showPicker ? (
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Plus color="#2563eb" size={20} />
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
            <ActivityIndicator color="#fff" />
          ) : (
            <Plus color="#fff" size={20} />
          )}
          <Text style={styles.createButtonText}>
            {isSubmitting ? 'Creando...' : 'Crear rutina'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  switchHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 4,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  exerciseDetail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  addExerciseButtonText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
  },
});
