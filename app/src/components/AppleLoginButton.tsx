import React, { useState } from 'react';
import { TouchableOpacity, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

type Props = {
  onSuccess: (identityToken: string, name?: string) => void;
  onError: () => void;
};

export default function AppleLoginButton({ onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const token = credential.identityToken;
      if (!token) throw new Error('identityToken alınamadı');
      // Apple sadece ilk girişte isim gönderir
      const name = credential.fullName?.givenName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName ?? ''}`.trim()
        : undefined;
      onSuccess(token, name);
    } catch (e: any) {
      // ERR_CANCELED = kullanıcı iptal etti, hata gösterme
      if (e?.code !== 'ERR_CANCELED') onError();
    }
    setLoading(false);
  };

  return (
    <TouchableOpacity style={s.btn} onPress={handlePress} disabled={loading} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator size="small" color="#fff" />
        : <Image source={require('../../assets/apple-logo.png')} style={s.logo} resizeMode="contain" />
      }
      <Text style={s.txt}>Apple ile Devam Et</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderWidth: 1.5, borderColor: '#000', borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md, backgroundColor: '#000',
  },
  logo: { width: 18, height: 18 },
  txt: { ...Typography.body, color: '#fff', fontWeight: '600' },
});
