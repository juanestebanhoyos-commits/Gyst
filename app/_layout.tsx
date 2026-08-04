import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineProvider } from '@/providers/OfflineProvider';
import {
  createAppQueryClient,
  hydrateQueryCache,
  connectOnlineManager,
} from '@/lib/offline/queryClient';

SplashScreen.preventAutoHideAsync();

// En React Native no existen los eventos online/offline del DOM: sin esto,
// offlineFirst nunca pausaría los reintentos y las queries no servirían caché.
connectOnlineManager();

const queryClient = createAppQueryClient();
// Hidratación de caché en nivel de módulo: se ejecuta una sola vez
// (aunque el layout se remonte) y no bloquea nada si falla.
const cacheHydration = hydrateQueryCache(queryClient);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    cacheHydration.then(() => {
      if (!cancelled) setCacheReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded && cacheReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, cacheReady]);

  if (!fontsLoaded || !cacheReady) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OfflineProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </OfflineProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
