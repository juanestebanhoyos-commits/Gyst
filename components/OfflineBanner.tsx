import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/lib/offline/network';
import { useAppTheme, typography } from '@/lib/theme';

/**
 * Aviso delgado y pasivo (pointerEvents none) sobre la conexión.
 * No interfiere con la navegación ni con los botones de las pantallas.
 */
export const OfflineBanner = memo(function OfflineBanner() {
  const { colors } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + 4 }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <View style={[styles.pill, { backgroundColor: colors.primary }]}>
        <Text style={[styles.text, { color: colors.textOnPrimary }]}>
          Sin conexión — se sincronizará al volver
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    ...typography.small,
    fontWeight: '600',
  },
});
