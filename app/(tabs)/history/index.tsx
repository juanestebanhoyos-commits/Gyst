import { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

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

const keyExtractor = (item: { id: string }) => item.id;

const renderItem = useCallback(({ item }: { item: { started_at: string; finished_at: string | null; routines: { name: string } | null } }) => (
  <View style={styles.card}>
    <Text style={styles.date}>{formatDate(item.started_at)}</Text>
    <Text style={styles.routineName}>
      {item.routines?.name ?? 'Sesión libre'}
    </Text>
    <Text style={styles.duration}>
      Duración: {formatDuration(item.started_at, item.finished_at)}
    </Text>
  </View>
), []);

export default function HistoryScreen() {
  const { data: logs, isLoading, error } = useWorkoutHistory();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar historial" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      <FlatList
        data={logs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
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
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  routineName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  duration: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textPlaceholder,
    textAlign: 'center',
    marginTop: 32,
  },
});
