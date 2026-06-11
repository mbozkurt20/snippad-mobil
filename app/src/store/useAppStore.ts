import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as ExpoClipboard from 'expo-clipboard';
import { Category, Template, UserSettings, PlanId, PLAN_LIMITS, ClipboardItem, TRIAL_MS, TRIAL_DAYS, ReferralStats, Testimonial } from '../types';
import { mmkvStorage } from './storage';
import { api, setApiToken, clearApiToken, hasToken, setOnUnauthorized } from './api';
import * as StoreReview from 'expo-store-review';
import { scheduleTrialEndNotifications, scheduleReEngagementNotification } from './notifications';
import { Analytics } from './analytics';
import { PLAN_TO_PRODUCT_ID, PRODUCT_TO_PLAN } from './purchases';
import { themeByKey, cornerRadiusFor } from '../constants/themes';
import { resolveLayout, KEY_WEIGHTS, ROW_HEIGHTS, TR_UPPERCASE_MAP } from '../constants/keyboard';
import type { Lang } from '../i18n';
import { applyLangDirection } from '../i18n';

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectAppLang(): Lang {
  try {
    const { getLocales } = require('expo-localization');
    const locale = getLocales()[0]?.languageCode ?? 'tr';
    if (locale === 'tr') return 'tr';
    if (locale === 'ar') return 'ar';
    return 'tr'; // Default to Turkish, not English
  } catch {
    return 'tr';
  }
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getDeviceId(): string {
  const stored = mmkvStorage.getDeviceId();
  if (stored) return stored;
  const id: string = Device.modelId ?? uid('device');
  mmkvStorage.setDeviceId(id);
  return id;
}

// Efektif plan'ı hesapla: premium → kendi planı, trial aktif → 'business', süreli doldu → navigate Paywall
function getEffectivePlan(storedPlan: string): string {
  const planId = storedPlan as import('../types').PlanId;
  // Plan 'business' (trial start) veya premium ('basic', 'pro', 'business', vb.)
  if (planId !== 'business') return storedPlan; // premium kullanıcı

  const trialStartedAt = mmkvStorage.getTrialStartedAt();
  if (!trialStartedAt) return 'business'; // trial başlanmadı (shouldn't happen, but safe)

  const elapsed = Date.now() - trialStartedAt;
  if (elapsed < TRIAL_MS) return 'business'; // trial aktif (3 gün içi)
  return 'expired_trial'; // trial bitti → Navigation will show Paywall
}

// Serialize categories + settings to shared storage for keyboard extension (iOS & Android)
// Efektif plan limitlerini uygular — trial bitince free sınırları geçerli olur
function syncToKeyboard(categories: Category[], sysStates?: Record<string, boolean>) {
  const storedPlan    = mmkvStorage.getUserPlan();
  const effectivePlan = getEffectivePlan(storedPlan);
  const states = sysStates ?? mmkvStorage.getSystemCategoryStates();

  // Trial bitmişse klavyeyi boşalt — kategoriler görünmesin
  if (effectivePlan === 'expired_trial') {
    const expiredTheme = themeByKey(mmkvStorage.getKeyboardTheme());
    const expLayout = mmkvStorage.getKeyboardLayout();
    const expLanguage = mmkvStorage.getKeyboardLanguage();
    const expResolved = resolveLayout(expLayout, expLanguage);
    const data = JSON.stringify({
      settings: {
        theme: expiredTheme.key,
        colors: {
          kbBg: expiredTheme.kbBg, keyBg: expiredTheme.keyBg, keyPress: expiredTheme.keyPress,
          specBg: expiredTheme.specBg, accentBg: expiredTheme.accentBg,
          accentTxt: expiredTheme.accentTxt ?? null, keyTxt: expiredTheme.keyTxt,
          specTxt: expiredTheme.specTxt, dockBg: expiredTheme.dockBg,
          tplBg: expiredTheme.tplBg, tplItemBg: expiredTheme.tplItemBg,
          tplTxt: expiredTheme.tplTxt, tplSub: expiredTheme.tplSub,
          keyAccentBorder: expiredTheme.keyAccentBorder ?? null,
        },
        cornerRadius: cornerRadiusFor(expiredTheme),
        font_size: mmkvStorage.getKeyboardFontSize(),
        font_family: mmkvStorage.getKeyboardFontFamily(), user_plan: 'basic', trial_active: 'false',
        typing_profile:  mmkvStorage.getTypingProfile(),
        keyboard_layout: expLayout,
        keyboard_language: expLanguage,
        vowel_highlight: mmkvStorage.getVowelHighlight() ? 'true' : 'false',
        signature_text:  '',
        layout_rows: { row1: expResolved.row1, row2: expResolved.row2, row3: expResolved.row3, row4: expResolved.row4 },
        long_press:    expResolved.longPress,
        key_weights:   KEY_WEIGHTS,
        row_heights:   ROW_HEIGHTS,
        uppercase_map: TR_UPPERCASE_MAP,
      },
      categories: [],
    });
    mmkvStorage.setKeyboardData(data);
    return;
  }

  const limits = PLAN_LIMITS[effectivePlan as import('../types').PlanId] ?? PLAN_LIMITS['basic'];
  const catLimit = limits.categories    === -1 ? categories.length : limits.categories;
  const tplLimit = limits.templatesPerCat === -1 ? Infinity        : limits.templatesPerCat;

  // Sistem kategorilerini per-id durumuna göre filtrele (default: true = aktif)
  const visibleCats = categories.filter(c => !c.is_system || (states[c.id] !== false));
  const filteredCats = visibleCats.slice(0, catLimit).map(c => ({
    id: c.id, name: c.name, type: c.type, icon: c.icon, color: c.color,
    is_system: c.is_system,
    templates: c.templates
      .slice(0, tplLimit)
      .map(t => ({ id: t.id, title: t.title, content: t.content, ...(t.shortcut ? { shortcut: t.shortcut } : {}) })),
  }));

  const themeKey = mmkvStorage.getKeyboardTheme();
  const resolvedTheme = themeByKey(themeKey);
  const cornerRadius = cornerRadiusFor(resolvedTheme);
  const kbLayout = mmkvStorage.getKeyboardLayout();
  const kbLanguage = mmkvStorage.getKeyboardLanguage();
  const resolvedLayout = resolveLayout(kbLayout, kbLanguage);

  const data = JSON.stringify({
    settings: {
      theme:          themeKey,
      // Resolved colors — extensions read these directly, no hardcoded theme map needed
      colors: {
        kbBg:           resolvedTheme.kbBg,
        keyBg:          resolvedTheme.keyBg,
        keyPress:       resolvedTheme.keyPress,
        specBg:         resolvedTheme.specBg,
        accentBg:       resolvedTheme.accentBg,
        accentTxt:      resolvedTheme.accentTxt ?? null,
        keyTxt:         resolvedTheme.keyTxt,
        specTxt:        resolvedTheme.specTxt,
        dockBg:         resolvedTheme.dockBg,
        tplBg:          resolvedTheme.tplBg,
        tplItemBg:      resolvedTheme.tplItemBg,
        tplTxt:         resolvedTheme.tplTxt,
        tplSub:         resolvedTheme.tplSub,
        keyAccentBorder: resolvedTheme.keyAccentBorder ?? null,
      },
      cornerRadius,     // 10 = rounded, 999 = circle (daktilo), 4 = square (klasik)
      font_size:      mmkvStorage.getKeyboardFontSize(),
      font_family:    mmkvStorage.getKeyboardFontFamily(),
      user_plan:      effectivePlan,
      trial_active:   'true',
      is_logged_in:   mmkvStorage.getToken() ? 'true' : 'false',
      typing_profile:  mmkvStorage.getTypingProfile(),
      keyboard_layout:    kbLayout,
      keyboard_language:  kbLanguage,
      vowel_highlight:    mmkvStorage.getVowelHighlight() ? 'true' : 'false',
      signature_text:     mmkvStorage.getSignatureText(),
      // Single source of truth: layout from constants/keyboard.ts
      layout_rows:  { row1: resolvedLayout.row1, row2: resolvedLayout.row2, row3: resolvedLayout.row3, row4: resolvedLayout.row4 },
      long_press:   resolvedLayout.longPress,
      key_weights:  KEY_WEIGHTS,
      row_heights:  ROW_HEIGHTS,
      uppercase_map: TR_UPPERCASE_MAP,
    },
    categories: filteredCats,
  });
  mmkvStorage.setKeyboardData(data);
}

const DEFAULT_SETTINGS: UserSettings = {
  is_premium: false,
  plan: 'basic',
  subscription: null,
  usage_count: 0,
  user_id: null,
  is_logged_in: false,
  profile: { name: '', email: '' },
  trial_started_at: null,
  referral_code: null,
};

// ── State ─────────────────────────────────────────────────────────────────────

interface AppState {
  categories: Category[];
  deletedCategories: Category[];
  defaultCategories: DefaultCategory[];
  userSettings: UserSettings;
  isOnboarded: boolean;
  isLoading: boolean;
  error: string | null;
  clipboardHistory: ClipboardItem[];
  teamMembership: { team_id: number; team_name: string; owner_name: string; role: string; is_owner: boolean } | null;
  systemCategoryStates: Record<string, boolean>;
  setSystemCategoryState: (id: string, enabled: boolean) => void;
  toggleDefaultCategory: (categoryId: string | number) => Promise<void>;

  // App UI language (reactive — drives i18n re-renders)
  appLanguage: Lang;
  setAppLanguage: (lang: Lang) => void;

  // Keyboard display settings (reactive — drive re-renders in simulator)
  keyboardLayout: string;    // "q" | "f"
  keyboardLanguage: string;  // "tr" | "en"
  keyboardTheme: string;
  keyboardFontSize: string;  // "small" | "normal" | "large" | "xlarge"
  keyboardFontFamily: string;
  vowelHighlight: boolean;
  setKeyboardLayout: (layout: string) => void;
  setKeyboardLanguage: (lang: string) => void;
  setKeyboardTheme: (theme: string) => void;
  setKeyboardFontSize: (size: string) => void;
  setKeyboardFontFamily: (family: string) => void;
  setVowelHighlight: (enabled: boolean) => void;

  // Boot
  boot: () => Promise<void>;
  loadFromApi: () => Promise<void>;
  completeOnboarding: () => void;
  syncKeyboardSettings: () => void; // Tema/font değişince çağır

  // Auth
  authenticateDevice: () => Promise<void>;
  login: (email: string, password: string) => Promise<'ok' | 'error'>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<'ok' | 'error'>;
  socialLogin: (provider: 'google' | 'apple', idToken: string, name?: string) => Promise<'ok' | 'error'>;
  initializeWithToken: (token: string) => Promise<void>;
  upgradeToAccount: (name: string, email: string, password: string) => Promise<'ok' | 'error'>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string, avatarUri?: string) => Promise<void>;
  updatePassword: (current: string, next: string) => Promise<'ok' | 'error'>;

  // Categories
  addCategory: (name: string, type: Category['type'], icon: string, color: string) => Promise<'ok' | 'limit'>;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'templates'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  fetchDeletedCategories: () => Promise<void>;
  restoreCategory: (id: string) => Promise<void>;

  // Templates
  addTemplate: (categoryId: string, title: string, content: string, shortcut?: string) => Promise<'ok' | 'limit'>;
  updateTemplate: (categoryId: string, templateId: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (categoryId: string, templateId: string) => Promise<void>;

  // Subscription
  purchasePlan: (planId: PlanId) => Promise<void>;
  restorePurchases: () => Promise<'ok' | 'none' | 'error'>;
  cancelSubscription: () => Promise<void>;
  isInRefundWindow: () => boolean;
  getPlanLimits: () => typeof PLAN_LIMITS[PlanId];

  // Trial
  createSampleCategories: () => Promise<void>;
  isInTrial: () => boolean;
  isTrialExpired: () => boolean;
  trialDaysLeft: () => number;
  getTrialState: () => 'active' | 'last_day' | 'grace' | 'read_only' | 'locked' | 'premium';

  // Usage
  incrementUsage: (templateId: string) => void;
  flushUsage: () => Promise<void>;

  // Clipboard history (Pro+)
  copyTemplate: (template: Template, category: Category) => Promise<void>;
  checkClipboard: () => Promise<void>;
  removeFromClipboardHistory: (id: string) => void;
  clearClipboardHistory: () => void;

  // Referral
  referralStats: ReferralStats | null;
  fetchReferralStats: () => Promise<void>;
  claimReward: () => Promise<'ok' | 'error'>;

  // Testimonials
  testimonials: Testimonial[];
  fetchTestimonials: () => Promise<void>;

  // Sector packs
  installedPacks: string[];
  markPackInstalled: (packId: string) => void;

  // Dev
  setPremium: (v: boolean) => void;
  setDevPlan: (plan: import('../types').PlanId) => void;
  expireTrialNow: () => void;
  resetAll: () => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  categories: [],
  deletedCategories: [],
  defaultCategories: [],
  userSettings: DEFAULT_SETTINGS,
  isOnboarded: false,
  isLoading: false,
  error: null,
  teamMembership: null,
  clipboardHistory: mmkvStorage.getClipboardHistory(),
  systemCategoryStates: mmkvStorage.getSystemCategoryStates(),
  appLanguage: (() => { try { return mmkvStorage.getAppLanguage() ?? detectAppLang(); } catch { return detectAppLang(); } })(),
  referralStats: null,
  testimonials: [],
  installedPacks: [],
  setAppLanguage: (lang: Lang) => {
    try { mmkvStorage.setAppLanguage(lang); } catch {}
    set({ appLanguage: lang });
    applyLangDirection(lang);
  },
  keyboardLayout: mmkvStorage.getKeyboardLayout(),
  keyboardLanguage: mmkvStorage.getKeyboardLanguage(),
  keyboardTheme: mmkvStorage.getKeyboardTheme(),
  keyboardFontSize: mmkvStorage.getKeyboardFontSize(),
  keyboardFontFamily: mmkvStorage.getKeyboardFontFamily(),
  vowelHighlight: mmkvStorage.getVowelHighlight(),
  setKeyboardLayout: (layout: string) => {
    mmkvStorage.setKeyboardLayout(layout);
    set({ keyboardLayout: layout });
    syncToKeyboard(get().categories);
  },
  setKeyboardLanguage: (lang: string) => {
    mmkvStorage.setKeyboardLanguage(lang);
    set({ keyboardLanguage: lang });
    syncToKeyboard(get().categories);
  },
  setKeyboardTheme: (theme: string) => {
    mmkvStorage.setKeyboardTheme(theme);
    set({ keyboardTheme: theme });
    syncToKeyboard(get().categories);
  },
  setKeyboardFontSize: (size: string) => {
    mmkvStorage.setKeyboardFontSize(size);
    set({ keyboardFontSize: size });
    syncToKeyboard(get().categories);
  },
  setKeyboardFontFamily: (family: string) => {
    mmkvStorage.setKeyboardFontFamily(family);
    set({ keyboardFontFamily: family });
    syncToKeyboard(get().categories);
  },
  setVowelHighlight: (enabled: boolean) => {
    mmkvStorage.setVowelHighlight(enabled);
    set({ vowelHighlight: enabled });
    syncToKeyboard(get().categories);
  },
  setSystemCategoryState: async (packSlug: string, enabled: boolean) => {
    mmkvStorage.setSystemCategoryState(packSlug, enabled);
    const states = mmkvStorage.getSystemCategoryStates();
    set({ systemCategoryStates: states });

    // Backend'e preference'ı gönder (on/off toggle)
    try {
      await api.post('/categories/import-pack', { pack: packSlug, enabled });
      // API başarılı olduktan sonra kategorileri reload et (enable/disable her iki durumda)
      await get().loadFromApi();
    } catch (e) {
      // Error varsa toggle'ı geri al
      mmkvStorage.setSystemCategoryState(packSlug, !enabled);
      set({ systemCategoryStates: mmkvStorage.getSystemCategoryStates() });
    }

    syncToKeyboard(get().categories, states);
  },

  toggleDefaultCategory: async (categoryId: string | number) => {
    const state = get();
    const defaultCat = state.defaultCategories.find(c => c.id === categoryId);
    if (!defaultCat) return;

    // Optimistic update
    set({
      defaultCategories: state.defaultCategories.map(c =>
        c.id === categoryId ? { ...c, enabled: !c.enabled } : c
      ),
    });

    // Backend'e gönder
    try {
      await api.patch(`/default-categories/${categoryId}/toggle`, {});
    } catch (e) {
      // Error varsa state'i geri al
      set({ defaultCategories: state.defaultCategories });
      throw e;
    }
  },

  // ── Boot ────────────────────────────────────────────────────────────────────

  boot: async () => {
    // 401 alınınca otomatik logout
    setOnUnauthorized(() => {
      clearApiToken();
      get().resetAll();
    });
    set({ isLoading: true });
    try {
      if (hasToken()) {
        await get().loadFromApi();
        set({ isOnboarded: mmkvStorage.getOnboardingCompleted() });
      } else {
        // Misafir girişi kaldırıldı — kayıt zorunlu
        const completed = mmkvStorage.getOnboardingCompleted();
        set({ isOnboarded: completed, isLoading: false });
        return;
      }
      // IAP bağlantısı başlat ve satın alma dinleyicisini kur
      if (Platform.OS !== 'web') {
        try {
          const iap = require('expo-iap');
          await iap.initConnection();
          iap.purchaseUpdatedListener(async (purchase: any) => {
            const receipt = purchase.transactionReceipt ?? purchase.purchaseToken ?? purchase.token;
            if (!receipt) return;
            try { await iap.finishTransaction({ purchase, isConsumable: false }); } catch {}
            const planSlug = PRODUCT_TO_PLAN[purchase.productId ?? purchase.productIds?.[0]];
            if (planSlug) {
              try {
                await api.post('/subscription/purchase', {
                  plan_slug: planSlug,
                  provider: Platform.OS === 'ios' ? 'apple' : 'google',
                  provider_transaction_id: purchase.transactionId ?? purchase.purchaseToken ?? purchase.token,
                  receipt,
                });
                await get().loadFromApi();
              } catch {}
            }
          });
        } catch {}
      }
    } catch (err) {
      try {
        mmkvStorage.setErrorLog?.(`boot() error: ${err instanceof Error ? err.message : String(err)}`);
      } catch {}
      const cached = mmkvStorage.getKeyboardData();
      if (cached) set({ categories: JSON.parse(cached) });
      set({ isOnboarded: mmkvStorage.getOnboardingCompleted() });
    } finally {
      set({
        isLoading: false,
        installedPacks: (() => { try { return mmkvStorage.getInstalledPacks?.() ?? []; } catch { return []; } })(),
      });
    }
  },

  createSampleCategories: async () => {
    // Sadece hiç kategori yoksa ilk açılışta oluştur
    if (get().categories.length > 0) return;
    try {
      await get().addCategory('IBAN\'larım', 'iban', 'bank', '#3B82F6');
      await get().addCategory('Adreslerim', 'address', 'map-pin', '#10B981');
      const textCat = await get().addCategory('Hazır Cevaplar', 'text', 'file-text', '#F59E0B');
      // Hazır Cevaplar'a örnek şablon
      if (textCat === 'ok') {
        const cats = get().categories;
        const tc = cats.find(c => c.name === 'Hazır Cevaplar');
        if (tc) await get().addTemplate(tc.id, 'Teşekkür', 'Teşekkür ederim, en kısa sürede dönüş yapacağım.');
      }
    } catch {}
  },

  completeOnboarding: () => {
    mmkvStorage.setOnboardingCompleted(true);
    set({ isOnboarded: true });
    Analytics.onboardingCompleted();
    // Trial bitiş ve re-engagement bildirimlerini schedule et
    const trialStartedAt = get().userSettings.trial_started_at;
    if (trialStartedAt) {
      scheduleTrialEndNotifications(trialStartedAt).catch(() => {});
    }
    scheduleReEngagementNotification().catch(() => {});
  },

  syncKeyboardSettings: () => {
    syncToKeyboard(get().categories);
    // Ayarları backend'e kaydet (hesap değişince de korunsun)
    if (hasToken()) {
      try {
        api.patch('/auth/settings', {
          settings: {
            keyboard_theme:       mmkvStorage.getKeyboardTheme(),
            keyboard_font_size:   mmkvStorage.getKeyboardFontSize(),
            keyboard_font_family: mmkvStorage.getKeyboardFontFamily(),
            typing_profile:       mmkvStorage.getTypingProfile(),
          },
        });
      } catch {}
    }
  },

  loadFromApi: async () => {
    try {
      const res = await api.get<any>('/sync');
      const cats: Category[] = (res.keyboard_data ?? []).map((c: any) => ({
        id: c.id, name: c.name, type: c.type, icon: c.icon, color: c.color,
        is_system: !!c.is_system,
        templates: (c.templates ?? []).map((t: any) => ({
          id: t.id, title: t.title, content: t.content,
        })),
      }));
      const meRes = await api.get<any>('/auth/me');
      const u = meRes.user;

      // Backend'den trial_expired check et (client-side clock manipulation'a karşı güvenli)
      const backendTrialExpired = res.user_settings?.trial_expired ?? false;
      let trialStartedAt = mmkvStorage.getTrialStartedAt();

      if (backendTrialExpired) {
        // Trial süresi bitmiş — reset et
        trialStartedAt = null;
        mmkvStorage.setTrialStartedAt(null);
      } else if (res.user_settings?.trial_started_at) {
        // Backend'den fresh trial_started_at al (cihaz saati manipülasyonuna karşı)
        trialStartedAt = res.user_settings.trial_started_at * 1000;
        mmkvStorage.setTrialStartedAt(trialStartedAt);
      }

      const userSettings: UserSettings = {
        is_premium: u.is_premium ?? false,
        plan: (u.plan?.slug ?? 'basic') as PlanId,
        subscription: u.subscription ?? null,
        usage_count: u.usage?.count ?? 0,
        user_id: String(u.id),
        is_logged_in: !u.is_device_only,
        profile: { name: u.name === 'Misafir' ? '' : u.name, email: u.email ?? '', avatarUri: u.avatar_url ?? undefined },
        trial_started_at: trialStartedAt,
        referral_code: u.referral_code ?? null,
      };

      // Backend ayarlarını uygula (tema, font vs.) — sadece değer varsa yaz
      const appSettings = res.app_settings ?? {};
      if (appSettings.keyboard_theme)      mmkvStorage.setKeyboardTheme(appSettings.keyboard_theme);
      if (appSettings.keyboard_font_size)  mmkvStorage.setKeyboardFontSize(appSettings.keyboard_font_size);
      if (appSettings.keyboard_font_family) mmkvStorage.setKeyboardFontFamily(appSettings.keyboard_font_family);
      if (appSettings.typing_profile)      mmkvStorage.setTypingProfile(appSettings.typing_profile);

      // Takım üyeliğini çek (plan bağımsız — davet edilen herkes görebilir)
      let teamMembership = null;
      try {
        const memRes = await api.get<any>('/team/membership');
        teamMembership = memRes.membership ?? null;
      } catch {}

      // DefaultCategories al
      const defaultCats = (res.default_categories ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        enabled: c.enabled ?? true,
      }));

      set({ categories: cats, defaultCategories: defaultCats, userSettings, isOnboarded: true, teamMembership });
      syncToKeyboard(cats);
      mmkvStorage.setLastSyncAt();
      mmkvStorage.setUserPlan(userSettings.plan);

      // Device code (web sign-in identity)
      if (meRes.user?.device_code) {
        mmkvStorage.setDeviceCode(meRes.user.device_code);
      }

      Analytics.setPlan(userSettings.plan);

      // Load clipboard history from backend (Pro+ only)
      const plan = userSettings.plan as PlanId;
      const planLimits = PLAN_LIMITS[plan] ?? PLAN_LIMITS['basic'];
      if (planLimits.smartClipboard) {
        try {
          const clipRes = await api.get<any>('/clipboard');
          const serverClips: ClipboardItem[] = (clipRes.clipboard ?? []).map((item: any) => ({
            id: String(item.id),
            content: item.content,
            title: item.title,
            categoryName: item.categoryName ?? 'Pano',
            categoryType: item.categoryType ?? 'text',
            copiedAt: item.copiedAt,
          }));
          mmkvStorage.setClipboardHistoryRaw(JSON.stringify(serverClips));
          set({ clipboardHistory: serverClips });
        } catch {}
      } else {
        // Non-Pro plan: keep local clipboard history, just don't sync to server
        // (clearing here was causing the 3-second flash/clear bug)
        const localHistory = mmkvStorage.getClipboardHistory();
        if (localHistory.length > 0) {
          set({ clipboardHistory: localHistory });
        }
      }
    } catch (e: any) {
      if (e.status === 401) {
        clearApiToken();
        set({ isOnboarded: false });
      }
    }
  },

  // ── Auth ────────────────────────────────────────────────────────────────────

  authenticateDevice: async () => {
    const deviceId = getDeviceId();
    const res = await api.post<any>('/auth/device', {
      device_id: deviceId,
      platform: Platform.OS,
    });
    setApiToken(res.token);
    const u = res.user;

    // Backend'den gelen trial_started_at önceliklidir (uygulama silme/yeniden kurma'ya karşı)
    const serverTrialTs: number | null = res.user?.trial_started_at
      ? res.user.trial_started_at * 1000  // saniye → ms
      : null;
    let trialStartedAt = serverTrialTs ?? mmkvStorage.getTrialStartedAt();
    if (!trialStartedAt) {
      trialStartedAt = Date.now();
    }
    mmkvStorage.setTrialStartedAt(trialStartedAt);

    const userSettings: UserSettings = {
      is_premium: u.is_premium ?? false,
      plan: (u.plan?.slug ?? 'basic') as PlanId,
      subscription: null,
      usage_count: 0,
      user_id: String(u.id),
      is_logged_in: false,
      profile: { name: '', email: '' },
      trial_started_at: trialStartedAt,
      referral_code: u.referral_code ?? null,
    };
    set({ userSettings });
    mmkvStorage.setUserPlan(userSettings.plan);

    // Device code (web sign-in)
    if (u.device_code) {
      mmkvStorage.setDeviceCode(u.device_code);
    }
  },

  socialLogin: async (provider, idToken, name) => {
    try {
      set({ isLoading: true });
      mmkvStorage.clearClipboardHistory();
      set({ clipboardHistory: [] });
      const localCategories = get().categories;
      const res = await api.post<any>('/auth/social', { provider, id_token: idToken, name });
      setApiToken(res.token);
      if (localCategories.length > 0) {
        try {
          await api.post('/sync', {
            keyboard_data: localCategories.map(c => ({
              id: c.id, name: c.name, type: c.type, icon: c.icon, color: c.color,
              templates: c.templates.map(t => ({ id: t.id, title: t.title, content: t.content })),
            })),
          });
        } catch {}
      }
      await get().loadFromApi();
      set({ isOnboarded: true, isLoading: false });
      return 'ok';
    } catch {
      set({ isLoading: false });
      return 'error';
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true });
      // Step 1: authenticate — if this throws, it's a real login error
      const res = await api.post<any>('/auth/login', { email, password });
      console.log('[LOGIN] Response:', res);
      if (!res.token) {
        console.error('[LOGIN] No token in response');
        throw new Error('Token not found in response');
      }
      setApiToken(res.token);
      console.log('[LOGIN] Token saved');
      // Step 2: post-login cleanup + sync (errors here must NOT block login)
      try {
        mmkvStorage.clearClipboardHistory();
        set({ clipboardHistory: [] });
        const localCategories = get().categories;
        if (localCategories.length > 0) {
          await api.post('/sync', {
            keyboard_data: localCategories.map(c => ({
              id: c.id, name: c.name, type: c.type, icon: c.icon, color: c.color,
              templates: c.templates.map(t => ({ id: t.id, title: t.title, content: t.content })),
            })),
          });
        }
      } catch (e) { console.log('[LOGIN] Sync error (non-fatal):', e); }
      // Step 3: load user data (non-fatal, but if fails still show isOnboarded)
      try { await get().loadFromApi(); } catch (e) {
        console.log('[LOGIN] loadFromApi error (non-fatal):', e);
        // Still set isOnboarded so user can see app even if sync fails
        set(s => ({
          isOnboarded: true,
          userSettings: { ...s.userSettings, is_logged_in: true },
        }));
      }
      // Analytics (non-fatal, may not be available on web)
      try { Analytics.setLoginMethod('email'); } catch (e) { console.log('[LOGIN] Analytics error (non-fatal):', e); }
      set({ isOnboarded: true, isLoading: false });
      console.log('[LOGIN] Success');
      return 'ok';
    } catch (err: any) {
      console.error('[LOGIN] Error:', err instanceof Error ? err.message : err);
      set({ isLoading: false });
      const msg = err?.message || 'Giriş başarısız oldu.';
      throw Object.assign(new Error(msg), { status: err?.status, data: err?.data });
    }
  },

  initializeWithToken: async (token: string) => {
    try {
      setApiToken(token);
      await get().loadFromApi();
      set({ isOnboarded: true });
      console.log('[DEV] Initialized with token');
    } catch (e) {
      console.error('[DEV] Initialization failed:', e);
    }
  },

  register: async (name, email, password, referralCode?: string) => {
    try {
      set({ isLoading: true });
      const body: any = { name, email, password, lang: 'tr' };
      if (referralCode) body.referral_code = referralCode;
      const res = await api.post<any>('/auth/register', body);
      setApiToken(res.token);
      // Step 2: non-fatal post-register sync
      try {
        mmkvStorage.clearClipboardHistory();
        set({ clipboardHistory: [] });
        const { categories } = get();
        if (categories.length > 0) {
          await api.post('/sync', {
            keyboard_data: categories.map(c => ({
              id: c.id, name: c.name, type: c.type, icon: c.icon, color: c.color,
              templates: c.templates.map(t => ({ id: t.id, title: t.title, content: t.content })),
            })),
          });
        }
      } catch {}
      // Step 3: load user data (non-fatal)
      try { await get().loadFromApi(); } catch (e) { console.log('[REGISTER] loadFromApi non-fatal:', e); }
      set({ isLoading: false });
      return 'ok';
    } catch (err: any) {
      console.error('[REGISTER ERROR]', err instanceof Error ? err.message : err);
      set({ isLoading: false });
      const msg = err?.message || 'Kayıt başarısız oldu.';
      throw Object.assign(new Error(msg), { status: err?.status, data: err?.data });
    }
  },

  upgradeToAccount: async (name, email, password) => {
    try {
      await api.post('/auth/upgrade', { name, email, password });
      await get().loadFromApi();
      return 'ok';
    } catch {
      return 'error';
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout', {}); } catch {}
    clearApiToken();
    mmkvStorage.setUserPlan('basic');
    mmkvStorage.clearToken();
    syncToKeyboard([]);
    mmkvStorage.clearAll();
    // Misafir girişi yok — sadece state sıfırla, login ekranına navigation yönlendirir
    set({ categories: [], userSettings: DEFAULT_SETTINGS, isOnboarded: false, clipboardHistory: [], teamMembership: null });
  },

  updateProfile: async (name, email, avatarUri) => {
    const res = await api.put<any>('/auth/profile', { name, email, avatar_url: avatarUri ?? null });
    const u = res.user;
    set(s => ({
      userSettings: {
        ...s.userSettings,
        profile: { name: u.name, email: u.email ?? '', avatarUri: u.avatar_url ?? undefined },
      },
    }));
  },

  updatePassword: async (current, next) => {
    try {
      await api.put('/auth/password', {
        current_password: current,
        password: next,
        password_confirmation: next,
      });
      return 'ok';
    } catch {
      return 'error';
    }
  },

  // ── Categories ──────────────────────────────────────────────────────────────

  addCategory: async (name, type, icon, color) => {
    const limits = get().getPlanLimits();
    if (limits.categories !== -1 && get().categories.length >= limits.categories) return 'limit';

    Analytics.categoryCreated(type);
    const tempId = uid('cat');
    const tempCat: Category = { id: tempId, name, type, icon, color, templates: [] };
    set(s => ({ categories: [...s.categories, tempCat] }));
    syncToKeyboard(get().categories);

    try {
      const res = await api.post<any>('/categories', { uuid: tempId, name, type, icon, color });
      const serverCat = res.category;
      if (!serverCat?.id) throw new Error('Invalid response from server');
      set(s => ({
        categories: s.categories.map(c =>
          c.id === tempId ? { ...c, id: serverCat.id } : c,
        ),
      }));
      syncToKeyboard(get().categories);
      return 'ok';
    } catch (e: any) {
      set(s => ({ categories: s.categories.filter(c => c.id !== tempId) }));
      syncToKeyboard(get().categories);
      if (e.status === 422 && e.data?.upgrade_required) {
        return 'limit';
      }
      throw e;
    }
  },

  updateCategory: async (id, updates) => {
    set(s => ({
      categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
    syncToKeyboard(get().categories);
    try { await api.put(`/categories/${id}`, updates); } catch {}
  },

  deleteCategory: async (id) => {
    const originalCategories = get().categories;
    set(s => ({ categories: s.categories.filter(c => c.id !== id) }));
    syncToKeyboard(get().categories);
    try {
      await api.delete(`/categories/${id}`);
    } catch (e: any) {
      set({ categories: originalCategories });
      syncToKeyboard(originalCategories);
      throw new Error(e?.message ?? 'Kategori silinemedi');
    }
  },

  fetchDeletedCategories: async () => {
    try {
      const res = await api.get<any>('/categories/deleted');
      const deleted = res.categories?.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        templates: [] as Template[],
      })) ?? [];
      set({ deletedCategories: deleted });
    } catch (e) {
      console.error('[fetchDeletedCategories]', e);
    }
  },

  restoreCategory: async (id) => {
    try {
      await api.post(`/categories/${id}/restore`, {});
      await get().loadFromApi();
    } catch (e) {
      console.error('[restoreCategory]', e);
      throw e;
    }
  },

  // ── Templates ───────────────────────────────────────────────────────────────

  addTemplate: async (categoryId, title, content, shortcut?) => {
    const limits = get().getPlanLimits();
    const cat = get().categories.find(c => c.id === categoryId);
    if (!cat) return 'ok';
    if (limits.templatesPerCat !== -1 && cat.templates.length >= limits.templatesPerCat) return 'limit';

    const tempId = uid('temp');
    const tmpl: Template = { id: tempId, title, content, ...(shortcut ? { shortcut } : {}) };

    set(s => ({
      categories: s.categories.map(c =>
        c.id === categoryId ? { ...c, templates: [...c.templates, tmpl] } : c,
      ),
    }));
    syncToKeyboard(get().categories);

    try {
      const res = await api.post<any>(`/categories/${categoryId}/templates`, {
        uuid: tempId, title, content, ...(shortcut ? { shortcut } : {}),
      });
      const serverTmpl = res.template;
      if (!serverTmpl?.id) throw new Error('Invalid response from server');
      set(s => ({
        categories: s.categories.map(c =>
          c.id === categoryId
            ? { ...c, templates: c.templates.map(t => t.id === tempId ? { ...t, id: serverTmpl.id } : t) }
            : c,
        ),
      }));
      syncToKeyboard(get().categories);
      return 'ok';
    } catch (e: any) {
      set(s => ({
        categories: s.categories.map(c =>
          c.id === categoryId
            ? { ...c, templates: c.templates.filter(t => t.id !== tempId) }
            : c,
        ),
      }));
      syncToKeyboard(get().categories);
      if (e.status === 422 && e.data?.upgrade_required) {
        return 'limit';
      }
      throw e;
    }
  },

  updateTemplate: async (categoryId, templateId, updates) => {
    set(s => ({
      categories: s.categories.map(c =>
        c.id === categoryId
          ? { ...c, templates: c.templates.map(t => t.id === templateId ? { ...t, ...updates } : t) }
          : c,
      ),
    }));
    syncToKeyboard(get().categories);
    try { await api.put(`/templates/${templateId}`, updates); } catch {}
  },

  deleteTemplate: async (categoryId, templateId) => {
    const originalCategories = get().categories;
    set(s => ({
      categories: s.categories.map(c =>
        c.id === categoryId
          ? { ...c, templates: c.templates.filter(t => t.id !== templateId) }
          : c,
      ),
    }));
    syncToKeyboard(get().categories);
    try {
      await api.delete(`/templates/${templateId}`);
    } catch (e: any) {
      set({ categories: originalCategories });
      syncToKeyboard(originalCategories);
      throw new Error(e?.message ?? 'Şablon silinemedi');
    }
  },

  // ── Subscription ────────────────────────────────────────────────────────────

  purchasePlan: async (planId) => {
    if (Platform.OS === 'web') throw new Error('Satın alma yalnızca iOS ve Android uygulamalarında desteklenir.');
    const period = planId.includes('yearly') ? 'yearly' : 'monthly';
    Analytics.subscriptionStarted(planId, period);
    const productId = PLAN_TO_PRODUCT_ID[planId];
    if (!productId) throw new Error('Bilinmeyen plan');

    const iap = require('expo-iap');
    if (Platform.OS === 'android') {
      const products = await iap.fetchProducts({ productIds: [productId], type: 'subs' });
      const sub = (products as any[]).find((s: any) => s.productId === productId);
      const offerToken = sub?.subscriptionOfferDetails?.[0]?.offerToken ?? '';
      await iap.requestPurchase({
        request: { google: { skus: [productId], subscriptionOffers: [{ sku: productId, offerToken }] } },
        type: 'subs',
      });
    } else {
      await iap.requestPurchase({
        request: { apple: { sku: productId } },
        type: 'subs',
      });
    }
    // Satın alma tamamlanınca boot()'ta kurulan purchaseUpdatedListener devreye girer
  },

  restorePurchases: async () => {
    if (Platform.OS === 'web') return 'error';
    try {
      const iap = require('expo-iap');
      const purchases: any[] = await iap.getAvailablePurchases();
      if (!purchases.length) return 'none';

      const sub = purchases.find((p: any) => PRODUCT_TO_PLAN[p.productId]);
      if (!sub) return 'none';

      const planSlug = PRODUCT_TO_PLAN[sub.productId];
      try {
        await api.post('/subscription/purchase', {
          plan_slug: planSlug,
          provider: Platform.OS === 'ios' ? 'apple' : 'google',
          provider_transaction_id: sub.transactionId ?? sub.purchaseToken,
          receipt: Platform.OS === 'ios' ? sub.transactionReceipt : sub.purchaseToken,
        });
      } catch {}

      await get().loadFromApi();
      return 'ok';
    } catch {
      return 'error';
    }
  },

  cancelSubscription: async () => {
    try {
      await api.post('/subscription/cancel', {});
      await get().loadFromApi();
    } catch {}
  },

  isInRefundWindow: () => {
    const sub = get().userSettings.subscription;
    if (!sub?.purchasedAt) return false;
    return Date.now() - sub.purchasedAt < 48 * 60 * 60 * 1000;
  },

  isInTrial: () => {
    const { is_premium, trial_started_at } = get().userSettings;
    if (is_premium) return false;
    if (!trial_started_at) return false;
    return Date.now() - trial_started_at < TRIAL_MS;
  },

  isTrialExpired: () => {
    const { is_premium, trial_started_at } = get().userSettings;
    if (is_premium) return false;
    if (!trial_started_at) return false;
    return Date.now() - trial_started_at >= TRIAL_MS;
  },

  trialDaysLeft: () => {
    const { trial_started_at } = get().userSettings;
    if (!trial_started_at) return TRIAL_DAYS;
    const elapsed = Date.now() - trial_started_at;
    return Math.max(0, Math.ceil((TRIAL_MS - elapsed) / (24 * 60 * 60 * 1000)));
  },

  // ── Trial state machine ──────────────────────────────────────────────────
  // active    → trial devam ediyor (1-3 gün)
  // last_day  → son gün (daysLeft === 0 ama henüz bitmedi)
  // grace     → trial bitti, 0-24h arası (hâlâ kullanabilir, modal çıkar)
  // read_only → 24-48h arası (görebilir, kopyalayamaz)
  // locked    → 48h+ (tam kilit, Paywall)
  // premium   → abonelik aktif
  getTrialState: (): 'active' | 'last_day' | 'grace' | 'read_only' | 'locked' | 'premium' => {
    const { is_premium, trial_started_at } = get().userSettings;
    if (is_premium) return 'premium';
    if (!trial_started_at) return 'active';

    const elapsed = Date.now() - trial_started_at;
    const DAY_MS = 24 * 60 * 60 * 1000;

    if (elapsed < TRIAL_MS) {
      const daysLeft = Math.ceil((TRIAL_MS - elapsed) / DAY_MS);
      return daysLeft <= 1 ? 'last_day' : 'active';
    }
    const afterExpiry = elapsed - TRIAL_MS;
    if (afterExpiry < DAY_MS)       return 'grace';
    if (afterExpiry < 2 * DAY_MS)   return 'read_only';
    return 'locked';
  },

  getPlanLimits: () => {
    const { is_premium, plan } = get().userSettings;
    if (is_premium) return PLAN_LIMITS[plan];
    const state = get().getTrialState();
    if (state === 'active' || state === 'last_day') return PLAN_LIMITS['business'];
    if (state === 'grace')     return PLAN_LIMITS['business'];  // grace'de hâlâ erişebilir
    // read_only / locked → navigation shows Paywall, limits not used (view-only state)
    if (state === 'read_only' || state === 'locked') return PLAN_LIMITS['basic'];
    return PLAN_LIMITS['basic'];
  },

  // ── Usage ────────────────────────────────────────────────────────────────────

  incrementUsage: (templateId: string) => {
    set(s => ({
      userSettings: { ...s.userSettings, usage_count: s.userSettings.usage_count + 1 },
    }));
    // Queue for batch flush
    try {
      const raw = mmkvStorage.getPendingUsage();
      const pending = raw ? JSON.parse(raw) : [];
      pending.push({ template_uuid: templateId, used_at: new Date().toISOString(), platform: Platform.OS });
      mmkvStorage.setPendingUsage(JSON.stringify(pending));
    } catch {}
  },

  flushUsage: async () => {
    try {
      const raw = mmkvStorage.getPendingUsage();
      if (!raw) return;
      const events = JSON.parse(raw);
      if (!events.length) return;
      await api.post('/usage/track', { events });
      mmkvStorage.clearPendingUsage();
    } catch {}
  },

  // ── Clipboard history ────────────────────────────────────────────────────────

  // Sadece panoya yazar — geçmişe kayıt yapmaz.
  // Geçmiş, uygulama öne gelince checkClipboard() ile otomatik güncellenir.
  copyTemplate: async (template, category) => {
    await ExpoClipboard.setStringAsync(template.content);
    get().incrementUsage(template.id);
    Analytics.templateUsed(category?.type ?? 'text');

    // 10. kullanımda App Store yıldız iste
    const count = get().userSettings.usage_count;
    if (count === 10 || count === 50) {
      try {
        if (await StoreReview.hasAction()) StoreReview.requestReview();
      } catch {}
    }

    // Anında geçmişe ekle ve extension'a sync et (checkClipboard'u bekleme)
    const limits = get().getPlanLimits();
    if (limits.smartClipboard) {
      const maxItems = limits.clipboardHistoryLimit === -1 ? 15 : limits.clipboardHistoryLimit;
      const history = mmkvStorage.getClipboardHistory();
      if (history.length === 0 || history[0].content !== template.content) {
        const copiedAt = Date.now();
        const item: ClipboardItem = {
          id: `clip_${copiedAt}_${Math.random().toString(36).slice(2, 5)}`,
          content: template.content,
          title: template.title,
          categoryName: category?.name ?? '',
          categoryType: category?.type ?? 'text',
          copiedAt,
        };
        mmkvStorage.addToClipboardHistory(item, maxItems);
        set({ clipboardHistory: mmkvStorage.getClipboardHistory() });
      }
    }
  },

  // Uygulama öne gelince çağrılır. smartClipboard aktifse pano içeriği değişmişse geçmişe ekler.
  checkClipboard: async () => {
    const limits = get().getPlanLimits();
    if (!limits.smartClipboard) return;
    const maxItems = limits.clipboardHistoryLimit === -1 ? 15 : limits.clipboardHistoryLimit;
    try {
      const content = await ExpoClipboard.getStringAsync();
      if (!content || !content.trim()) return;

      const history = mmkvStorage.getClipboardHistory();
      if (history.length > 0 && history[0].content === content) return;

      const copiedAt = Date.now();
      const title = content.length > 40 ? content.slice(0, 40) + '…' : content;

      // POST to backend — server assigns the real ID and enforces the plan's item limit
      try {
        const res = await api.post<any>('/clipboard', {
          content,
          title,
          category_name: 'Pano',
          category_type: 'text',
          copied_at: copiedAt,
        });
        const item: ClipboardItem = {
          id: String(res.item.id),
          content: res.item.content,
          title: res.item.title,
          categoryName: res.item.categoryName ?? 'Pano',
          categoryType: res.item.categoryType ?? 'text',
          copiedAt: res.item.copiedAt ?? copiedAt,
        };
        mmkvStorage.addToClipboardHistory(item, maxItems);
        set({ clipboardHistory: mmkvStorage.getClipboardHistory() });
      } catch {
        // Offline fallback — save locally only
        const item: ClipboardItem = {
          id: `clip_${copiedAt}_${Math.random().toString(36).slice(2, 5)}`,
          content,
          title,
          categoryName: 'Pano',
          categoryType: 'text',
          copiedAt,
        };
        mmkvStorage.addToClipboardHistory(item, maxItems);
        set({ clipboardHistory: mmkvStorage.getClipboardHistory() });
      }
    } catch {}
  },

  removeFromClipboardHistory: (id) => {
    mmkvStorage.removeFromClipboardHistory(id);
    set({ clipboardHistory: mmkvStorage.getClipboardHistory() });
    try { api.delete(`/clipboard/${id}`); } catch {}
  },

  clearClipboardHistory: () => {
    mmkvStorage.clearClipboardHistory();
    set({ clipboardHistory: [] });
    try { api.delete('/clipboard'); } catch {}
  },

  // ── Referral ─────────────────────────────────────────────────────────────────

  fetchReferralStats: async () => {
    try {
      const stats = await api.get<ReferralStats>('/referral/stats');
      set({ referralStats: stats });
    } catch (e) {
      console.error('Failed to fetch referral stats:', e);
    }
  },

  claimReward: async () => {
    try {
      await api.post('/referral/claim-reward', {});
      await get().fetchReferralStats();
      return 'ok';
    } catch (e) {
      console.error('Failed to claim reward:', e);
      return 'error';
    }
  },

  // ── Testimonials ─────────────────────────────────────────────────────────────

  fetchTestimonials: async () => {
    try {
      const testimonials = await api.get<Testimonial[]>('/testimonials');
      set({ testimonials });
    } catch (e) {
      console.error('Failed to fetch testimonials:', e);
    }
  },

  // ── Sector packs ─────────────────────────────────────────────────────────────

  markPackInstalled: (packId: string) => {
    set(s => {
      const updated = [...s.installedPacks, packId];
      mmkvStorage.setInstalledPacks(updated);
      return { installedPacks: updated };
    });
  },

  // ── Dev helpers ──────────────────────────────────────────────────────────────

  setPremium: (v) => {
    set(s => ({ userSettings: { ...s.userSettings, is_premium: v, plan: v ? 'business' : 'basic' } }));
  },

  setDevPlan: (plan) => {
    set(s => ({ userSettings: { ...s.userSettings, is_premium: plan !== 'business', plan } }));
  },

  expireTrialNow: () => {
    const expiredTs = Date.now() - (4 * 24 * 60 * 60 * 1000); // 4 gün önce
    mmkvStorage.setTrialStartedAt(expiredTs);
    set(s => ({ userSettings: { ...s.userSettings, trial_started_at: expiredTs, is_premium: false, plan: 'basic' } }));
  },

  resetAll: async () => {
    const plan = get().userSettings.plan;
    const BUSINESS_PLANS = ['business', 'business_yearly', 'ultra_pro', 'ultra_pro_yearly'];
    const isBiz = BUSINESS_PLANS.includes(plan);
    const cats = get().categories;

    if (isBiz) {
      // Business: sadece kullanıcı kategorilerini sil, sistem kategorilerini pasife al
      const userCats   = cats.filter(c => !c.is_system);
      const systemCats = cats.filter(c => c.is_system);
      for (const c of userCats) {
        try { await api.delete(`/categories/${c.id}`); } catch {}
      }
      // Sistem kategorilerini store'da bırak ama şablonsuz göster
      set({ categories: systemCats.map(c => ({ ...c, templates: [] })) });
      syncToKeyboard(get().categories);
    } else {
      // Non-business: hesabı sil, her şeyi sıfırla
      try { await api.delete('/auth/account'); } catch {}
      clearApiToken();
      mmkvStorage.clearAll();
      set({ categories: [], userSettings: DEFAULT_SETTINGS, isOnboarded: false });
      try { await get().authenticateDevice(); } catch {}
    }
  },
}));
