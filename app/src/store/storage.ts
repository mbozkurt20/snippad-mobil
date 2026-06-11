import { Platform, NativeModules, Linking } from 'react-native';

// Web ortamında react-native-mmkv yüklenmez — localStorage ile stub kullan
let createMMKV: typeof import('react-native-mmkv').createMMKV;
if (Platform.OS === 'web') {
  createMMKV = (({ id }: { id: string }) => {
    const prefix = `mmkv_${id}_`;
    return {
      getString:   (k: string) => { try { return localStorage.getItem(prefix + k) ?? undefined; } catch { return undefined; } },
      set:         (k: string, v: string | boolean | number) => { try { localStorage.setItem(prefix + k, String(v)); } catch {} },
      remove:      (k: string) => { try { localStorage.removeItem(prefix + k); } catch {} },
      getBoolean:  (k: string) => { try { const v = localStorage.getItem(prefix + k); return v === null ? undefined : v === 'true'; } catch { return undefined; } },
      getNumber:   (k: string) => { try { const v = localStorage.getItem(prefix + k); return v === null ? undefined : Number(v); } catch { return undefined; } },
      clearAll:    () => { try { Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k)); } catch {} },
    };
  }) as unknown as typeof import('react-native-mmkv').createMMKV;
} else {
  createMMKV = require('react-native-mmkv').createMMKV;
}

// ── Encryption key management ──────────────────────────────────────────────────
//
// We use a two-MMKV approach:
//   1. `keyring`  — small, unencrypted, stores only the random key for `storage`
//   2. `storage`  — AES-128-CFB encrypted (react-native-mmkv built-in)
//
// The keyring itself is OS-sandboxed (inaccessible to other apps without root/jailbreak).
// The main storage is AES-128 encrypted on top of that sandboxing.

const keyring = createMMKV({ id: 'pk-keyring' });

function getOrCreateStorageKey(): string {
  let key = keyring.getString('storage_key');
  if (!key) {
    // Generate a 40-char pseudo-random key, stored permanently in keyring
    const part1 = Date.now().toString(36);
    const part2 = Math.random().toString(36).slice(2, 12);
    const part3 = Math.random().toString(36).slice(2, 12);
    const part4 = Math.random().toString(36).slice(2, 12);
    key = `pk_${part1}_${part2}_${part3}_${part4}`;
    keyring.set('storage_key', key);
  }
  return key;
}

// Main storage — AES-128-CFB encrypted via react-native-mmkv
export const storage = createMMKV({
  id: 'pk-storage',
  encryptionKey: getOrCreateStorageKey(),
});

// ── Shared keyboard data helpers ──────────────────────────────────────────────
//
// The keyboard extension (iOS UserDefaults App Group / Android SharedPreferences)
// must read the template data in its own process.  We can't share the MMKV
// encryption key across the extension boundary without exposing it.
//
// Solution: encode the JSON with base64 before writing to shared storage.
// This prevents casual reading (backup tools, file managers on rooted devices).
// The extension decodes before parsing.  True AES here would require a native
// crypto module in both the extension and the main app — add as a future step.

