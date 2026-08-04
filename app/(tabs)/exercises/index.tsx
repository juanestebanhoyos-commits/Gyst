import { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Plus from 'lucide-react-native/icons/plus';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import { router } from 'expo-router';
import { useExercises } from '@/hooks/useExercises';
import { useLatestExerciseSets } from '@/hooks/useLatestExerciseSets';
import { ExerciseCard } from '@/components/ExerciseCard';
import { SearchInput } from '@/components/SearchInput';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

const TABS = ['Todos', 'Con series', 'Sin series'] as const;

const ExerciseList = memo(function ExerciseList({
  exercises,
  onPress,
  latestByExercise,
}: {
  exercises: Exercise[];
  onPress: (id: string) => void;
  latestByExercise: Map<string, { weight_kg: number; reps: number }>;
}) {
  const { colors } = useAppTheme();

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseCard
        exercise={item}
        lastSet={latestByExercise.get(item.id)}
        onPress={() => onPress(item.id)}
      />
    ),
    [onPress, latestByExercise],
  );

  return (
    <FlatList<Exercise>
      data={exercises}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      ItemSeparatorComponent={ListSeparator}
      ListEmptyComponent={
        <View
          style={{
            alignItems: 'center',
            marginTop: 32,
            gap: spacing.sm,
          }}
        >
          <Dumbbell size={32} color={colors.textPlaceholder} />
          <Text
            style={{
              ...typography.body,
              color: colors.textPlaceholder,
              textAlign: 'center',
              marginTop: 32,
            }}
          >
            No hay ejercicios disponibles
          </Text>
        </View>
      }
    />
  );
});

function Fab() {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}
      onPress={() => router.push('/(tabs)/exercises/new')}
      activeOpacity={0.8}
    >
      <Plus color={colors.textOnPrimary} size={24} />
    </TouchableOpacity>
  );
}

export default function ExercisesScreen() {
  const { colors } = useAppTheme();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const { data: exercises, isLoading, error } = useExercises({
    search: debouncedSearch,
  });
  const { data: setsData } = useLatestExerciseSets();

  const hasHistory = setsData?.hasHistory ?? new Set<string>();
  const latestByExercise =
    setsData?.latestByExercise ?? new Map<string, { weight_kg: number; reps: number }>();

  const visibleExercises = useMemo(() => {
    if (tabIndex === 0) return exercises ?? [];
    const wantWithHistory = tabIndex === 1;
    return (exercises ?? []).filter((ex) => hasHistory.has(ex.id) === wantWithHistory);
  }, [exercises, tabIndex, hasHistory]);

  const handleExercisePress = useCallback((id: string) => {
    router.push(`/exercise/${id}`);
  }, []);

  if (isLoading) return <LoadingScreen />;
  // Offline: priorizar los datos de caché sobre el error del refetch.
  if (error && !exercises) return <ErrorScreen message="Error al cargar ejercicios" />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
      }}
    >
      <Text
        style={{
          ...typography.caption,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 1,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        Ejercicios (Buscar)
      </Text>
      <View style={{ marginBottom: spacing.lg }}>
        <SegmentedControl
          options={TABS}
          selectedIndex={tabIndex}
          onChange={setTabIndex}
        />
      </View>
      <SearchInput onSearch={setDebouncedSearch} placeholder="Busca un ejercicio" />
      <ExerciseList exercises={visibleExercises} onPress={handleExercisePress} latestByExercise={latestByExercise} />
      <Fab />
    </View>
  );
}
