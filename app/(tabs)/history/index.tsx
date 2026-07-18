import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';

function formatDuration(startedAt: string, finishedAt: string | null): string {
  const start = new Date(startedAt);
  const end = finishedAt ? new Date(finishedAt) : new Date();
  const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function HistoryScreen() {
  const { data: logs, isLoading, error } = useWorkoutHistory();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar historial" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{formatDate(item.started_at)}</Text>
            <Text style={styles.routineName}>
              {item.routines?.name ?? 'Sesión libre'}
            </Text>
            <Text style={styles.duration}>
              Duración: {formatDuration(item.started_at, item.finished_at)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay sesiones registradas</Text>
        }
      />
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
  date: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  routineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  duration: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 32,
  },
});
