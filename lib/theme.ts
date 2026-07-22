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
  primary: '#D4FF17',
  primaryLight: '#E5FF6E',
  primaryBg: '#1A2E00',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#6B7280',
  textPlaceholder: '#4B5563',
  textTertiary: '#6B7280',
  textOnPrimary: '#000000',
  bg: '#0A0A0A',
  bgWhite: '#1C1C1C',
  bgLight: '#161616',
  border: '#333333',
  borderLight: '#262626',
  error: '#EF4444',
  errorText: '#FCA5A5',
  errorBg: '#450A0A',
  success: '#22C55E',
  successText: '#86EFAC',
  successBg: '#052E16',
  shadow: '#000000',
} as const;

export type ThemeColors = typeof lightColors;

export function useAppTheme() {
  const { themePreference } = useTheme();
  const colors = themePreference === 'dark' ? darkColors : lightColors;
  return { colors, spacing, borderRadius, typography };
}