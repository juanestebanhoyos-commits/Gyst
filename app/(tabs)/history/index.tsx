import { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Clock, ClipboardList } from 'lucide-react-native';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

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

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const { data: logs, isLoading, error } = useWorkoutHistory();

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
    list: {
      paddingBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    category: {
      ...typography.small,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    routineName: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    durationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    duration: {
      ...typography.caption,
      color: colors.textMuted,
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 32,
      gap: spacing.sm,
    },
    emptyText: {
      ...typography.body,
      color: colors.textPlaceholder,
      textAlign: 'center',
      marginTop: 32,
    },
  }), [colors]);

  const renderItem = useCallback(({ item }: { item: { started_at: string; finished_at: string | null; routines: { name: string } | null } }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.category}>Sesión</Text>
      </View>
      <Text style={styles.routineName}>
        {item.routines?.name ?? 'Sesión libre'}
      </Text>
      <View style={styles.bottomRow}>
        <View style={styles.durationContainer}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={styles.duration}>
            {formatDuration(item.started_at, item.finished_at)}
          </Text>
        </View>
        <Text style={styles.duration}>{formatDate(item.started_at)}</Text>
      </View>
    </View>
  ), [styles, colors]);

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
          <View style={styles.emptyContainer}>
            <ClipboardList size={32} color={colors.textPlaceholder} />
            <Text style={styles.emptyText}>No hay sesiones registradas</Text>
          </View>
        }
      />
    </View>
  );
}
