import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, ClipboardList, ChevronDown, ChevronRight, Flame } from 'lucide-react-native';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useWorkoutLogSets } from '@/hooks/useWorkoutLogSets';
import { SearchInput } from '@/components/SearchInput';
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

interface LogDetailProps {
  logId: string;
  expandedExerciseId: string | null;
  onToggleExercise: (exerciseId: string) => void;
}

function LogDetail({ logId, expandedExerciseId, onToggleExercise }: LogDetailProps) {
  const { colors } = useAppTheme();
  const { data, isLoading, isError } = useWorkoutLogSets(logId);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: spacing.sm,
    },
    center: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.caption,
      color: colors.textPlaceholder,
      textAlign: 'center',
      paddingVertical: spacing.md,
    },
    exerciseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      ...typography.bodyBold,
      color: colors.text,
    },
    exerciseMeta: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    setCount: {
      ...typography.captionBold,
      color: colors.primary,
    },
    setsBlock: {
      paddingBottom: spacing.xs,
    },
    setRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      paddingLeft: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    setLabel: {
      ...typography.body,
      color: colors.text,
      fontWeight: '500',
    },
    setDetail: {
      ...typography.caption,
      color: colors.textMuted,
    },
    warmupBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 1,
      borderRadius: borderRadius.sm,
    },
    warmupText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
  }), [colors]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  // Offline: priorizar los datos de caché sobre el error del refetch.
  if (isError && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Error al cargar los detalles</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No se registraron series en esta sesión</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((group) => {
        const isExpanded = expandedExerciseId === group.exercise?.id;
        return (
          <View key={group.exercise?.id ?? group.sets[0].id}>
            <TouchableOpacity
              style={styles.exerciseRow}
              activeOpacity={0.7}
              onPress={() => group.exercise && onToggleExercise(group.exercise.id)}
              disabled={!group.exercise}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>
                  {group.exercise?.name ?? 'Ejercicio desconocido'}
                </Text>
                <Text style={styles.exerciseMeta}>
                  {group.exercise?.primary_muscle ?? ''}
                </Text>
              </View>
              <Text style={styles.setCount}>
                {group.sets.length} {group.sets.length === 1 ? 'serie' : 'series'}
              </Text>
              <ChevronRight
                size={16}
                color={colors.textMuted}
                style={isExpanded ? { transform: [{ rotate: '90deg' }] } : undefined}
              />
            </TouchableOpacity>

            {isExpanded ? (
              <View style={styles.setsBlock}>
                {group.sets.map((set) => (
                  <View key={set.id} style={styles.setRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={styles.setLabel}>Serie #{set.set_number}</Text>
                      {set.is_warmup ? (
                        <View style={styles.warmupBadge}>
                          <Flame size={10} color={colors.primary} />
                          <Text style={styles.warmupText}>Calentamiento</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.setDetail}>
                      {set.weight_kg} kg × {set.reps} reps · RIR {set.rir ?? '-'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const keyExtractor = (item: { id: string }) => item.id;

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const { data: logs, isLoading, error } = useWorkoutHistory();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    if (!debouncedSearch) return logs;
    const q = debouncedSearch.toLowerCase().trim();
    return logs?.filter((log) => {
      const routineName = (log.routines?.name ?? 'Sesión libre').toLowerCase();
      const dateStr = formatDate(log.started_at).toLowerCase();
      return routineName.includes(q) || dateStr.includes(q);
    });
  }, [logs, debouncedSearch]);

  const toggleLog = useCallback((logId: string) => {
    setExpandedLogId((current) => (current === logId ? null : logId));
    setExpandedExerciseId(null);
  }, []);

  const toggleExercise = useCallback((exerciseId: string) => {
    setExpandedExerciseId((current) =>
      current === exerciseId ? null : exerciseId,
    );
  }, []);

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
      justifyContent: 'space-between',
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
    expandHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.bgLight,
    },
    expandHintText: {
      ...typography.captionBold,
      color: colors.text,
      fontSize: 12,
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

  const renderItem = useCallback(({ item }: { item: { id: string; started_at: string; finished_at: string | null; routines: { name: string } | null } }) => {
    const isExpanded = expandedLogId === item.id;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => toggleLog(item.id)}
      >
        <View style={styles.topRow}>
          <Text style={styles.category}>Sesión</Text>
          <View style={styles.expandHint}>
            <Text style={styles.expandHintText}>
              {isExpanded ? 'Ocultar' : 'Ver detalles'}
            </Text>
            <ChevronDown
              size={14}
              color={colors.text}
              style={isExpanded ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </View>
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

        {isExpanded ? (
          <LogDetail
            logId={item.id}
            expandedExerciseId={expandedExerciseId}
            onToggleExercise={toggleExercise}
          />
        ) : null}
      </TouchableOpacity>
    );
  }, [styles, colors, expandedLogId, expandedExerciseId, toggleLog, toggleExercise]);

  if (isLoading) return <LoadingScreen />;
  // Offline: priorizar los datos de caché sobre el error del refetch.
  if (error && !logs) return <ErrorScreen message="Error al cargar historial" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      <SearchInput onSearch={setDebouncedSearch} placeholder="Buscar en historial..." />
      <FlatList
        data={filteredLogs}
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
