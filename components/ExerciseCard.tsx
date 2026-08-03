import { memo, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { Dumbbell, ChevronRight, Weight } from 'lucide-react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Exercise, SetLog } from '@/types/supabase';

interface ExerciseCardProps {
  exercise: Pick<Exercise, 'id' | 'name' | 'primary_muscle' | 'equipment' | 'is_custom'>;
  lastSet?: Pick<SetLog, 'weight_kg' | 'reps'>;
  onPress?: () => void;
}

export const ExerciseCard = memo(function ExerciseCard({ exercise, lastSet, onPress }: ExerciseCardProps) {
  const { colors } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      stiffness: 300,
      damping: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 300,
      damping: 20,
    }).start();
  };

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      borderRadius: borderRadius.md,
    },
    card: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      paddingLeft: spacing.lg + 6,
      overflow: 'hidden',
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: colors.primary,
      borderTopLeftRadius: borderRadius.md,
      borderBottomLeftRadius: borderRadius.md,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    muscleChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: colors.primaryBg,
    },
    muscleChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    name: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    equipmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    equipmentText: {
      ...typography.small,
      color: colors.textMuted,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dataPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dataValue: {
      ...typography.bodyBold,
      color: colors.primary,
    },
    dataLabel: {
      ...typography.caption,
      color: colors.textMuted,
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

  const content = (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {exercise.name}
            </Text>
          </View>
          <View style={styles.muscleChip}>
            <Text style={styles.muscleChipText}>
              {exercise.primary_muscle}
            </Text>
          </View>
        </View>

        {exercise.equipment ? (
          <View style={styles.equipmentRow}>
            <Dumbbell size={14} color={colors.textMuted} />
            <Text style={styles.equipmentText}>{exercise.equipment}</Text>
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          {lastSet ? (
            <View style={styles.dataPreview}>
              <Weight size={16} color={colors.primary} />
              <Text style={styles.dataValue}>
                {lastSet.weight_kg} kg
              </Text>
              <Text style={styles.dataLabel}>× {lastSet.reps} reps</Text>
            </View>
          ) : (
            <View style={styles.dataPreview}>
              <Weight size={16} color={colors.textPlaceholder} />
              <Text style={[styles.dataLabel, { fontSize: 13 }]}>
                Sin historial
              </Text>
            </View>
          )}
          <View style={styles.verButton}>
            <Text style={styles.verText}>Ver</Text>
            <ChevronRight size={14} color={colors.text} />
          </View>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {content}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  return content;
});
