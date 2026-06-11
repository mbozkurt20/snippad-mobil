// Web stub — localStorage ile MMKV API'sini taklit eder
import type { ClipboardItem } from '../types';

const ls = {
  get: (key: string) => { try { return localStorage.getItem(key) ?? undefined; } catch { return undefined; } },
  set: (key: string, val: string | boolean) => { try { localStorage.setItem(key, String(val)); } catch {} },
  remove: (key: string) => { try { localStorage.removeItem(key); } catch {} },
  getBool: (key: string) => { const v = localStorage.getItem(key); return v === null ? undefined : v === 'true'; },
  clear: () => { try { localStorage.clear(); } catch {} },
};

export const storage = {
  getString: (key: string) => ls.get(key),
  set: (key: string, val: string | boolean | number) => ls.set(key, String(val)),
  remove: (key: string) => ls.remove(key),
  getBoolean: (key: string) => ls.getBool(key),
  clearAll: () => ls.clear(),
};

export const mmkvStorage = {
  getToken:    () => ls.get('api_token'),
  setToken:    (t: string) => ls.set('api_token', t),
  clearToken:  () => ls.remove('api_token'),

  getDeviceId: () => ls.get('device_id'),
  setDeviceId: (id: string) => ls.set('device_id', id),

  setKeyboardData: (data: string) => ls.set('keyboard_data', data),
  getKeyboardData: () => ls.get('keyboard_data'),

  setKeyboardTheme: (theme: string) => ls.set('keyboard_theme', theme),
  getKeyboardTheme: () => ls.get('keyboard_theme') ?? 'dark_green',

  setUserPlan: (plan: string) => ls.set('user_plan', plan),
  getUserPlan: () => ls.get('user_plan') ?? 'basic',

  getPendingUsage: () => ls.get('pending_usage'),
  setPendingUsage: (data: string) => ls.set('pending_usage', data),
  clearPendingUsage: () => ls.remove('pending_usage'),

  getOnboardingCompleted: () => ls.getBool('onboarding_completed') ?? false,
  setOnboardingCompleted: (v: boolean) => ls.set('onboarding_completed', v),

  getTrialStartedAt: () => {
    const v = ls.get('trial_started_at');
    return v ? parseInt(v, 10) : null;
  },
  setTrialStartedAt: (ts: number) => ls.set('trial_started_at', String(ts)),

  getKeyboardFontSize: () => ls.get('keyboard_font_size') ?? 'normal',
  setKeyboardFontSize: (size: string) => ls.set('keyboard_font_size', size),

  getKeyboardFontFamily: () => ls.get('keyboard_font_family') ?? 'system',
  setKeyboardFontFamily: (family: string) => ls.set('keyboard_font_family', family),

  getClipboardHistory: (): ClipboardItem[] => {
    try { return JSON.parse(ls.get('clipboard_history') ?? '[]'); } catch { return []; }
  },
  addToClipboardHistory: (item: ClipboardItem) => {
    try {
      const history: ClipboardItem[] = JSON.parse(ls.get('clipboard_history') ?? '[]');
      history.unshift(item);
      if (history.length > 15) history.length = 15;
      ls.set('clipboard_history', JSON.stringify(history));
    } catch {}
  },
  removeFromClipboardHistory: (id: string) => {
    try {
      const history: ClipboardItem[] = JSON.parse(ls.get('clipboard_history') ?? '[]');
      ls.set('clipboard_history', JSON.stringify(history.filter(i => i.id !== id)));
    } catch {}
  },
  clearClipboardHistory: () => ls.remove('clipboard_history'),

  getTypingProfile: () => ls.get('typing_profile') ?? 'default',
  setTypingProfile: (profile: string) => ls.set('typing_profile', profile),

  getKeyboardLanguage: () => ls.get('keyboard_language') ?? 'tr',
  setKeyboardLanguage: (lang: string) => ls.set('keyboard_language', lang),

  getKeyboardLayout: () => ls.get('keyboard_layout') ?? 'q',
  setKeyboardLayout: (layout: string) => ls.set('keyboard_layout', layout),

  getVowelHighlight: () => ls.getBool('vowel_highlight') ?? false,
  setVowelHighlight: (enabled: boolean) => ls.set('vowel_highlight', enabled),

  getSignatureText: () => ls.get('signature_text') ?? '',
  setSignatureText: (text: string) => ls.set('signature_text', text),

  getSystemCategoryStates: (): Record<string, boolean> => {
    try { return JSON.parse(ls.get('system_cat_states') ?? '{}'); } catch { return {}; }
  },
  setSystemCategoryState: (id: string, enabled: boolean) => {
    try {
      const states = JSON.parse(ls.get('system_cat_states') ?? '{}');
      states[id] = enabled;
      ls.set('system_cat_states', JSON.stringify(states));
    } catch {}
  },

  clearAll: () => ls.clear(),
};

export const KeyboardService = {
  isEnabled: () => Promise.resolve(false),
  openSettings: () => Promise.resolve(false),
};
