import { Redirect, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppTheme } from '@/lib/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { session, isLoading } = useSession();
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle: { backgroundColor: colors.bgWhite, borderTopColor: colors.borderLight },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
  }), [colors]);

  if (isLoading) return <LoadingScreen />;

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ErrorBoundary>
      <Tabs screenOptions={screenOptions}>
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

