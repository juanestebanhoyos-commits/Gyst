import { isNetworkError } from '../supabase-error';

describe('isNetworkError', () => {
  it('detecta "Failed to fetch"', () => {
    expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
  });

  it('detecta "Network request failed"', () => {
    expect(isNetworkError(new TypeError('Network request failed'))).toBe(true);
  });

  it('detecta "fetch failed" (Node 18+)', () => {
    expect(isNetworkError(new Error('fetch failed'))).toBe(true);
  });

  it('detecta errores con code NETWORK_ERROR', () => {
    expect(isNetworkError({ code: 'NETWORK_ERROR', message: 'x' })).toBe(true);
  });

  it('detecta errores con status 0', () => {
    expect(isNetworkError({ status: 0, message: 'x' })).toBe(true);
  });

  it('no clasifica errores de dominio (tabla inexistente)', () => {
    expect(
      isNetworkError({ code: '42P01', message: 'relation "x" does not exist' }),
    ).toBe(false);
  });

  it('no clasifica errores de RLS/permissions', () => {
    expect(
      isNetworkError({ code: '42501', message: 'new row violates row-level security policy' }),
    ).toBe(false);
  });

  it('no clasifica null/undefined', () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });

  it('no clasifica strings sueltas', () => {
    expect(isNetworkError('Failed to fetch')).toBe(false);
  });
});
