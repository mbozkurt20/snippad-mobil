import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { View, AppState, AppStateStatus, Platform, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry (error tracking)
Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/project-id', // TODO: Replace with real DSN
  debug: false,
  tracesSampleRate: 0.1,
});

// Initialize Firebase (must be before using messaging/FCM)
if (Platform.OS !== 'web') {
  try {
    require('@react-native-firebase/app');
  } catch (e) {
    console.warn('Firebase app init failed:', e instanceof Error ? e.message : e);
  }
}
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation';
import { useAppStore } from './src/store/useAppStore';
import { registerFCMToken, setupFCMForegroundHandler } from './src/store/notifications';
import { api } from './src/store/api';
import { applyLangDirection } from './src/i18n';
import { mmkvStorage } from './src/store/storage';
import { initLogger, useLogger } from './src/utils/logger';
import LogViewer from './src/components/LogViewer';
import SplashScreen from './src/components/SplashScreen';

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const msg = `ERROR: ${error.message}\n${errorInfo.componentStack}`;
    console.error(msg);
    // Send to Sentry
    Sentry.captureException(new Error(msg));
    try {
      mmkvStorage.setErrorLog?.(msg);
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            Uygulama Hatası
          </Text>
          <Text style={{ color: '#ff6b6b', fontSize: 12, textAlign: 'center', fontFamily: 'monospace' }}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppBootstrap() {
  const boot = useAppStore(s => s.boot);
  const flushUsage = useAppStore(s => s.flushUsage);
  const checkClipboard = useAppStore(s => s.checkClipboard);
  const loadFromApi = useAppStore(s => s.loadFromApi);
  const addLog = useLogger(s => s.addLog);
  const [ready, setReady] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Init logger
    // initLogger();
    // addLog('info', '🚀 Uygulama başlatıldı');

    // Apply RTL direction on startup (persisted language)
    try {
      const savedLang = mmkvStorage.getAppLanguage?.();
      if (savedLang) applyLangDirection(savedLang as any);
      // addLog('info', `🌐 Dil: ${savedLang}`);
    } catch (e) {
      // addLog('error', 'Dil ayarı yüklenemedi', e);
    }

    boot().finally(() => {
      setReady(true);
      // addLog('info', '✅ Uygulama hazır');
    });
    flushUsage();
    checkClipboard();
    // FCM token kayıt + foreground handler (web'de skip)
    let unsubFCM: (() => void) | null = null;
    if (Platform.OS !== 'web') {
      registerFCMToken(api.post);
      unsubFCM = setupFCMForegroundHandler();
    }

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        checkClipboard();
        // Delay loadFromApi slightly so checkClipboard's local write completes first
        // and avoids a race where loadFromApi overwrites the freshly added item
        setTimeout(() => loadFromApi(), 1500);
      }
      appState.current = next;
    });
    return () => { sub.remove(); unsubFCM?.(); };
  }, []);

  if (!ready) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      {/* <LogViewer /> */}
    </View>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <AppBootstrap />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(App);
