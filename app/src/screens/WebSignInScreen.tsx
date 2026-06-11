import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Globe, Copy, Check, RotateCw } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAlert } from '../components/CustomAlert';
import ScreenHeader from '../components/ScreenHeader';
import { useT } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';
import * as Clipboard from 'expo-clipboard';
import { useAppStore } from '../store/useAppStore';
import { api } from '../store/api';
import { mmkvStorage } from '../store/storage';

type Props = {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'WebSignIn'>;
};

const WEB_SIGNIN_URL = 'https://snippad.vertexforge.tech/signin'; // Update with actual URL

export default function WebSignInScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const T = useT();
  const { showAlert } = useAlert();
  const [deviceCode, setDeviceCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get or refresh device code from backend
  const generateNewCode = async (forceNew = false) => {
    setLoading(true);
    try {
      if (forceNew) {
        // Refresh: call backend endpoint with force_new=true
        const res = await api.post<any>('/auth/device-code', {
          force_new: true,
        });
        setDeviceCode(res.device_code);
        mmkvStorage.setDeviceCode(res.device_code);
      } else {
        // Get from /auth/me (device_code bunda var)
        const res = await api.get<any>('/auth/me');
        const code = res.user?.device_code;
        if (code) {
          setDeviceCode(code);
          mmkvStorage.setDeviceCode(code);
        } else {
          throw new Error('Device code not found in profile');
        }
      }
      setCopied(false);
    } catch (e: any) {
      console.error('Device code error:', e);
      showAlert({
        title: 'Hata',
        message: 'Cihaz kodu alınamadı. Lütfen daha sonra deneyin.',
        buttons: [{ text: 'Tamam', style: 'default' }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Load code on mount (from MMKV if exists, otherwise from backend)
  React.useEffect(() => {
    const loadCode = async () => {
      const saved = mmkvStorage.getDeviceCode();
      if (saved) {
        setDeviceCode(saved);
      } else {
        await generateNewCode(false);
      }
    };
    loadCode();
  }, []);

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(deviceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showAlert({
        title: 'Başarılı',
        message: 'Cihaz kodu kopyalandı!',
        buttons: [{ text: 'Tamam', style: 'default' }],
      });
    } catch (e) {
      showAlert({
        title: 'Hata',
        message: 'Kod kopyalanamadı',
        buttons: [{ text: 'Tamam', style: 'default' }],
      });
    }
  };

  const handleOpenWebSignIn = async () => {
    try {
      const url = `${WEB_SIGNIN_URL}?device_code=${deviceCode}`;
      await Linking.openURL(url);
    } catch (e) {
      showAlert({
        title: 'Hata',
        message: 'Web sayfası açılamadı',
        buttons: [{ text: 'Tamam', style: 'default' }],
      });
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Web'den Oturum Aç"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: Math.max(insets.bottom, 8) + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={s.iconBox}>
          <Globe size={56} color={Colors.primary} />
        </View>

        {/* Title & Description */}
        <Text style={s.mainText}>Web'den Oturum Aç</Text>
        <Text style={s.subText}>
          Bilgisayarınızda Snippad web platformunda oturum açarak tüm kategorileri ve şablonlarınızı yönetin.
        </Text>

        {/* Device Code Box */}
        <View style={s.codeBox}>
          <Text style={s.codeLabel}>Cihaz Kodu</Text>
          <View style={s.codeDisplay}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={s.codeText}>{deviceCode}</Text>
            )}
            <View style={s.codeActions}>
              <TouchableOpacity
                onPress={handleCopyCode}
                style={s.codeBtn}
                disabled={loading}
              >
                {copied ? (
                  <Check size={20} color={Colors.primary} />
                ) : (
                  <Copy size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  showAlert({
                    title: 'Bilgi',
                    message: 'Kod yenileme şu anda kullanılamıyor. Hesap kodunuz değişmeyecek.',
                    buttons: [{ text: 'Tamam', style: 'default' }],
                  });
                }}
                style={s.codeBtn}
                disabled={loading}
              >
                <RotateCw size={20} color={Colors.textLight} opacity={0.5} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={s.codeHint}>
            Bu kodu bilgisayarınızdaki web oturum açma ekranına girin
          </Text>
        </View>

        {/* Features List */}
        <View style={s.featuresBox}>
          <Text style={s.featuresTitle}>Web'de Yapabilecekleriniz:</Text>
          <FeatureItem icon="✓" text="Tüm kategorileri ve şablonları yönet" />
          <FeatureItem icon="✓" text="Şablonları organize et ve sırala" />
          <FeatureItem icon="✓" text="İçeri aktar / Dışarı aktar (CSV, JSON)" />
          <FeatureItem icon="✓" text="Takım üyeleri davet et (Business planı)" />
          <FeatureItem icon="✓" text="Abonelik bilgilerini değiştir" />
        </View>

        {/* Open Web Button */}
        <TouchableOpacity
          style={s.webBtn}
          onPress={handleOpenWebSignIn}
          activeOpacity={0.8}
        >
          <Globe size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.webBtnText}>Web Sayfasını Aç</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={s.infoBox}>
          <Text style={s.infoText}>
            💡 İpucu: Cihaz kodunu girin ve otomatik olarak bu cihaza giriş yapılacak.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={s.featureItem}>
      <Text style={s.featureIcon}>{icon}</Text>
      <Text style={s.featureText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textDark },

  iconBox: { alignItems: 'center', marginVertical: 32 },

  mainText: { fontSize: 24, fontWeight: '700', color: Colors.textDark, marginBottom: 12, textAlign: 'center' },
  subText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },

  codeBox: {
    backgroundColor: Colors.cardLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  codeLabel: { fontSize: 12, fontWeight: '600', color: Colors.textLight, marginBottom: 8 },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  codeText: { fontSize: 20, fontWeight: '700', color: Colors.primary, letterSpacing: 2, flex: 1 },
  codeActions: { flexDirection: 'row', gap: 8 },
  codeBtn: { padding: 8 },
  codeHint: { fontSize: 12, color: Colors.textLight },

  featuresBox: {
    backgroundColor: Colors.cardLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  featureIcon: { fontSize: 16, marginRight: 10, color: Colors.primary },
  featureText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },

  webBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  webBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  infoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
