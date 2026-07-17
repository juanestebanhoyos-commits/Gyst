import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import ExerciseConfigForm, { ExerciseConfig } from './ExerciseConfigForm';
import type { Database } from '@/types/supabase';

type Exercise = Database['public']['Tables']['exercises']['Row'];

export interface ExerciseEntry {
  exercise: Exercise;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
}

interface ExercisePickerProps {
  allExercises: Exercise[] | undefined;
  existingIds: Set<string>;
  onAdd: (entry: ExerciseEntry) => void;
  submitLabel?: string;
  isLoading?: boolean;
  onClose?: () => void;
  error?: string | null;
}

export default function ExercisePicker({
  allExercises,
  existingIds,
  onAdd,
  submitLabel,
  isLoading,
  onClose,
  error,
}: ExercisePickerProps) {
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const available = useMemo(() => {
    if (!allExercises) return [];
    let filtered = allExercises.filter((e) => !existingIds.has(e.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.primary_muscle.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [allExercises, existingIds, search]);

  function handleSelect(exercise: Exercise) {
    setSelectedExercise(exercise);
  }

  function handleAdd(config: ExerciseConfig) {
    if (!selectedExercise) return;
    onAdd({
      exercise: selectedExercise,
      ...config,
    });
    setSelectedExercise(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seleccionar ejercicio</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X color="#6b7280" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchRow}>
        <Search color="#9ca3af" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicios..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {!allExercises ? (
        <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 12 }} />
      ) : available.length === 0 ? (
        <Text style={styles.emptyText}>
          No hay ejercicios disponibles
        </Text>
      ) : (
        <View style={styles.list}>
          {available.map((exercise) => {
            const isSelected = selectedExercise?.id === exercise.id;
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.card, isSelected && styles.cardActive]}
                onPress={() => handleSelect(exercise)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardName}>{exercise.name}</Text>
                <Text style={styles.cardMuscle}>{exercise.primary_muscle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedExercise && (
        <ExerciseConfigForm
          exerciseName={selectedExercise.name}
          onSubmit={handleAdd}
          onCancel={() => setSelectedExercise(null)}
          submitLabel={submitLabel}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  list: {
    gap: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardMuscle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
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
