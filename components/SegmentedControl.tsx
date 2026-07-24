import { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

interface SegmentedControlProps {
  options: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export const SegmentedControl = memo(function SegmentedControl({
  options,
  selectedIndex,
  onChange,
}: SegmentedControlProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          borderRadius: borderRadius.md,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        },
        segment: {
          flex: 1,
          paddingVertical: spacing.sm,
          alignItems: 'center',
          backgroundColor: colors.bgWhite,
        },
        segmentActive: {
          backgroundColor: colors.primary,
        },
        segmentText: {
          fontSize: typography.caption.fontSize,
          color: colors.textSecondary,
          fontWeight: '500',
        },
        segmentTextActive: {
          color: colors.textOnPrimary,
          fontWeight: '700',
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isActive = index === selectedIndex;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.segment, isActive && styles.segmentActive]}
            onPress={() => onChange(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});
