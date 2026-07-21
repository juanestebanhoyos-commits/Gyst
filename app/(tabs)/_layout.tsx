import { Redirect, Tabs } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function TabLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) return <LoadingScreen />;

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ErrorBoundary>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
        <Tabs.Screen name="exercises" options={{ title: 'Ejercicios' }} />
        <Tabs.Screen name="exercises/new" options={{ href: null }} />
        <Tabs.Screen name="routines" options={{ title: 'Rutinas' }} />
        <Tabs.Screen name="routines/new" options={{ href: null }} />
        <Tabs.Screen name="routines/[id]" options={{ href: null }} />
        <Tabs.Screen name="routines/add-exercise" options={{ href: null }} />
        <Tabs.Screen name="routines/edit/[id]" options={{ href: null }} />
        <Tabs.Screen name="history" options={{ title: 'Historial' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      </Tabs>
    </ErrorBoundary>
  );
}

