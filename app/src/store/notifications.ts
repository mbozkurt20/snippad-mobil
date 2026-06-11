import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { mmkvStorage } from './storage';

// Firebase messaging — only on native platforms (requires google-services.json)
let messaging: any = null;
if (Platform.OS !== 'web') {
  try {
    // Firebase only available if google-services.json is configured
    const firebaseApp = require('@react-native-firebase/app');
    if (firebaseApp && firebaseApp.app()) {
      messaging = require('@react-native-firebase/messaging').default;
    }
  } catch (e) {
    console.warn('Firebase messaging unavailable (google-services.json missing):', e instanceof Error ? e.message : e);
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Trial bitiş bildirimi — onboarding tamamlanınca schedule et
export async function scheduleTrialEndNotifications(trialStartedAt: number): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const trialEndMs = trialStartedAt + 3 * 24 * 60 * 60 * 1000;
    const oneDayBeforeMs = trialEndMs - 24 * 60 * 60 * 1000;
    const now = Date.now();

    // 1 gün kala hatırlatma
    if (oneDayBeforeMs > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏳ Business denemen yarın bitiyor',
          body: 'Tüm özelliklerden yararlanmaya devam etmek için planını seç.',
          data: { screen: 'Paywall' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(oneDayBeforeMs) },
      });
    }

    // Deneme bitişinde
    if (trialEndMs > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔓 Business denemen bitti',
          body: 'Snippad\'a devam et — şablonların seni bekliyor.',
          data: { screen: 'Paywall' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(trialEndMs) },
      });
    }
  } catch {}
}

// Re-engagement — 7 gün açılmayan kullanıcıya
export async function scheduleReEngagementNotification(): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    await Notifications.scheduleNotificationAsync({
      identifier: 'reengagement-7d',
      content: {
        title: '⌨️ Şablonların seni özlüyor',
        body: 'Snippad\'ı aç, IBAN ve adreslerini tek tuşla kullan.',
        data: { screen: 'Main' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: sevenDaysMs / 1000, repeats: false },
    });
  } catch {}
}

// Bildirime tıklanınca deep navigation için listener
export function setupNotificationResponseListener(navigate: (screen: string) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    const screen = response.notification.request.content.data?.screen as string;
    if (screen) navigate(screen);
  });
  return () => sub.remove();
}

// FCM token al ve backend'e kaydet (remote push için)
export async function registerFCMToken(apiPostFn: (path: string, body: unknown) => Promise<any>): Promise<void> {
  try {
    if (Platform.OS === 'web' || !messaging) return;
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED
      || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return;

    const token = await messaging().getToken();
    if (token) {
      
      await apiPostFn('/push/register', { token, platform: Platform.OS }).catch(() => {});
    }

    // Token yenilenince güncelle
    messaging().onTokenRefresh((newToken: string) => {
      apiPostFn('/push/register', { token: newToken, platform: Platform.OS }).catch(() => {});
    });
  } catch {}
}

// Foreground'da gelen bildirimleri göster
export function setupFCMForegroundHandler(): () => void {
  if (!messaging) return () => {};
  return messaging().onMessage(async (remoteMessage: any) => {
    const title = remoteMessage.notification?.title ?? 'Snippad';
    const body  = remoteMessage.notification?.body  ?? '';
    if (body) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null,
      });
    }
  });
}
