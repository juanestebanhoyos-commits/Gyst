import * as Crypto from 'expo-crypto';
import { randomUuid } from '../uuid';

describe('randomUuid', () => {
  it('genera un UUID con formato v4 válido', () => {
    const id = randomUuid();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('genera IDs distintos en llamadas consecutivas', () => {
    const a = randomUuid();
    const b = randomUuid();
    expect(a).not.toBe(b);
  });

  it('delega en expo-crypto', () => {
    const cryptoSpy = jest.spyOn(Crypto, 'randomUUID');
    randomUuid();
    expect(cryptoSpy).toHaveBeenCalledTimes(1);
    cryptoSpy.mockRestore();
  });

  it('genera un UUID v4 válido con el fallback si expo-crypto no responde', () => {
    const cryptoSpy = jest.spyOn(Crypto, 'randomUUID').mockReturnValue(undefined as never);
    for (let i = 0; i < 50; i++) {
      const id = randomUuid();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    }
    cryptoSpy.mockRestore();
  });
});
