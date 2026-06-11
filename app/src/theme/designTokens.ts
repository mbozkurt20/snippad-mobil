// Strict design system tokens — 8 colors only, no interpretation
export const colors = {
  primary: '#FF5C00',        // Turuncu — CTA, aktif progress, vurgular
  ink: '#0A0A0A',            // Siyah — ana metin (saf #000 YASAK)
  surface: '#FFFFFF',        // Beyaz — arkaplan
  surfaceAlt: '#F5F5F5',     // Açık gri — secondary bg, disabled state
  border: '#EBEBEB',         // Border rengi
  textSecondary: '#8A8A8A',  // İkincil metin
  textHint: '#B5B5B5',       // İpucu, yasal metin
  primarySoft: '#FFF0E8',    // Turuncu zemin — sadece ikon kutuları için
};

// Sector pack category colors — visual distinction for sector templates
export const categoryColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6B7280', // Gray
  '#6366F1', // Indigo
  '#0EA5E9', // Sky Blue
];

// Status feedback colors
export const statusColors = {
  success: categoryColors[1],        // Green for success
  successBg: '#ECFDF5',              // Light green background
  error: categoryColors[5],          // Red for error
  errorBg: '#FEF2F2',                // Light red background
};

// Shadow colors for depth system
export const shadowColors = {
  default: colors.ink,           // Default key shadow
  accentDark: '#782800',         // Dark orange-brown for accent keys
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    lineHeight: 1.15,
    textAlign: 'left' as const,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 1.5,
    color: colors.textSecondary,
    textAlign: 'left' as const,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 1.3,
  },
  listRow: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 1.4,
    color: colors.ink,
  },
  legal: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    color: colors.textHint,
  },
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  horizontalPadding: 22, // Yatay kenar boşluğu — tutarlı her yerde
};

export const radius = {
  button: 28, // Tam pill
  card: 18,
  selection: 18,
  smallIcon: 11,
  iconBox: 11,
};

export const animation = {
  screenTransition: 300,
  transition: 200,
  staggerDelay: 50,
};

export const insets = {
  safeAreaBottom: 16, // Safe area bottom padding
};
