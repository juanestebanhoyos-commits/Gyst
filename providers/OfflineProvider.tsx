import { useEffect, useRef, type ReactNode } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/lib/offline/network';
import { flushPending, dropOutbox, type FlushSupabase } from '@/lib/offline/outbox';
import { CACHE_KEY } from '@/lib/offline/queryClient';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineBanner } from '@/components/OfflineBanner';

/**
 * Orquesta la capa offline: muestra el banner y lanza el flush del outbox
 * cuando hay conexión (al arrancar con pendientes, al reconectar o al
 * cambiar de usuario). Se monta una sola vez en el layout raíz.
 *
 * Aislamiento multi-usuario (dispositivo compartido): al cerrar sesión o al
 * entrar con una cuenta distinta, se descartan la caché persistida y el
 * outbox para que los datos de una cuenta no queden visibles en otra.
 */
export function OfflineProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useNetworkStatus();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const lastOnlineRef = useRef(isOnline);
  // Último usuario VISTO (persiste entre renders; no se resetea a null).
  // Cierra el hueco logout→login incompleto: si el SIGNED_OUT se pierde (app
  // matada a mitad del signOut) pero entra otra cuenta, se limpia igual.
  const knownUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        void clearAccountData(queryClient).catch(() => {});
      }
    });
    return () => subscription.data.subscription.unsubscribe();
  }, [queryClient]);

  useEffect(() => {
    const wasOnline = lastOnlineRef.current;
    const wasUser = knownUserIdRef.current;
    lastOnlineRef.current = isOnline;
    if (user?.id) knownUserIdRef.current = user.id;

    const cameOnline = isOnline && !wasOnline;
    const userLoaded = !!user;
    // Cambio real de cuenta (wasUser !== null): el primer load (null -> user)
    // NO limpia, para no descartar la caché hidratada al arrancar.
    const switchedUser = userLoaded && wasUser !== null && user.id !== wasUser;

    if (switchedUser) {
      void clearAccountData(queryClient).catch(() => {});
    }
    if (cameOnline || (userLoaded && user.id !== wasUser)) {
      void runFlush(queryClient, user?.id).catch(() => {});
    }
  }, [isOnline, user, queryClient]);

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}

/** Descarta caché persistida y outbox: los datos son por usuario. */
async function clearAccountData(queryClient: QueryClient) {
  await Promise.allSettled([
    AsyncStorage.removeItem(CACHE_KEY),
    dropOutbox(),
  ]);
  queryClient.clear();
}

async function runFlush(queryClient: QueryClient, userId?: string) {
  const result = await flushPending({
    supabase: supabase as unknown as FlushSupabase,
    userId,
  });
  if (result.skipped) return;

  // Invalidación acotada: solo los prefijos tocados por el flush.
  for (const key of result.touched) {
    queryClient.invalidateQueries({ queryKey: key });
  }
}
