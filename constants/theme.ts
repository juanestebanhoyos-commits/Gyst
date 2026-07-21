export const colors = {
  primary: '#2563eb',
  primaryLight: '#93c5fd',
  primaryBg: '#eff6ff',

  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textPlaceholder: '#9ca3af',

  bg: '#f9fafb',
  bgWhite: '#fff',
  bgLight: '#f3f4f6',

  border: '#d1d5db',
  borderLight: '#e5e7eb',

  error: '#dc2626',
  errorText: '#dc2626',
  errorBg: '#fef2f2',

  success: '#059669',
  successText: '#16a34a',
  successBg: '#f0fdf4',
} as const;

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
  lg: 12,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
} as const;
