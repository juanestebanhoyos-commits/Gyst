import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme, spacing, typography } from '@/lib/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  backAccessibilityLabel?: string;
}

const SIDE_WIDTH = 40;

export function ScreenHeader({
  title,
  onBack,
  rightSlot,
  backAccessibilityLabel = 'Volver',
}: ScreenHeaderProps) {
  const { colors } = useAppTheme();
  const router = useRouter();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: spacing.lg,
        },
        backButton: {
          width: SIDE_WIDTH,
          height: SIDE_WIDTH,
          borderRadius: SIDE_WIDTH / 2,
          backgroundColor: colors.bgLight,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.sm,
        },
        spacer: {
          width: SIDE_WIDTH,
          marginRight: spacing.sm,
        },
        title: {
          ...typography.caption,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 1,
          textAlign: 'center',
          flex: 1,
        },
      }),
    [colors],
  );

  const canGoBack = typeof onBack === 'function' || router.canGoBack();

  return (
    <View style={styles.header}>
      {canGoBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (typeof onBack === 'function' ? onBack() : router.back())}
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {rightSlot ?? <View style={styles.spacer} />}
    </View>
  );
}
