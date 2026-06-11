import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useAlert } from '../components/CustomAlert';
import { useT } from '../i18n';
import GoogleLoginButton from '../components/GoogleLoginButton';
import AppleLoginButton from '../components/AppleLoginButton';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { mmkvStorage } from '../store/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>; route?: any };
type Mode = 'login' | 'register';

export default function LoginScreen({ navigation, route }: Props) {
  const T = useT();
  const initialMode: Mode = (route?.params as any)?.mode ?? 'register';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('web-test@example.com');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  // Deep link'ten gelen referral kodu otomatik uygulanır
  const pendingRef = (() => { try { return mmkvStorage.getPendingReferralCode?.() ?? null; } catch { return null; } })();
  const { showAlert, alertElement } = useAlert();

  const { login, register, socialLogin, completeOnboarding, initializeWithToken } = useAppStore();

  // Dev mode (WEB ONLY): ?devMode=true ile token'la direkt gir
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window?.location?.search) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('devMode') === 'true') {
          console.log('[DEV] Initializing with test token...');
          initializeWithToken('717|fPWuRmJx8726yLeZhhXWyRZvJeqbIQxE30KxLDpk8796119d');
          completeOnboarding();
          setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }), 100);
        }
      }
    } catch (e) {
      console.warn('Dev mode check failed (mobile?):', e);
    }
  }, []);

  const isValid = email.trim() && password.length >= 6 && (mode === 'login' || name.trim().length >= 2);

  const goToMain = () => {
    completeOnboarding();
    setTimeout(() => {
      try { navigation.reset({ index: 0, routes: [{ name: 'Main' }] }); } catch {}
    }, 150);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(email.trim(), password)
        : await register(name.trim(), email.trim(), password, pendingRef ?? undefined);
      setLoading(false);
      if (result === 'ok') {
        try { mmkvStorage.clearPendingReferralCode?.(); } catch {}
        goToMain();
      } else if (result === 'error') {
        showAlert({
          title: T.error,
          message: mode === 'login' ? T.loginFailed : T.registerFailed,
          buttons: [{ text: T.ok, style: 'default' }],
        });
      }
    } catch (err: any) {
      setLoading(false);
      showAlert({
        title: T.error,
        message: err?.message || (mode === 'login' ? T.loginFailed : T.registerFailed),
        buttons: [{ text: T.ok, style: 'default' }],
      });
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    const result = await socialLogin('google', idToken);
    if (result === 'ok') { goToMain(); } else {
      showAlert({ title: T.googleLoginError, message: T.socialRetry, buttons: [{ text: T.ok, style: 'default' }] });
    }
  };

  const handleGoogleError = () => {
    showAlert({ title: T.error, message: T.googleLoginFailed, buttons: [{ text: T.ok, style: 'default' }] });
  };

  const handleAppleSuccess = async (identityToken: string, name?: string) => {
    const result = await socialLogin('apple', identityToken, name);
    if (result === 'ok') { goToMain(); } else {
      showAlert({ title: T.appleLoginError, message: T.socialRetry, buttons: [{ text: T.ok, style: 'default' }] });
    }
  };

  const handleAppleError = () => {
    showAlert({ title: T.error, message: T.appleLoginFailed, buttons: [{ text: T.ok, style: 'default' }] });
  };

  return (
    <SafeAreaView style={s.container}>
      {alertElement}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo area */}
          <View style={s.heroArea}>
            <View style={s.logoWrap}>
              <Image source={require('../../assets/logo.png')} style={s.logoImage} resizeMode="contain" />
            </View>
            <Text style={s.appName}>{T.appName}</Text>
            <Text style={s.tagline}>{mode === 'login' ? T.loginTagline : T.registerTagline}</Text>
          </View>

          {/* Social */}
          <View style={s.socialRow}>
            <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            {Platform.OS === 'ios' && (
              <AppleLoginButton onSuccess={handleAppleSuccess} onError={handleAppleError} />
            )}
          </View>

          <View style={s.divRow}>
            <View style={s.div} />
            <Text style={s.divTxt}>{T.orEmail}</Text>
            <View style={s.div} />
          </View>

          {/* Form */}
          <View style={s.form}>
            {mode === 'register' && (
              <View style={s.field}>
                <User size={17} color={Colors.textGray} />
                <TextInput
                  style={s.input} placeholder={T.nameSurname}
                  placeholderTextColor={Colors.textLight}
                  value={name} onChangeText={setName} autoCapitalize="words"
                  selectionColor={Colors.primary}
                  cursorColor={Colors.primary} />
              </View>
            )}
            <View style={s.field}>
              <Mail size={17} color={Colors.textGray} />
              <TextInput
                style={s.input} placeholder={T.email}
                placeholderTextColor={Colors.textLight}
                value={email} onChangeText={setEmail}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                selectionColor={Colors.primary}
                cursorColor={Colors.primary} />
            </View>
            <View style={s.field}>
              <Lock size={17} color={Colors.textGray} />
              <TextInput
                style={[s.input, { flex: 1 }]} placeholder={T.password}
                placeholderTextColor={Colors.textLight}
                value={password} onChangeText={setPassword}
                secureTextEntry={!showPw} autoCapitalize="none"
                selectionColor={Colors.primary}
                cursorColor={Colors.primary} />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                {showPw
                  ? <EyeOff size={17} color={Colors.textLight} />
                  : <Eye size={17} color={Colors.textLight} />}
              </TouchableOpacity>
            </View>

            {mode === 'login' && (
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.forgotBtn}>
                <Text style={s.forgotTxt}>{T.forgotPassword}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[s.submitBtn, !isValid && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.85}>
              <Text style={s.submitBtnText}>
                {loading ? T.loading : mode === 'login' ? T.login : T.register}
              </Text>
              {!loading && <ArrowRight size={18} color="#fff" />}
            </TouchableOpacity>
          </View>

          {/* Mode switch */}
          <TouchableOpacity style={s.switchMode} onPress={() => setMode(m => m === 'login' ? 'register' : 'login')}>
            <Text style={s.switchModeText}>
              {mode === 'login' ? T.noAccountQ : T.hasAccountQ}
              <Text style={s.switchModeAccent}>
                {mode === 'login' ? T.registerCta : T.loginCta}
              </Text>
            </Text>
          </TouchableOpacity>

          <Text style={s.disclaimer}>
            {T.termsPrefix}
            <Text style={s.disclaimerLink} onPress={() => Linking.openURL('https://snippad.vertexforge.tech/terms')}>{T.termsLinkLabel}</Text>
            {T.termsAnd}
            <Text style={s.disclaimerLink} onPress={() => Linking.openURL('https://snippad.vertexforge.tech/privacy')}>{T.privacyLinkLabel}</Text>
            {T.termsSuffix}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center' },

  heroArea: { alignItems: 'center', paddingTop: Spacing.xxl, marginBottom: Spacing.xl },
  logoWrap: {
    width: 76, height: 76, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoImage: { width: 56, height: 56, borderRadius: 14 },
  appName: { fontSize: 26, fontWeight: '700' as const, color: Colors.textDark, letterSpacing: -0.5, marginBottom: 4 },
  tagline: { fontSize: 15, color: Colors.textGray },

  socialRow: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.lg },

  divRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, width: '100%', marginBottom: Spacing.lg },
  div: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  divTxt: { fontSize: 12, color: Colors.textLight, letterSpacing: 0.1 },

  form: { width: '100%', gap: 10, marginBottom: Spacing.lg },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, minHeight: 52,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.primary, shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  input: { flex: 1, fontSize: 15, color: Colors.textDark, paddingVertical: 14 },

  forgotBtn: { alignSelf: 'flex-end', paddingVertical: 8, marginBottom: 12 },
  forgotTxt: { fontSize: 13, color: Colors.primary, fontWeight: '500' as const },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 15, marginTop: 4,
    shadowColor: Colors.primary, shadowOpacity: 0.12, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  submitBtnText: { fontSize: 16, fontWeight: '600' as const, color: Colors.white },

  switchMode: { paddingVertical: Spacing.sm, marginBottom: Spacing.sm },
  switchModeText: { fontSize: 14, color: Colors.textGray },
  switchModeAccent: { color: Colors.primary, fontWeight: '600' as const },

  disclaimer: { fontSize: 11, color: Colors.textLight, textAlign: 'center', lineHeight: 18, paddingHorizontal: Spacing.md },
  disclaimerLink: { color: Colors.primary },
});
