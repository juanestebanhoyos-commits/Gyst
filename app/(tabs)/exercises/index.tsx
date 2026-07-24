import { memo, useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import Search from 'lucide-react-native/icons/search';
import Plus from 'lucide-react-native/icons/plus';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import { router } from 'expo-router';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

const SearchInput = memo(function SearchInput({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState('');
  const { colors } = useAppTheme();

  useEffect(() => {
    const t = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(t);
  }, [value, onSearch]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgWhite,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <Search color={colors.textPlaceholder} size={20} />
      <TextInput
        style={{
          flex: 1,
          paddingVertical: spacing.md,
          color: colors.text,
          ...typography.body,
        }}
        placeholder="Busca un ejercicio"
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
});

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
      <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.7}>
        <ExerciseCard exercise={item} />
      </TouchableOpacity>
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
      <SearchInput onSearch={setDebouncedSearch} />
      <ExerciseList exercises={exercises ?? []} onPress={handleExercisePress} />
      <Fab />
    </View>
  );
}
