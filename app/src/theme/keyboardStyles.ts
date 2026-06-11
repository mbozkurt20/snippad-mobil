// Keyboard StyleSheet Generator for Luxury Themes
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { KeyboardTheme } from './luxuryKeyboardThemes';

export interface KeyboardStyles {
  container: ViewStyle;
  keyboardBg: ViewStyle;
  key: ViewStyle;
  keyText: TextStyle;
  specialKey: ViewStyle;
  specialKeyText: TextStyle;
  spaceKey: ViewStyle;
  spaceKeyLabel: TextStyle;
  deleteKey: ViewStyle;
  returnKey: ViewStyle;
  shiftKey: ViewStyle;
  keyPressed: ViewStyle;
}

/**
 * Generate keyboard styles from theme configuration
 * Implements luxury material design principles:
 * - Matte surfaces with depth
 * - Realistic shadows
 * - Smooth press animations
 * - Premium typography
 */
export function createKeyboardStyles(theme: KeyboardTheme): KeyboardStyles {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
      paddingHorizontal: 6,
      paddingVertical: 4,
    } as ViewStyle,

    keyboardBg: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    } as ViewStyle,

    // ─── Standard Letter Key ────────────────────────────────────────
    key: {
      backgroundColor: theme.keyBackgroundColor,
      borderRadius: theme.keyCornerRadius || 8,
      borderColor: theme.keyBorderColor || 'transparent',
      borderWidth: theme.keyBorderWidth || 0,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      minWidth: 44,

      // Shadow effect — matte depth
      shadowColor: theme.keyShadowColor || '#000000',
      shadowOpacity: theme.keyShadowOpacity || 0.15,
      shadowRadius: theme.keyShadowRadius || 2,
      shadowOffset: theme.keyShadowOffset || { width: 0, height: 1 },
      elevation: 2,
    } as ViewStyle,

    keyText: {
      color: theme.keyTextColor,
      fontSize: theme.keyFontSize || 15,
      fontWeight: theme.keyFontWeight || '500',
      textAlign: 'center',
      includeFontPadding: false,
    } as TextStyle,

    // ─── Special Keys (Delete, Return, Shift, Space) ────────────────
    specialKey: {
      backgroundColor: theme.specialKeyBackgroundColor,
      borderRadius: theme.keyCornerRadius || 8,
      borderColor: theme.keyBorderColor || 'transparent',
      borderWidth: theme.keyBorderWidth || 0,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      minWidth: 44,

      shadowColor: theme.keyShadowColor || '#000000',
      shadowOpacity: (theme.keyShadowOpacity || 0.15) * 1.2,
      shadowRadius: theme.keyShadowRadius || 2,
      shadowOffset: theme.keyShadowOffset || { width: 0, height: 1 },
      elevation: 2,
    } as ViewStyle,

    specialKeyText: {
      color: theme.specialKeyTextColor,
      fontSize: theme.keyFontSize || 15,
      fontWeight: theme.keyFontWeight || '500',
      textAlign: 'center',
      includeFontPadding: false,
    } as TextStyle,

    // ─── Space Key ──────────────────────────────────────────────────
    spaceKey: {
      backgroundColor: theme.spaceKeyColor || theme.specialKeyBackgroundColor,
      borderRadius: theme.keyCornerRadius || 8,
      borderColor: theme.keyBorderColor || 'transparent',
      borderWidth: theme.keyBorderWidth || 0,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      flex: 1,

      shadowColor: theme.keyShadowColor || '#000000',
      shadowOpacity: (theme.keyShadowOpacity || 0.15) * 1.2,
      shadowRadius: theme.keyShadowRadius || 2,
      shadowOffset: theme.keyShadowOffset || { width: 0, height: 1 },
      elevation: 2,
    } as ViewStyle,

    spaceKeyLabel: {
      color: theme.spaceLabelColor || theme.keyTextColor,
      fontSize: (theme.keyFontSize || 15) * 0.85,
      fontWeight: '600',
      textAlign: 'center',
      includeFontPadding: false,
    } as TextStyle,

    // ─── Delete Key ─────────────────────────────────────────────────
    deleteKey: {
      backgroundColor: theme.specialKeyBackgroundColor,
      borderRadius: theme.keyCornerRadius || 8,
      borderColor: theme.keyBorderColor || 'transparent',
      borderWidth: theme.keyBorderWidth || 0,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      minWidth: 54,

      shadowColor: theme.keyShadowColor || '#000000',
      shadowOpacity: (theme.keyShadowOpacity || 0.15) * 1.3,
      shadowRadius: theme.keyShadowRadius || 2,
      shadowOffset: theme.keyShadowOffset || { width: 0, height: 1 },
      elevation: 2,
    } as ViewStyle,

    // ─── Return Key ─────────────────────────────────────────────────
    returnKey: {
      backgroundColor: theme.specialKeyBackgroundColor,
      borderRadius: theme.keyCornerRadius || 8,
      borderColor: theme.keyBorderColor || 'transparent',
      borderWidth: theme.keyBorderWidth || 0,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      minWidth: 54,

      shadowColor: theme.keyShadowColor || '#000000',
      shadowOpacity: (theme.keyShadowOpacity || 0.15) * 1.3,
      shadowRadius: theme.keyShadowRadius || 2,
      shadowOffset: theme.keyShadowOffset || { width: 0, height: 1 },
      elevation: 2,
    } as ViewStyle,

    // ─── Shift Key ──────────────────────────────────────────────────
    shiftKey: {
      backgroundColor: theme.specialKeyBackgroundColor,
      borderRadius: theme.keyCornerRadius || 8,
      borderColor: theme.keyBorderColor || 'transparent',
      borderWidth: theme.keyBorderWidth || 0,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 44,
      minWidth: 54,

      shadowColor: theme.keyShadowColor || '#000000',
      shadowOpacity: (theme.keyShadowOpacity || 0.15) * 1.3,
      shadowRadius: theme.keyShadowRadius || 2,
      shadowOffset: theme.keyShadowOffset || { width: 0, height: 1 },
      elevation: 2,
    } as ViewStyle,

    // ─── Pressed State ──────────────────────────────────────────────
    // Applied with Animated.style on press
    keyPressed: {
      transform: [{ scale: theme.keyScaleOnPress || 0.96 }],
      opacity: 0.9,
    } as ViewStyle,
  });
}

/**
 * Styles for keyboard theme selector UI
 */
export const themeDisplayStyles = StyleSheet.create({
  themeButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  } as ViewStyle,

  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  } as TextStyle,

  themePreview: {
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  } as ViewStyle,

  themePreviewRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  } as ViewStyle,

  themePreviewKey: {
    width: 24,
    height: 24,
    borderRadius: 6,
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  } as ViewStyle,
});

/**
 * Animation configuration for key press
 */
export const keyPressAnimationConfig = {
  duration: 80,
  useNativeDriver: true,
  bounciness: 8,
  speed: 20,
};

/**
 * Generate cursor color based on theme
 */
export function getCursorColor(theme: KeyboardTheme): string {
  return theme.cursorColor || theme.keyTextColor;
}
