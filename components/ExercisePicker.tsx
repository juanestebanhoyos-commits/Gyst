import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
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
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { Exercise } from '@/types/supabase';

export interface ExerciseEntry {
  exercise: Exercise;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
}

interface ExercisePickerContextType {
  search: string;
  setSearch: (s: string) => void;
  selectedExercise: Exercise | null;
  select: (e: Exercise | null) => void;
  available: Exercise[];
  allExercises: Exercise[] | undefined;
  handleAddConfig: (config: ExerciseConfig) => void;
}

const ExercisePickerContext = createContext<ExercisePickerContextType | null>(null);

function usePickerContext() {
  const ctx = useContext(ExercisePickerContext);
  if (!ctx) throw new Error('ExercisePicker sub-components must be used within <ExercisePicker>');
  return ctx;
}

interface ExercisePickerRootProps {
  allExercises: Exercise[] | undefined;
  existingIds: Set<string>;
  onAdd: (entry: ExerciseEntry) => void;
  submitLabel?: string;
  isLoading?: boolean;
  onClose?: () => void;
  error?: string | null;
  children?: ReactNode;
}

export default function ExercisePicker({
  allExercises,
  existingIds,
  onAdd,
  submitLabel,
  isLoading,
  onClose,
  error,
  children,
}: ExercisePickerRootProps) {
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

  function handleSelect(exercise: Exercise | null) {
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

  const ctx: ExercisePickerContextType = {
    search,
    setSearch,
    selectedExercise,
    select: handleSelect,
    available,
    allExercises,
    handleAddConfig: handleAdd,
  };

  if (children) {
    return (
      <ExercisePickerContext.Provider value={ctx}>
        <View style={styles.container}>{children}</View>
      </ExercisePickerContext.Provider>
    );
  }

  return (
    <ExercisePickerContext.Provider value={ctx}>
      <View style={styles.container}>
        <ExercisePicker.Header onClose={onClose} />
        <ExercisePicker.Search />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ExercisePicker.List />
        {selectedExercise ? (
          <ExercisePicker.ConfigForm submitLabel={submitLabel} isLoading={isLoading} />
        ) : null}
      </View>
    </ExercisePickerContext.Provider>
  );
}

ExercisePicker.Header = function PickerHeader({
  onClose,
}: {
  onClose?: () => void;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Seleccionar ejercicio</Text>
      {onClose ? (
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X color={colors.textMuted} size={20} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

ExercisePicker.Search = function PickerSearch() {
  const { search, setSearch } = usePickerContext();
  return (
    <View style={styles.searchRow}>
      <Search color={colors.textPlaceholder} size={18} />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar ejercicios..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

ExercisePicker.List = function PickerList() {
  const { available, allExercises, selectedExercise, select } = usePickerContext();

  return !allExercises ? (
    <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
  ) : available.length === 0 ? (
    <Text style={styles.emptyText}>No hay ejercicios disponibles</Text>
  ) : (
    <View style={styles.list}>
      {available.map((exercise) => {
        const isSelected = selectedExercise?.id === exercise.id;
        return (
          <TouchableOpacity
            key={exercise.id}
            style={[styles.card, isSelected && styles.cardActive]}
            onPress={() => select(exercise)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardName}>{exercise.name}</Text>
            <Text style={styles.cardMuscle}>{exercise.primary_muscle}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

ExercisePicker.ConfigForm = function PickerConfigForm({
  submitLabel,
  isLoading,
}: {
  submitLabel?: string;
  isLoading?: boolean;
}) {
  const { selectedExercise, handleAddConfig, select } = usePickerContext();
  if (!selectedExercise) return null;
  return (
    <ExerciseConfigForm
      exerciseName={selectedExercise.name}
      onSubmit={handleAddConfig}
      onCancel={() => select(null)}
      submitLabel={submitLabel}
      isLoading={isLoading}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg - 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  list: {
    gap: 6,
  },
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.md,
    padding: spacing.lg - 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardMuscle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textPlaceholder,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  error: {
    color: colors.errorText,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: colors.errorBg,
    padding: 10,
    borderRadius: borderRadius.sm,
  },
  loadingIndicator: {
    marginTop: 12,
  },
});
