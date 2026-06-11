// Luxury Keyboard Themes — Premium Design System
// Focused on: Ember - Dying fire on cold coal

export interface KeyboardTheme {
  id: string;
  name: string;
  category: 'dark' | 'light' | 'neutral';

  // Main colors
  backgroundColor: string;
  keyBackgroundColor: string;
  keyTextColor: string;
  specialKeyBackgroundColor: string;
  specialKeyTextColor: string;

  // Details
  keyBorderColor?: string;
  keyBorderWidth?: number;
  keyShadowColor?: string;
  keyShadowOpacity?: number;
  keyShadowRadius?: number;
  keyShadowOffset?: { width: number; height: number };

  // Typography
  keyFontSize?: number;
  keyFontWeight?: '500' | '600' | '700';

  // Spacing & sizing
  keyCornerRadius?: number;
  keyScaleOnPress?: number;

  // Special elements
  spaceKeyColor?: string;
  spaceLabelColor?: string;
  cursorColor?: string;

  // Description for UI display
  description: string;
  inspiration: string;
}

export const luxuryKeyboardThemes: Record<string, KeyboardTheme> = {

  // ────────────────────────────────────────────────────────────────
  // EMBER — Dying fire on cold coal
  // ────────────────────────────────────────────────────────────────
  ember: {
    id: 'ember',
    name: 'Ember',
    category: 'dark',
    backgroundColor: '#0F0A08',
    keyBackgroundColor: '#2E1A0E',
    keyTextColor: '#FF6B2B',
    specialKeyBackgroundColor: '#1A0F0A',
    specialKeyTextColor: '#FF8B4D',
    keyBorderColor: '#FF6B2B',
    keyBorderWidth: 0.5,
    keyShadowColor: '#000000',
    keyShadowOpacity: 0.4,
    keyShadowRadius: 3,
    keyShadowOffset: { width: 0, height: 1 },
    keyCornerRadius: 8,
    keyScaleOnPress: 0.96,
    spaceKeyColor: '#8B4513',
    spaceLabelColor: '#D4A574',
    cursorColor: '#FF6B2B',
    description: 'Embers on coal',
    inspiration: 'Sönen ateşin son koru',
  },
};

// Default theme
export const defaultTheme = luxuryKeyboardThemes.ember;

// Get all theme IDs
export const themeIds = Object.keys(luxuryKeyboardThemes) as Array<keyof typeof luxuryKeyboardThemes>;

// Get theme by ID
export const getTheme = (id: string): KeyboardTheme | null => {
  return luxuryKeyboardThemes[id as keyof typeof luxuryKeyboardThemes] || null;
};

// Group themes by category
export const themesByCategory = {
  dark: themeIds.filter(id => luxuryKeyboardThemes[id].category === 'dark'),
  light: themeIds.filter(id => luxuryKeyboardThemes[id].category === 'light'),
  neutral: themeIds.filter(id => luxuryKeyboardThemes[id].category === 'neutral'),
};
