import React, { useState } from 'react';
import { TouchableOpacity, Text, Image, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '569048387854-ricv9pt4a7mfucai8pdflrlndql0fsug.apps.googleusercontent.com';
// Reverse Android client ID — Google Cloud Console'da bu scheme kayıtlı olmalı
const ANDROID_REDIRECT = 'com.googleusercontent.apps.569048387854-ricv9pt4a7mfucai8pdflrlndql0fsug:/oauth2redirect/google';

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;
const GOOGLE_WEB_CLIENT_ID  = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID  || undefined;

type Props = {
  onSuccess: (idToken: string) => void;
  onError: () => void;
};

export default function GoogleLoginButton({ onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const [, , promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId:     GOOGLE_IOS_CLIENT_ID,
    webClientId:     GOOGLE_WEB_CLIENT_ID,
    redirectUri: Platform.OS === 'android'
      ? makeRedirectUri({ native: ANDROID_REDIRECT })
      : makeRedirectUri({ scheme: 'asistanklavye' }),
  });

  const handlePress = async () => {
    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') { setLoading(false); return; }
      const idToken = result.params?.id_token ?? result.authentication?.idToken;
      if (!idToken) throw new Error('id_token alınamadı');
      onSuccess(idToken);
    } catch {
      onError();
    }
    setLoading(false);
  };

  return (
    <TouchableOpacity style={s.btn} onPress={handlePress} disabled={loading} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator size="small" color="#4285F4" />
        : <Image source={require('../../assets/google-logo.png')} style={s.logo} resizeMode="contain" />
      }
      <Text style={s.txt}>Google ile Devam Et</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md, backgroundColor: Colors.white,
  },
  logo: { width: 20, height: 20 },
  txt: { ...Typography.body, color: Colors.textDark, fontWeight: '600' },
});
