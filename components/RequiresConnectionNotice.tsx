import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '@/lib/offline/network';
import { useAppTheme, spacing, typography } from '@/lib/theme';

/**
 * Aviso para escrituras secundarias (rutinas, ejercicios custom) que
 * permanecen online-only: se muestra cuando no hay conexión.
 */
export const RequiresConnectionNotice = memo(function RequiresConnectionNotice() {
  const { colors } = useAppTheme();
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.errorBg }]}>
      <Text style={[styles.text, { color: colors.errorText }]}>
        Requiere conexión a internet para guardar los cambios
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.small,
    textAlign: 'center',
  },
});
