import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

interface ExerciseCardProps {
  exercise: Pick<Exercise, 'name' | 'primary_muscle' | 'equipment' | 'is_custom'>;
}

export const ExerciseCard = memo(function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      backgroundColor: colors.bgWhite,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: 14,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primaryBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    info: {
      flex: 1,
      gap: 2,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    name: {
      ...typography.bodyBold,
      color: colors.text,
    },
    badge: {
      backgroundColor: colors.bg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
    muscle: {
      ...typography.caption,
      color: colors.textMuted,
    },
    equipment: {
      fontSize: 12,
      color: colors.textPlaceholder,
      marginTop: 2,
    },
  }), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Dumbbell color={colors.primary} size={24} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{exercise.name}</Text>
          {exercise.is_custom ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Propio</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.muscle}>{exercise.primary_muscle}</Text>
        {exercise.equipment ? (
          <Text style={styles.equipment}>{exercise.equipment}</Text>
        ) : null}
      </View>
    </View>
  );
});
