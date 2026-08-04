import { QueryClient, onlineManager } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clave versionada: subir la versión descarta cachés incompatibles.
// Exportada para limpiarla al cerrar sesión (aislamiento multi-usuario).
export const CACHE_KEY = '@gyst_cache_v1';
const CACHE_BUSTER = 'v1';
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * QueryClient de la app.
 * - `networkMode: 'offlineFirst'` en queries Y mutations: online se comporta
 *   igual que hoy (refetch al montar); offline las queries sirven la caché
 *   persistida y las mutations ejecutan su camino offline (outbox) en vez de
 *   pausarse. Sin esto, con el onlineManager offline las mutations quedan
 *   pendientes para siempre (isPending infinito). Sin cambios de staleTime.
 * - `retry` queda en el default para no alterar el comportamiento online.
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'offlineFirst',
      },
      mutations: {
        networkMode: 'offlineFirst',
      },
    },
  });
}

/**
 * Conecta el `onlineManager` de TanStack Query a NetInfo. En React Native no
 * existen los eventos `online`/`offline` del DOM, así que sin esto
 * `networkMode: 'offlineFirst'` nunca pausaría los reintentos y las queries
 * fallarían offline en vez de servirse desde la caché. El callback debe
 * devolver la función de desuscripción; se llama una sola vez desde el layout.
 */
export function connectOnlineManager(): void {
  // Solo isConnected (fórmula oficial de TanStack para RN): isInternetReachable
  // da falsos negativos en emuladores y captive portals. NetInfoSubscription
  // es `() => void`: la suscripción es la desuscripción.
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected === true);
    }),
  );
}

/**
 * Restaura la caché persistida en AsyncStorage y suscribe la persistencia
 * de cambios (throttleada a 1s). Debe resolverse antes de ocultar el splash
 * para evitar flicker de pantallas vacías al arrancar sin conexión.
 */
export async function hydrateQueryCache(queryClient: QueryClient): Promise<void> {
  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: CACHE_KEY,
    throttleTime: 1000,
  });

  try {
    await persistQueryClient({
      queryClient,
      persister,
      maxAge: CACHE_MAX_AGE_MS,
      buster: CACHE_BUSTER,
    });
  } catch {
    // Caché corrupta o storage no disponible: arrancar sin caché
    // (persistQueryClient ya elimina los datos corruptos internamente).
  }
}
