/**
 * KEYBOARD CONFIG SYNC
 *
 * Handles serialization and synchronization of keyboard configuration
 * from keyboardConfig.ts to native extensions (iOS + Android).
 *
 * Called at:
 * - App boot (useAppStore.boot)
 * - Theme change (useAppStore.setKeyboardTheme)
 */

import { mmkvStorage } from '../store/storage';
import {
  serializeKeyboardConfig,
  serializeKeyboardTheme,
  getTheme,
  DEFAULT_THEME_ID,
} from './keyboardConfig';

/**
 * Initialize keyboard configuration on app boot.
 * Syncs metrics, layouts, and current theme to native extensions.
 */
export function initializeKeyboardConfig(): void {
  try {
    // Sync keyboard metrics & layouts (once per app session)
    const configJson = serializeKeyboardConfig();
    mmkvStorage.setKeyboardConfig(configJson);
    console.log('[KeyboardConfig] ✓ Config synced to native extensions');
  } catch (error) {
    console.error('[KeyboardConfig] Failed to sync config:', error);
  }
}

/**
 * Change active keyboard theme and sync to native extensions.
 * @param themeId Theme ID from KEYBOARD_THEMES
 */
export function syncKeyboardTheme(themeId: string): void {
  try {
    const theme = getTheme(themeId);
    if (!theme) {
      console.warn('[KeyboardTheme] Theme not found:', themeId);
      return;
    }

    // Serialize full theme object (not just ID)
    const themeJson = serializeKeyboardTheme(themeId);

    // Sync to native extensions
    mmkvStorage.setKeyboardTheme(themeJson);

    // Save theme ID for app UI
    mmkvStorage.setKeyboardThemeId(themeId);

    console.log('[KeyboardTheme] ✓ Theme synced:', themeId);
  } catch (error) {
    console.error('[KeyboardTheme] Failed to sync theme:', error);
  }
}

/**
 * Get currently active theme ID.
 */
export function getActiveThemeId(): string {
  return mmkvStorage.getKeyboardThemeId();
}

/**
 * Ensure a valid theme is loaded. If missing, fall back to default.
 */
export function ensureValidTheme(): string {
  const currentId = getActiveThemeId();
  const theme = getTheme(currentId);

  if (!theme) {
    console.warn('[KeyboardTheme] Invalid theme ID, falling back to default');
    syncKeyboardTheme(DEFAULT_THEME_ID);
    return DEFAULT_THEME_ID;
  }

  return currentId;
}
