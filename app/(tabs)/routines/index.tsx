import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useRoutines } from '@/hooks/useRoutines';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import type { Routine } from '@/types/supabase';

export default function RoutinesScreen() {
  const { data: routines, isLoading, error } = useRoutines();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar rutinas" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutinas</Text>
      <FlatList<Routine>
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/routines/${item.id}`)}
          >
            <Text style={styles.cardName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.cardDescription}>{item.description}</Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay rutinas disponibles</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/routines/new')}
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
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 32,
  },
});
