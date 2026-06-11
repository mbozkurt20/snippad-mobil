import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { tr } from './tr';
import { en } from './en';
import { ar } from './ar';

export type Lang = 'tr' | 'en' | 'ar';
export type Translations = typeof tr;

const strings: Record<Lang, Translations> = { tr, en, ar };

/**
 * Apply RTL/LTR direction for the given language.
 * When the direction actually changes, the app must restart for the new
 * layout to take effect — I18nManager.forceRTL alone is not enough.
 * Returns true if a restart was triggered.
 */
export function applyLangDirection(lang: Lang): boolean {
  const shouldRTL = lang === 'ar';
  if (I18nManager.isRTL !== shouldRTL) {
    I18nManager.forceRTL(shouldRTL);
    // Restart the JS bundle so the new layout direction is fully applied
    try {
      // expo-updates reloadAsync is the recommended way in Expo
      const Updates = require('expo-updates');
      Updates.reloadAsync().catch(() => {});
    } catch {
      // Fallback: NativeModules DevSettings (works in debug, no-op in prod)
      try {
        const { DevSettings } = require('react-native');
        DevSettings?.reload?.();
      } catch {}
    }
    return true;
  }
  return false;
}

export function detectLang(): Lang {
  const locale = getLocales()[0]?.languageCode ?? 'tr';
  if (locale === 'tr') return 'tr';
  if (locale === 'ar') return 'ar';
  return 'en';
}

// Reactive hook — components re-render automatically when language changes.
export function useT(): Translations {
  const lang = useAppStore(s => s.appLanguage);
  return strings[lang] ?? strings.tr;
}

// Non-reactive helper for use outside React (store actions, utilities).
// Pass the current language explicitly.
export function getT(lang: Lang): Translations {
  return strings[lang] ?? strings.tr;
}
