import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Dumbbell,
  PersonStanding,
  Armchair,
  Heart,
  Activity,
  Footprints,
  Zap,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRoutines } from '@/hooks/useRoutines';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { LucideIcon } from 'lucide-react-native';

const CARD_SIZE = 100;

const MUSCLE_ICON_MAP: Record<string, LucideIcon> = {
  pecho: Dumbbell,
  espalda: Armchair,
  piernas: Footprints,
  hombros: PersonStanding,
  bíceps: Zap,
  biceps: Zap,
  tríceps: Activity,
  triceps: Activity,
  glúteos: PersonStanding,
  gluteos: PersonStanding,
  abdomen: Activity,
  cardio: Heart,
};

function getMuscleIcon(muscle: string | null): LucideIcon {
  if (!muscle) return Dumbbell;
  return MUSCLE_ICON_MAP[muscle.toLowerCase()] ?? Dumbbell;
}

const DISPLAY_LIMIT = 8;

export function RoutinesSection() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { data: routines, isLoading } = useRoutines();

  const displayRoutines = useMemo(
    () => routines?.slice(0, DISPLAY_LIMIT) ?? [],
    [routines],
  );
  const routineIds = useMemo(
    () => displayRoutines.map((r) => r.id),
    [displayRoutines],
  );

  const { data: exerciseCounts } = useQuery({
    queryKey: ['routine-exercise-counts', ...routineIds],
    queryFn: async () => {
      if (routineIds.length === 0) return {};
      const { data, error } = await supabase.rpc('get_routine_exercise_counts', {
        routine_ids: routineIds,
      });
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.routine_id] = Number(row.count);
      }
      return counts;
    },
    enabled: routineIds.length > 0,
  });

  const { data: routineMuscles } = useQuery({
    queryKey: ['routine-muscles', ...routineIds],
    queryFn: async () => {
      if (routineIds.length === 0) return {};
      const { data, error } = await supabase
        .from('routine_exercises')
        .select('routine_id, exercises(primary_muscle)')
        .in('routine_id', routineIds)
        .order('order_index', { ascending: true });
      if (error) throw error;
      const muscles: Record<string, string | null> = {};
      const seen = new Set<string>();
      for (const row of data ?? []) {
        if (!seen.has(row.routine_id)) {
          seen.add(row.routine_id);
          const ex = row.exercises as unknown as { primary_muscle: string | null } | null;
          muscles[row.routine_id] = ex?.primary_muscle ?? null;
        }
      }
      return muscles;
    },
    enabled: routineIds.length > 0,
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        },
        title: {
          ...typography.h3,
          color: colors.text,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
        scrollContent: {
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        },
        card: {
          width: CARD_SIZE,
          height: CARD_SIZE,
          borderRadius: borderRadius.md,
          backgroundColor: colors.bgWhite,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        cardIcon: {
          marginBottom: spacing.sm,
        },
        cardName: {
          ...typography.small,
          color: colors.text,
          fontWeight: '600',
          textAlign: 'center',
        },
        cardCount: {
          ...typography.small,
          color: colors.textMuted,
          fontSize: 11,
          marginTop: 2,
        },
        emptyText: {
          ...typography.caption,
          color: colors.textMuted,
          marginHorizontal: spacing.lg,
        },
        loadingText: {
          ...typography.caption,
          color: colors.textPlaceholder,
          marginHorizontal: spacing.lg,
        },
      }),
    [colors],
  );

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Rutinas</Text>
        <Text style={styles.loadingText}>Cargando rutinas…</Text>
      </View>
    );
  }

  if (displayRoutines.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Rutinas</Text>
        <Text style={styles.emptyText}>Aún no tienes rutinas</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Rutinas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayRoutines.map((routine) => {
          const Icon = getMuscleIcon(routineMuscles?.[routine.id] ?? null);
          return (
            <TouchableOpacity
              key={routine.id}
              style={styles.card}
              onPress={() => router.push(`/(tabs)/routines/${routine.id}`)}
            >
              <Icon size={32} color={colors.primary} style={styles.cardIcon} />
              <Text style={styles.cardName} numberOfLines={1}>
                {routine.name}
              </Text>
              <Text style={styles.cardCount}>
                {exerciseCounts?.[routine.id] ?? '—'} ejerc.
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
