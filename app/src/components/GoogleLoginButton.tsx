import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

type Props = {
  onSuccess: (idToken: string) => void;
  onError: () => void;
};

export default function GoogleLoginButton({ onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '569048387854-72542clbqgdkba5stjehblnsmc8cehm0.apps.googleusercontent.com',
      iosClientId: '569048387854-47gc1vbncvq034bhmhbkalul4uitqomc.apps.googleusercontent.com',
      androidClientId: '80524454560-957koflcq8tdlvh1m86310ddne5b6uov.apps.googleusercontent.com',
      offlineAccess: false,
      scopes: ['profile', 'email'],
    } as any);
  }, []);

  const handlePress = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (idToken) {
        onSuccess(idToken);
      } else {
        onError();
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error('Google login error:', error);
        onError();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={s.btn} onPress={handlePress} disabled={loading} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={Colors.textDark} size="small" />
        : <>
            <Image source={require('../../assets/google-logo.png')} style={s.logo} resizeMode="contain" />
            <Text style={s.txt}>Google ile Devam Et</Text>
          </>
      }
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
