import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme, spacing, typography } from '@/lib/theme';
import { useNetworkStatus } from '@/lib/offline/network';

interface ErrorScreenProps {
  message: string;
}

export const ErrorScreen = memo(function ErrorScreen({ message }: ErrorScreenProps) {
  const { colors } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  // Sin conexión y sin caché: mensaje amigable en vez del error crudo.
  const text = isOnline ? message : 'Sin conexión. Conectate a internet para cargar estos datos.';
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
      <Text style={styles.text}>{text}</Text>
    </View>
  );
});
