import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorScreenProps {
  message: string;
}

export const ErrorScreen = memo(function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <View style={styles.centered}>
      <Text style={styles.text}>{message}</Text>
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
  text: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
