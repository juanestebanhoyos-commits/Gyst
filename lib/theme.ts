import { useTheme } from '@/hooks/useTheme';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 20,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  captionBold: { fontSize: 14, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
} as const;

export const lightColors = {
  // Acento oscurecido (lime-600) — el lima puro del dark mode falla contraste sobre blanco
  primary: '#65A30D',
  primaryLight: '#A3E635',
  primaryBg: '#ECFCCB',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textPlaceholder: '#9CA3AF',
  textTertiary: '#6B7280',
  textOnPrimary: '#000000',
  bg: '#F3F4F6',
  bgWhite: '#FFFFFF',
  bgLight: '#F9FAFB',
  border: '#D1D5DB',
  borderLight: '#E5E7EB',
  error: '#DC2626',
  errorText: '#B91C1C',
  errorBg: '#FEF2F2',
  success: '#16A34A',
  successText: '#15803D',
  successBg: '#F0FDF4',
  shadow: '#000000',
} as const;

export const darkColors = {
  primary: '#caf300',        // primary-container: Electric Lime accent
  primaryLight: '#b0d500',   // primary-fixed-dim: dimmer lime variant
  primaryBg: '#2a2a2a',     // surface-container-high: elevated bg for primary-tinted areas
  text: '#e5e2e1',           // on-surface / on-background
  textSecondary: '#c5c9ac', // on-surface-variant
  textMuted: '#8f9378',     // outline
  textPlaceholder: '#444932', // outline-variant
  textTertiary: '#656464',  // on-tertiary-container
  textOnPrimary: '#2a3400', // on-primary
  bg: '#131313',             // surface / background
  bgWhite: '#1c1b1b',       // surface-container-low (cards)
  bgLight: '#201f1f',       // surface-container (elevated surfaces)
  border: '#353534',         // surface-container-highest / surface-variant (ghost borders)
  borderLight: '#444932',   // outline-variant
  error: '#ffb4ab',          // error
  errorText: '#ffdad6',     // on-error-container
  errorBg: '#93000a',       // error-container
  success: '#caf300',        // primary-container (brand: "Success mapped to Primary")
  successText: '#596c00',   // on-primary-container
  successBg: '#2a2a2a',     // surface-container-high
  shadow: '#000000',
} as const;

export type ThemeColors = typeof lightColors;

export function useAppTheme() {
  const { themePreference } = useTheme();
  const colors = themePreference === 'dark' ? darkColors : lightColors;
  return { colors, spacing, borderRadius, typography };
}