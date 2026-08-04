/* eslint-disable no-undef */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@react-native-community/netinfo', () => {
  let listeners = new Set();
  let state = { isConnected: true, isInternetReachable: true };

  return {
    fetch: jest.fn(async () => state),
    addEventListener: jest.fn((callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }),
    __setState: (next) => {
      state = { ...state, ...next };
      for (const cb of listeners) cb(state);
    },
  };
});
