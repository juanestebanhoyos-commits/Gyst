import { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { DAYS } from '@/constants/days';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

interface TrainingDaysPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export const TrainingDaysPicker = memo(function TrainingDaysPicker({
  selectedDays,
  onChange,
}: TrainingDaysPickerProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: spacing.sm,
        },
        dayChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          backgroundColor: colors.bgWhite,
        },
        dayChipSelected: {
          borderColor: colors.primary,
          backgroundColor: colors.primaryBg,
        },
        checkbox: {
          width: 22,
          height: 22,
          borderRadius: borderRadius.sm,
          borderWidth: 2,
          borderColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
        },
        checkboxSelected: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        dayText: {
          fontSize: typography.body.fontSize,
          color: colors.textSecondary,
        },
        dayTextSelected: {
          color: colors.primary,
          fontWeight: '600',
        },
      }),
    [colors],
  );

  const toggleDay = (dayIndex: number) => {
    onChange(
      selectedDays.includes(dayIndex)
        ? selectedDays.filter((d) => d !== dayIndex)
        : [...selectedDays, dayIndex],
    );
  };

  return (
    <View style={styles.container}>
      {DAYS.slice(1).map((day, i) => {
        const dayIndex = i + 1;
        const isSelected = selectedDays.includes(dayIndex);
        return (
          <TouchableOpacity
            key={dayIndex}
            style={[styles.dayChip, isSelected && styles.dayChipSelected]}
            onPress={() => toggleDay(dayIndex)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
              ]}
            >
              {isSelected ? <Check color={colors.textOnPrimary} size={16} /> : null}
            </View>
            <Text
              style={[
                styles.dayText,
                isSelected && styles.dayTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});
