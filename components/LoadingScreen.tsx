import { memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingScreen = memo(function LoadingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
});

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
