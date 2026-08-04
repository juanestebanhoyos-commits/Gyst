import { renderHook, act } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus, getNetworkStatus, subscribeNetwork } from '../network';

const mockNetInfo = NetInfo as unknown as {
  addEventListener: jest.Mock;
  fetch: jest.Mock;
  __setState: (next: Record<string, unknown>) => void;
};

describe('network store', () => {
  beforeEach(() => {
    mockNetInfo.addEventListener.mockClear();
    mockNetInfo.fetch.mockClear();
  });

  it('suscripción inicial reporta el estado actual de NetInfo', async () => {
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    const status = getNetworkStatus();
    expect(status.isOnline).toBe(true);
  });

  it('notifica el paso a offline y vuelta a online', async () => {
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      mockNetInfo.__setState({ isConnected: false, isInternetReachable: false });
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      mockNetInfo.__setState({ isConnected: true, isInternetReachable: true });
    });
    expect(result.current.isOnline).toBe(true);
  });

  it('trata reachability desconocida como online (optimista)', () => {
    mockNetInfo.__setState({ isConnected: true, isInternetReachable: null });
    expect(getNetworkStatus().isOnline).toBe(true);
  });

  it('registra un solo listener de NetInfo aunque haya varios suscriptores', () => {
    mockNetInfo.addEventListener.mockClear();
    jest.isolateModules(() => {
      const network = require('../network');
      network.subscribeNetwork(() => {});
      network.subscribeNetwork(() => {});
      network.subscribeNetwork(() => {});
      expect(mockNetInfo.addEventListener).toHaveBeenCalledTimes(1);
    });
  });

  it('devuelve el snapshot correcto a suscriptores al cambiar', async () => {
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    const seen: boolean[] = [];
    const unsub = subscribeNetwork(() => seen.push(getNetworkStatus().isOnline));
    act(() => {
      mockNetInfo.__setState({ isConnected: false, isInternetReachable: false });
    });
    expect(seen[seen.length - 1]).toBe(false);
    unsub();
  });
});
