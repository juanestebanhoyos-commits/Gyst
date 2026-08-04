import { useSyncExternalStore } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  /** true si hay conexión activa. Desconocido/reachable null => optimista true. */
  isOnline: boolean;
  isInternetReachable: boolean | null;
}

// Estado inicial optimista: se asume online hasta que NetInfo diga lo contrario.
// Evita un parpadeo de "sin conexión" al arrancar la app estando online.
let current: NetworkStatus = { isOnline: true, isInternetReachable: null };

const listeners = new Set<() => void>();
let netInfoSubscribed = false;

function emit() {
  for (const listener of listeners) listener();
}

function applyState(state: NetInfoState) {
  // Solo isConnected: `isInternetReachable` da falsos negativos en emuladores
  // y redes con captive portal (reporta false con internet real). La fórmula
  // oficial de TanStack para RN es `!!state.isConnected`.
  const next: NetworkStatus = {
    isOnline: state.isConnected === true,
    isInternetReachable: state.isInternetReachable ?? null,
  };
  if (next.isOnline === current.isOnline) return;
  current = next;
  emit();
}

/**
 * Un solo listener global de NetInfo para toda la app.
 * Se registra de forma perezosa con el primer suscriptor.
 */
function ensureNetInfoListener() {
  if (netInfoSubscribed) return;
  netInfoSubscribed = true;

  NetInfo.addEventListener((state) => {
    applyState(state);
  });

  // Siembra el estado real lo antes posible (el listener de RN no emite el estado inicial).
  NetInfo.fetch()
    .then((state) => {
      if (state) applyState(state);
    })
    .catch(() => {});
}

export function subscribeNetwork(listener: () => void): () => void {
  listeners.add(listener);
  ensureNetInfoListener();
  return () => {
    listeners.delete(listener);
  };
}

export function getNetworkStatus(): NetworkStatus {
  return current;
}

/** Hook de estado de red con una sola suscripción compartida. */
export function useNetworkStatus(): NetworkStatus {
  return useSyncExternalStore(subscribeNetwork, getNetworkStatus, getNetworkStatus);
}
