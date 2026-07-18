import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import type { Exercise } from '@/types/supabase';

export default function ExercisesScreen() {
  const [search, setSearch] = useState('');
  const { data: exercises, isLoading, error } = useExercises();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar ejercicios" />;

  const filtered = exercises?.filter((ex) => {
    const q = search.toLowerCase();
    return ex.name.toLowerCase().includes(q) || ex.primary_muscle.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejercicios</Text>
      <View style={styles.searchContainer}>
        <Search color="#9ca3af" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicio..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList<Exercise>
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
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
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  list: {
    paddingBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
