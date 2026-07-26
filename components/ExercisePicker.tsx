import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  type ReactNode,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import ExerciseConfigForm, { ExerciseConfig } from './ExerciseConfigForm';
import { useExercises } from '@/hooks/useExercises';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

export interface ExerciseEntry {
  exercise: Exercise;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
}

interface SearchContextType {
  search: string;
  setSearch: (s: string) => void;
}

interface PickerContextType {
  selectedExercise: Exercise | null;
  select: (e: Exercise | null) => void;
  available: Exercise[];
  isLoading: boolean;
  handleAddConfig: (config: ExerciseConfig) => void;
  styles: ReturnType<typeof StyleSheet.create>;
}

const SearchCtx = createContext<SearchContextType | null>(null);
const PickerCtx = createContext<PickerContextType | null>(null);

function useSearchCtx() {
  const ctx = useContext(SearchCtx);
  if (!ctx) throw new Error('useSearchCtx must be used within <ExercisePicker>');
  return ctx;
}

function usePickerCtx() {
  const ctx = useContext(PickerCtx);
  if (!ctx) throw new Error('usePickerCtx must be used within <ExercisePicker>');
  return ctx;
}

interface ExercisePickerRootProps {
  existingIds: Set<string>;
  onAdd: (entry: ExerciseEntry) => void;
  submitLabel?: string;
  isLoading?: boolean;
  onClose?: () => void;
  error?: string | null;
  children?: ReactNode;
}

export default function ExercisePicker({
  existingIds,
  onAdd,
  submitLabel,
  isLoading: externalLoading,
  onClose,
  error,
  children,
}: ExercisePickerRootProps) {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const deferredSearch = useDeferredValue(search);

  const { data: exercises, isLoading: exercisesLoading } = useExercises({
    search: deferredSearch || undefined,
  });

  const isLoading = externalLoading || exercisesLoading;

  const available = useMemo(() => {
    if (!exercises) return [];
    return exercises.filter((e) => !existingIds.has(e.id));
  }, [exercises, existingIds]);

  const handleSelect = useCallback((exercise: Exercise | null) => {
    setSelectedExercise(exercise);
  }, []);

  const handleAdd = useCallback(
    (config: ExerciseConfig) => {
      if (!selectedExercise) return;
      onAdd({
        exercise: selectedExercise,
        ...config,
      });
      setSelectedExercise(null);
    },
    [selectedExercise, onAdd],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
      }),
    [colors],
  );

  const searchCtx = useMemo<SearchContextType>(
    () => ({ search, setSearch }),
    [search],
  );

  const pickerCtx = useMemo<PickerContextType>(
    () => ({
      selectedExercise,
      select: handleSelect,
      available,
      isLoading,
      handleAddConfig: handleAdd,
      styles,
    }),
    [selectedExercise, handleSelect, available, isLoading, handleAdd, styles],
  );

  const inner = (
    <>
      <ExercisePicker.Header onClose={onClose} />
      <ExercisePicker.Search />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ExercisePicker.List />
      {selectedExercise ? (
        <ExercisePicker.ConfigForm
          submitLabel={submitLabel}
          isLoading={isLoading}
        />
      ) : null}
    </>
  );

  return (
    <SearchCtx.Provider value={searchCtx}>
      <PickerCtx.Provider value={pickerCtx}>
        {children ? (
          <View style={styles.container}>{children}</View>
        ) : (
          <View style={styles.container}>{inner}</View>
        )}
      </PickerCtx.Provider>
    </SearchCtx.Provider>
  );
}

ExercisePicker.Header = function PickerHeader({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { styles } = usePickerCtx();
  const { colors } = useAppTheme();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Seleccionar ejercicio</Text>
      {onClose ? (
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X color={colors.textMuted} size={20} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

ExercisePicker.Search = function PickerSearch() {
  const { search, setSearch } = useSearchCtx();
  const { styles } = usePickerCtx();
  const { colors } = useAppTheme();
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
  const { available, isLoading, selectedExercise, select, styles } =
    usePickerCtx();
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={[styles.list, { height: 370, justifyContent: 'center' }]}>
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingIndicator}
        />
      </View>
    );
  }

  if (available.length === 0) {
    return (
      <View style={[styles.list, { height: 370, justifyContent: 'center' }]}>
        <Text style={styles.emptyText}>No hay ejercicios disponibles</Text>
      </View>
    );
  }

  return (
    <View style={[styles.list, { height: 370 }]}>
      <ScrollView contentContainerStyle={{ gap: 6 }} nestedScrollEnabled>
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
      </ScrollView>
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
  const { selectedExercise, handleAddConfig, select } = usePickerCtx();
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
