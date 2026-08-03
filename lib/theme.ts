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
  h1: { fontFamily: 'Montserrat_800ExtraBold', fontSize: 28, fontWeight: '800' as const },
  h2: { fontFamily: 'Montserrat_700Bold', fontSize: 24, fontWeight: '700' as const },
  h3: { fontFamily: 'Montserrat_600SemiBold', fontSize: 18, fontWeight: '700' as const },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontFamily: 'Inter_600SemiBold', fontSize: 16, fontWeight: '600' as const },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 14, fontWeight: '400' as const },
  captionBold: { fontFamily: 'Inter_600SemiBold', fontSize: 14, fontWeight: '600' as const },
  small: { fontFamily: 'Inter_500Medium', fontSize: 13, fontWeight: '400' as const },
} as const;

export const lightColors = {
  // Teal profundo de marca — funciona como texto/icono sobre bg (9.17:1 AAA)
  primary: '#004643',
  // Acento claro — track del Switch; el thumb primary mantiene 7.25:1 sobre él
  primaryLight: '#5EEAD4',
  // Fondo de botón secundario — texto blanco encima (5.47:1 AA)
  primarySecondaryBg: '#0F766E',
  // Tinte teal claro para chips/estados seleccionados (texto oscuro encima)
  primaryBg: '#E3F1EE',
  // Neutros cálidos (escala stone) sobre bg #F0EDE5
  text: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#78716C',
  textPlaceholder: '#A8A29E',
  textTertiary: '#78716C',
  textOnPrimary: '#FFFFFF',
  bg: '#F0EDE5',
  bgWhite: '#FFFFFF',
  bgLight: '#F7F4EE',
  border: '#D6D3D1',
  borderLight: '#E7E5E4',
  // Semánticos oscurecidos un paso para cumplir AA sobre el nuevo bg
  error: '#B91C1C',
  errorText: '#991B1B',
  errorBg: '#FEF2F2',
  success: '#166534',
  successText: '#14532D',
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