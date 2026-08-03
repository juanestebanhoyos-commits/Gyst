import { memo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Plus from 'lucide-react-native/icons/plus';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import { router } from 'expo-router';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseCard } from '@/components/ExerciseCard';
import { SearchInput } from '@/components/SearchInput';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

const ExerciseList = memo(function ExerciseList({
  exercises,
  onPress,
}: {
  exercises: Exercise[];
  onPress: (id: string) => void;
}) {
  const { colors } = useAppTheme();

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseCard exercise={item} onPress={() => onPress(item.id)} />
    ),
    [onPress],
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

  const { data: exercises, isLoading, error } = useExercises({
    search: debouncedSearch,
  });

  const handleExercisePress = useCallback((id: string) => {
    router.push(`/exercise/${id}`);
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar ejercicios" />;

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
          marginBottom: spacing.lg,
        }}
      >
        Ejercicios (Buscar)
      </Text>
      <SearchInput onSearch={setDebouncedSearch} placeholder="Busca un ejercicio" />
      <ExerciseList exercises={exercises ?? []} onPress={handleExercisePress} />
      <Fab />
    </View>
  );
}
