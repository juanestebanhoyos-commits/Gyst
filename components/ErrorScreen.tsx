import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme, spacing, typography } from '@/lib/theme';

interface ErrorScreenProps {
  message: string;
}

export const ErrorScreen = memo(function ErrorScreen({ message }: ErrorScreenProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        centered: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bgLight,
        },
        text: {
          fontSize: typography.body.fontSize,
          color: colors.error,
          textAlign: 'center',
          paddingHorizontal: spacing.xl,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.centered}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
});
