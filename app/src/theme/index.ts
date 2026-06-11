// iPhone 17 Energetic Premium Orange — Design System
export const Colors = {
  // Primary — #FF6B1A (energik + matte quality)
  primary: '#FF6B1A',
  accent: '#FF6B1A',
  primaryLight: '#FFF5F0',
  primaryVeryLight: '#FFFAF8',
  gradient1: '#FF6B1A',
  gradient2: '#FF7A2E',
  gradient3: '#FF8C44',

  // Backgrounds & Surfaces (Light Mode)
  background: '#FFFFFF',
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  elevated: '#F5F5F5',
  surfaceHover: '#FAFAFA',
  cardLight: '#FAFAFA',
  cardLavender: '#F5F5F5',

  // Text (Light Mode: #060200)
  textPrimary: '#060200',
  textDark: '#060200',
  text: '#060200',
  textSecondary: '#424245',
  textGray: '#86868B',
  textMuted: '#86868B',
  textLight: '#86868B',
  lightGray: '#EFEFEF',

  // Utility
  white: '#FFFFFF',

  // Borders — orange tint per prompt
  border: 'rgba(255, 85, 0, 0.15)',
  borderLight: 'rgba(255, 85, 0, 0.15)',
  borderStrong: 'rgba(255, 85, 0, 0.25)',

  // Status Colors
  success: '#34C759',
  successBg: '#F0FDF4',
  danger: '#FF3B30',
  dangerBg: '#FFF5F4',
  warning: '#FF9500',

  // Category colors
  categoryColors: [
    '#FFF5F0', '#E0F2FE', '#FEF3C7', '#FEE2E2',
    '#F3E8FF', '#DBEAFE', '#FCE7F3', '#FFF7ED',
  ],
  categoryIconColors: [
    '#FF5500', '#0284C7', '#D97706', '#DC2626',
    '#7C3AED', '#2563EB', '#DB2777', '#EA580C',
  ],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 12,
  md: 18,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, fontFamily: 'Figtree', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, fontFamily: 'Figtree', letterSpacing: -0.4 },
  h3: { fontSize: 18, fontWeight: '700' as const, fontFamily: 'Figtree', letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, fontFamily: 'Figtree' },
  caption: { fontSize: 13, fontWeight: '400' as const, fontFamily: 'Figtree' },
  label: { fontSize: 12, fontWeight: '500' as const, fontFamily: 'Figtree', letterSpacing: 0.06 },
};

// Shadows — #FF6B1A energetic orange tint (premium, elevated, impactful)
export const Shadows = {
  card: {
    shadowColor: '#FF6B1A',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  button: {
    shadowColor: '#FF6B1A',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modal: {
    shadowColor: '#FF6B1A',
    shadowOpacity: 0.32,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
};
