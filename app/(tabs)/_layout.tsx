import { Redirect, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Clock, Dumbbell, Home, ClipboardList, User } from 'lucide-react-native';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppTheme } from '@/lib/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { session, isLoading } = useSession();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.bg,
        borderTopColor: colors.border,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
    }),
    [colors],
  );

  if (isLoading) return <LoadingScreen />;

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ErrorBoundary>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="exercises"
          options={{
            title: 'Exercise',
            tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            title: 'Routines',
            tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        {/* Hidden screens */}
        <Tabs.Screen name="exercises/new" options={{ href: null }} />
        <Tabs.Screen name="routines/new" options={{ href: null }} />
        <Tabs.Screen name="routines/[id]" options={{ href: null }} />
        <Tabs.Screen name="routines/add-exercise" options={{ href: null }} />
        <Tabs.Screen name="routines/edit/[id]" options={{ href: null }} />
      </Tabs>
    </ErrorBoundary>
  );
}
