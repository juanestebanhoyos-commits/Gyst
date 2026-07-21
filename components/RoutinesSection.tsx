import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRoutines } from '@/hooks/useRoutines';
import { colors, spacing, borderRadius } from '@/constants/theme';

export function RoutinesSection() {
  const router = useRouter();
  const { data: routines, isLoading } = useRoutines();
  const DISPLAY_LIMIT = 5;

  const displayRoutines = routines?.slice(0, DISPLAY_LIMIT) ?? [];
  const routineIds = displayRoutines.map(r => r.id);

  const { data: exerciseCounts } = useQuery({
    queryKey: ['routine-exercise-counts', ...routineIds],
    queryFn: async () => {
      if (routineIds.length === 0) return {};
      const { data, error } = await supabase
        .rpc('get_routine_exercise_counts', { routine_ids: routineIds });
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.routine_id] = Number(row.count);
      }
      return counts;
    },
    enabled: routineIds.length > 0,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando rutinas…</Text>
      </View>
    );
  }

  if (displayRoutines.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Rutinas recientes</Text>
        <Text style={styles.emptyText}>Aún no tienes rutinas</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(tabs)/routines/new')}
        >
          <Text style={styles.ctaText}>Crear primera rutina</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutinas recientes</Text>
      {displayRoutines.map((routine) => (
        <TouchableOpacity
          key={routine.id}
          style={styles.routineCard}
          onPress={() => router.push(`/(tabs)/routines/${routine.id}`)}
        >
          <Text style={styles.routineName}>{routine.name}</Text>
          <Text style={styles.exerciseCount}>
            {exerciseCounts?.[routine.id] ?? '—'} ejercicios
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  routineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  exerciseCount: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textPlaceholder,
    textAlign: 'center',
  },
});
