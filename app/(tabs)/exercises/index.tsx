import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Search from 'lucide-react-native/icons/search';
import Plus from 'lucide-react-native/icons/plus';
import { router } from 'expo-router';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

export default function ExercisesScreen() {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

  const { data: exercises, isLoading, error } = useExercises({ search: debouncedSearch });

  const handleExercisePress = useCallback((id: string) => {
    router.push(`/exercise/${id}`);
  }, [router]);

  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => (
    <TouchableOpacity onPress={() => handleExercisePress(item.id)} activeOpacity={0.7}>
      <ExerciseCard exercise={item} />
    </TouchableOpacity>
  ), [handleExercisePress]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    title: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgWhite,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing.md,
      color: colors.text,
      ...typography.body,
    },
    list: {
      paddingBottom: spacing.xl,
    },
    emptyText: {
      ...typography.body,
      color: colors.textPlaceholder,
      textAlign: 'center',
      marginTop: 32,
    },
    fab: {
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
    },
  }), [colors]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar ejercicios" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejercicios (Buscar)</Text>
      <View style={styles.searchContainer}>
        <Search color={colors.textPlaceholder} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busca un ejercicio"
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList<Exercise>
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay ejercicios disponibles</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/exercises/new')}
        activeOpacity={0.8}
      >
        <Plus color={colors.textOnPrimary} size={24} />
      </TouchableOpacity>
    </View>
  );
}
