import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useExerciseSetLogs } from '@/hooks/useExerciseSetLogs';

interface SetHistoryListProps {
  exerciseId: string;
}

export function SetHistoryList({ exerciseId }: SetHistoryListProps) {
  const { data, isLoading, isError, error } = useExerciseSetLogs(exerciseId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error?.message ?? 'Error al cargar el historial'}</Text>
      </View>
    );
  }

  const lastFive = (data ?? []).slice(0, 5);

  if (lastFive.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Historial de series</Text>
        <Text style={styles.emptyText}>Aún no hay series registradas para este ejercicio</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Historial de series</Text>
      {lastFive.map((set) => (
        <View key={set.id} style={styles.row}>
          <Text style={styles.rowText}>
            {`Serie #${set.set_number}     ${set.weight_kg} x ${set.reps} reps - Rir ${set.rir ?? '-'}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  center: {
    padding: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
});
