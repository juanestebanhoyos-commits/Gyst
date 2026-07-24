import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell, ChevronRight } from 'lucide-react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise } from '@/types/supabase';

interface ExerciseCardProps {
  exercise: Pick<Exercise, 'name' | 'primary_muscle' | 'equipment' | 'is_custom'>;
}

export const ExerciseCard = memo(function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { colors } = useAppTheme();

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    category: {
      ...typography.small,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    name: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.md,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.bgLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recordsText: {
      ...typography.caption,
      color: colors.textMuted,
      flex: 1,
      marginLeft: spacing.sm,
    },
    verButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.bgLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    verText: {
      ...typography.captionBold,
      color: colors.text,
    },
  }), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.category}>{exercise.primary_muscle}</Text>
      <Text style={styles.name}>{exercise.name}</Text>
      <View style={styles.bottomRow}>
        <View style={styles.iconContainer}>
          <Dumbbell size={20} color={colors.primary} />
        </View>
        <Text style={styles.recordsText}>Historial de series</Text>
        <View style={styles.verButton}>
          <Text style={styles.verText}>Ver</Text>
          <ChevronRight size={14} color={colors.text} />
        </View>
      </View>
    </View>
  );
});
