import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useSession } from '@/hooks/useSession';

export default function TabLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="exercises" options={{ title: 'Ejercicios' }} />
      <Tabs.Screen name="exercises/new" options={{ href: null }} />
      <Tabs.Screen name="routines" options={{ title: 'Rutinas' }} />
      <Tabs.Screen name="routines/new" options={{ href: null }} />
      <Tabs.Screen name="routines/[id]" options={{ href: null }} />
      <Tabs.Screen name="routines/add-exercise" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
