export const colors = {
  primary: '#FF5C00',
  primarySoft: '#FFF0E8',
  primaryDark: '#C24600',
  ink: '#0A0A0A',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  border: '#EBEBEB',
  textPrimary: '#0A0A0A',
  textSecondary: '#8A8A8A',
  textHint: '#B5B5B5',
  white: '#FFFFFF',
  danger: '#E5484D',
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6, lineHeight: 33 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 25 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  hint: { fontSize: 12, fontWeight: '400' as const, lineHeight: 17 },
  button: { fontSize: 15, fontWeight: '600' as const },
};

export const layout = {
  screenPadding: 22,
  radiusSm: 11,
  radiusMd: 16,
  radiusLg: 20,
  radiusPill: 28,
  buttonHeight: 56,
  inputHeight: 52,
  iconBox: 36,
  gap: { xs: 4, sm: 8, md: 12, lg: 18, xl: 24, xxl: 32 },
};

export type ColorKey = keyof typeof colors;
export type TypographyKey = keyof typeof typography;
