import { Platform } from 'react-native';

// Firebase analytics — only on native platforms (requires google-services.json)
let analytics: any = null;
if (Platform.OS !== 'web') {
  try {
    const firebaseApp = require('@react-native-firebase/app');
    if (firebaseApp && firebaseApp.app()) {
      analytics = require('@react-native-firebase/analytics').default;
    }
  } catch (e) {
    console.warn('Firebase analytics unavailable (google-services.json missing):', e instanceof Error ? e.message : e);
  }
}

// Fallback for web or when Firebase unavailable
const stub = () => ({ logEvent: () => Promise.resolve(), catch: () => {} });
const getAnalytics = () => (analytics ? analytics() : stub());

// Temel event'ler — marketing kararları için kritik
export const Analytics = {

  // Onboarding
  onboardingCompleted: () =>
    getAnalytics().logEvent?.('onboarding_completed').catch(() => {}) ?? Promise.resolve(),

  // Paywall
  paywallViewed: (source: string) =>
    getAnalytics().logEvent?.('paywall_viewed', { source }).catch(() => {}) ?? Promise.resolve(),

  subscriptionStarted: (plan: string, period: 'monthly' | 'yearly') =>
    getAnalytics().logEvent?.('subscription_started', { plan, period }).catch(() => {}) ?? Promise.resolve(),

  subscriptionRestored: (plan: string) =>
    getAnalytics().logEvent?.('subscription_restored', { plan }).catch(() => {}) ?? Promise.resolve(),

  // Şablon kullanımı
  templateUsed: (categoryType: string) =>
    getAnalytics().logEvent?.('template_used', { category_type: categoryType }).catch(() => {}) ?? Promise.resolve(),

  // Kategori
  categoryCreated: (type: string) =>
    getAnalytics().logEvent?.('category_created', { type }).catch(() => {}) ?? Promise.resolve(),

  // Klavye
  keyboardEnabled: () =>
    getAnalytics().logEvent?.('keyboard_enabled').catch(() => {}) ?? Promise.resolve(),

  // Kullanıcı özellikleri
  setPlan: (plan: string) =>
    getAnalytics().setUserProperty?.('plan', plan).catch(() => {}) ?? Promise.resolve(),

  setLoginMethod: (method: 'email' | 'google' | 'apple' | 'device') =>
    getAnalytics().setUserProperty?.('login_method', method).catch(() => {}) ?? Promise.resolve(),
};