function encodeForExtension(json: string): string {
  try {
    // encodeURIComponent → safe UTF-8 escape → btoa → base64
    return btoa(encodeURIComponent(json));
  } catch {
    return json;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeFromExtension(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return encoded;
  }
}

function syncShared(key: string, encodedValue: string) {
  if (Platform.OS !== 'android') return;
  try { NativeModules.SharedPrefs?.set('klavyem_shared', key, encodedValue); } catch {}
}

// Clipboard geçmişini keyboard extension'a yazar (iOS: App Group, Android: SharedPrefs)
function _syncClipboardToExtension(history: import('../types').ClipboardItem[]) {
  try {
    const slim = history.map(i => ({ title: i.title, content: i.content }));
    const encoded = encodeForExtension(JSON.stringify(slim));
    if (Platform.OS === 'ios') {
      NativeModules.SharedPrefs?.setAppGroupString?.('clipboard_history', encoded);
    } else {
      NativeModules.SharedPrefs?.set('klavyem_shared', 'clipboard_history', encoded);
    }
  } catch {}
}

// ── Public API ─────────────────────────────────────────────────────────────────

export const mmkvStorage = {
  // API auth token
  getToken:    ()            => storage.getString('api_token'),
  setToken:    (t: string)   => storage.set('api_token', t),
  clearToken:  ()            => storage.remove('api_token'),

  // Device ID
  getDeviceId: ()            => storage.getString('device_id'),
  setDeviceId: (id: string)  => storage.set('device_id', id),

  // ── UNIFIED KEYBOARD LAYOUT CONFIG (from keyboardLayout.ts) ────────────
  // Single source of truth: Preview + iOS + Android all read this
  setKeyboardLayoutConfig: (configJson: string) => {
    storage.set('keyboard_layout_config', configJson);     // AES-encrypted in MMKV
    const encoded = encodeForExtension(configJson);
    // Android: SharedPreferences
    syncShared('keyboard_layout_config', encoded);
    // iOS: App Group UserDefaults
    if (Platform.OS === 'ios') {
      try { NativeModules.SharedPrefs?.setAppGroupString?.('keyboard_layout_config', encoded); } catch {}
    }
  },
  getKeyboardLayoutConfig: () => storage.getString('keyboard_layout_config'),

  // Keyboard IME cache — stored encrypted in MMKV, encoded for extension
  setKeyboardData: (data: string) => {
    storage.set('keyboard_data', data);                   // AES-encrypted in MMKV
    const encoded = encodeForExtension(data);
    syncShared('keyboard_data', encoded);                 // base64 for Android extension
    // iOS: write encoded to App Group UserDefaults (handled by native module if present)
    if (Platform.OS === 'ios') {
      try { NativeModules.SharedPrefs?.setKeyboardData(encoded); } catch {}
    }
  },
  getKeyboardData: () => storage.getString('keyboard_data'),

  // ── UNIFIED KEYBOARD CONFIG & THEME (from keyboardConfig.ts) ──────────────
  // Single source of truth: serialized JSON synced to iOS + Android
  setKeyboardConfig: (configJson: string) => {
    storage.set('keyboard_config_json', configJson);
    const encoded = encodeForExtension(configJson);
    syncShared('keyboard_config_json', encoded);
    if (Platform.OS === 'ios') {
      try { NativeModules.SharedPrefs?.setAppGroupString?.('keyboard_config_json', encoded); } catch {}
    }
  },
  getKeyboardConfig: () => storage.getString('keyboard_config_json'),

  // Keyboard theme — full theme object (not just ID)
  setKeyboardTheme: (themeJson: string) => {
    storage.set('keyboard_theme_json', themeJson);
    const encoded = encodeForExtension(themeJson);
    syncShared('keyboard_theme_json', encoded);
    if (Platform.OS === 'ios') {
      try { NativeModules.SharedPrefs?.setAppGroupString?.('keyboard_theme_json', encoded); } catch {}
    }
  },
  getKeyboardTheme: () => storage.getString('keyboard_theme_json'),

  // Legacy: theme ID for app-layer storage (separate from sync)
  setKeyboardThemeId: (themeId: string) => {
    storage.set('keyboard_theme_id', themeId);
  },
  getKeyboardThemeId: () => storage.getString('keyboard_theme_id') ?? 'klasik',

  // User plan (for IME emoji gating)
  setUserPlan: (plan: string) => {
    storage.set('user_plan', plan);
    if (Platform.OS === 'android') {
      try { NativeModules.SharedPrefs?.set('klavyem_shared', 'user_plan', plan); } catch {}
    } else if (Platform.OS === 'ios') {
      // Write to App Group UserDefaults so extension reads it directly
      try { NativeModules.SharedPrefs?.setAppGroupString?.('user_plan', plan); } catch {}
    }
  },
  getUserPlan: () => storage.getString('user_plan') ?? 'basic',

  // Offline usage queue
  getPendingUsage:   ()             => storage.getString('pending_usage'),
  setPendingUsage:   (data: string) => storage.set('pending_usage', data),
  clearPendingUsage: ()             => storage.remove('pending_usage'),

  // Onboarding completion flag
  getOnboardingCompleted: () => storage.getBoolean('onboarding_completed') ?? false,
  setOnboardingCompleted: (v: boolean) => storage.set('onboarding_completed', v),

  // 7-günlük ücretsiz deneme başlangıç zamanı
  getTrialStartedAt: () => {
    const v = storage.getString('trial_started_at');
    return v ? parseInt(v, 10) : null;
  },
  setTrialStartedAt: (ts: number | null) => {
    if (ts === null) {
      storage.remove('trial_started_at');
    } else {
      storage.set('trial_started_at', String(ts));
    }
  },

  // Web sign-in device code
  getDeviceCode: () => storage.getString('device_code') ?? null,
  setDeviceCode: (code: string) => storage.set('device_code', code),
  getLastSyncAt: () => storage.getString('last_sync_at') ?? null,
  setLastSyncAt: () => storage.set('last_sync_at', new Date().toISOString()),
  getPendingReferralCode: () => storage.getString('pending_referral_code') ?? null,
  setPendingReferralCode: (code: string) => storage.set('pending_referral_code', code),
  clearPendingReferralCode: () => storage.remove('pending_referral_code'),

  // Trial modal tracking — hangi modal'ın gösterildiğini takip eder
  getTrialModalShown: (key: string): boolean => storage.getString(`trial_modal_${key}`) === '1',
  setTrialModalShown: (key: string) => storage.set(`trial_modal_${key}`, '1'),

  // Keyboard font size
  getKeyboardFontSize: () => storage.getString('keyboard_font_size') ?? 'normal',
  setKeyboardFontSize: (size: string) => {
    storage.set('keyboard_font_size', size);
    // Android: SharedPrefs ile klavye extension'a yansır
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'keyboard_font_size', size); } catch {}
    // iOS: App Group UserDefaults (native modül gerekir — şimdilik sessizce geçer)
    try { NativeModules.SharedPrefs?.setAppGroupString?.('keyboard_font_size', size); } catch {}
  },

  // Keyboard font family
  getKeyboardFontFamily: () => storage.getString('keyboard_font_family') ?? 'system',
  setKeyboardFontFamily: (family: string) => {
    storage.set('keyboard_font_family', family);
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'keyboard_font_family', family); } catch {}
    try { NativeModules.SharedPrefs?.setAppGroupString?.('keyboard_font_family', family); } catch {}
  },

  // Typing profile: "default" | "fast" | "beginner" | "elder"
  getTypingProfile: () => storage.getString('typing_profile') ?? 'default',
  setTypingProfile: (profile: string) => {
    storage.set('typing_profile', profile);
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'typing_profile', profile); } catch {}
    try { NativeModules.SharedPrefs?.setAppGroupString?.('typing_profile', profile); } catch {}
  },

  // Clipboard history (Pro+ only — last 15 copies)
  getClipboardHistory: (): import('../types').ClipboardItem[] => {
    try { return JSON.parse(storage.getString('clipboard_history') ?? '[]'); } catch { return []; }
  },
  setClipboardHistoryRaw: (json: string) => {
    try {
      storage.set('clipboard_history', json);
      const history: import('../types').ClipboardItem[] = JSON.parse(json);
      _syncClipboardToExtension(history);
    } catch {}
  },
  addToClipboardHistory: (item: import('../types').ClipboardItem, maxItems = 15) => {
    try {
      const raw = storage.getString('clipboard_history');
      const history: import('../types').ClipboardItem[] = raw ? JSON.parse(raw) : [];
      history.unshift(item);
      if (history.length > maxItems) history.length = maxItems;
      storage.set('clipboard_history', JSON.stringify(history));
      _syncClipboardToExtension(history);
    } catch {}
  },
  removeFromClipboardHistory: (id: string) => {
    try {
      const raw = storage.getString('clipboard_history');
      const history: import('../types').ClipboardItem[] = raw ? JSON.parse(raw) : [];
      const next = history.filter(i => i.id !== id);
      storage.set('clipboard_history', JSON.stringify(next));
      _syncClipboardToExtension(next);
    } catch {}
  },
  clearClipboardHistory: () => {
    storage.remove('clipboard_history');
    _syncClipboardToExtension([]);
  },

  // Klavye dili: "tr" | "en"
  getKeyboardLanguage: () => storage.getString('keyboard_language') ?? 'tr',
  setKeyboardLanguage: (lang: string) => {
    storage.set('keyboard_language', lang);
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'keyboard_language', lang); } catch {}
    try { NativeModules.SharedPrefs?.setAppGroupString?.('keyboard_language', lang); } catch {}
  },

  // Klavye düzeni: "q" | "f"
  getKeyboardLayout: () => storage.getString('keyboard_layout') ?? 'q',
  setKeyboardLayout: (layout: string) => {
    storage.set('keyboard_layout', layout);
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'keyboard_layout', layout); } catch {}
    try { NativeModules.SharedPrefs?.setAppGroupString?.('keyboard_layout', layout); } catch {}
  },

  // Sesli harf vurgusu (a,e,ı,i,o,ö,u,ü farklı renkte)
  getVowelHighlight: () => storage.getBoolean('vowel_highlight') ?? false,
  setVowelHighlight: (enabled: boolean) => {
    storage.set('vowel_highlight', enabled);
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'vowel_highlight', String(enabled)); } catch {}
    try { NativeModules.SharedPrefs?.setAppGroupString?.('vowel_highlight', String(enabled)); } catch {}
  },

  // Uygulama arayüz dili: "tr" | "en"
  getAppLanguage: (): 'tr' | 'en' | 'ar' | undefined => storage.getString('app_language') as 'tr' | 'en' | 'ar' | undefined,
  setAppLanguage: (lang: 'tr' | 'en' | 'ar') => storage.set('app_language', lang),

  // İmza metni (Business+ — klavyede ✍ butonuna basınca yapıştırılır)
  getSignatureText: () => storage.getString('signature_text') ?? '',
  setSignatureText: (text: string) => {
    storage.set('signature_text', text);
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'signature_text', text); } catch {}
    try { NativeModules.SharedPrefs?.setAppGroupString?.('signature_text', text); } catch {}
  },

  // El çizimi imzalar (Business+)
  getSignatures: (): import('../types').SavedSignature[] => {
    try { return JSON.parse(storage.getString('saved_signatures') ?? '[]'); } catch { return []; }
  },
  setSignatures: (sigs: import('../types').SavedSignature[]) => {
    const json = JSON.stringify(sigs);
    storage.set('saved_signatures', json);
    // Sync to extension shared storage (base64 only — no file paths across boundaries)
    const slim = JSON.stringify(sigs.map(s => ({ id: s.id, name: s.name, base64: s.base64 })));
    try { NativeModules.SharedPrefs?.set('klavyem_shared', 'signatures', slim); } catch {}
    try { NativeModules.SharedPrefs?.setAppGroupString?.('signatures', slim); } catch {}
  },

  // Sistem kategorileri per-id aktif/pasif durumu — {"catId": false} = gizli
  getSystemCategoryStates: (): Record<string, boolean> => {
    try { return JSON.parse(storage.getString('system_cat_states') ?? '{}'); } catch { return {}; }
  },
  setSystemCategoryState: (id: string, enabled: boolean) => {
    try {
      const states = JSON.parse(storage.getString('system_cat_states') ?? '{}');
      states[id] = enabled;
      storage.set('system_cat_states', JSON.stringify(states));
    } catch {}
  },

  getInstalledPacks: (): string[] => {
    try { return JSON.parse(storage.getString('installed_packs') ?? '[]'); } catch { return []; }
  },
  setInstalledPacks: (packIds: string[]) => {
    try { storage.set('installed_packs', JSON.stringify(packIds)); } catch {}
  },

  clearAll: () => {
    storage.clearAll();
    if (Platform.OS === 'android') try { NativeModules.SharedPrefs?.clear('klavyem_shared'); } catch {}
  },

  // Error logging (temporary for debugging white screen)
  getErrorLog: () => storage.getString('error_log'),
  setErrorLog: (msg: string) => {
    const existing = storage.getString('error_log') ?? '';
    const ts = new Date().toISOString();
    const fullMsg = `[${ts}] ${msg}\n${existing}`.split('\n').slice(0, 50).join('\n'); // Keep last 50 lines
    storage.set('error_log', fullMsg);
  },
  clearErrorLog: () => storage.remove('error_log'),
};

export const KeyboardService = {
  isEnabled: (): Promise<boolean> =>
    Platform.OS === 'android'
      ? NativeModules.SharedPrefs?.isKlavyemEnabled() ?? Promise.resolve(false)
      : Promise.resolve(false),

  // Snippad klavyesinin şu an aktif (seçili) olup olmadığını kontrol et
  isActive: (): Promise<boolean> =>
    Platform.OS === 'android'
      ? NativeModules.SharedPrefs?.isKlavyemActive?.() ?? Promise.resolve(false)
      : Promise.resolve(false),
  openSettings: () =>
    Platform.OS === 'android'
      ? NativeModules.SharedPrefs?.openIMESettings()
      : Linking.openURL('App-Prefs:Keyboards').catch(() => {}),
  showPicker: () => {
    if (Platform.OS === 'android') {
      // Shows the system input method picker popup (switch keyboard dialog)
      try { NativeModules.SharedPrefs?.showInputMethodPicker(); } catch {}
    } else {
      Linking.openURL('App-Prefs:Keyboards').catch(() => {});
    }
  },
};
