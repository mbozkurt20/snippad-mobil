import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Share2 } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import StandardHeader from '../components/StandardHeader';
import { useT } from '../i18n';
import { Colors, Spacing, BorderRadius } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';
import { useAlert } from '../components/CustomAlert';

// Use primary color from theme instead of hardcoded orange

interface Props {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'ReferralProgram'>;
}

export default function ReferralProgramScreen({ navigation }: Props) {
  const T = useT();
  const { referralStats, fetchReferralStats, claimReward } = useAppStore();
  const [claiming, setClaiming] = useState(false);
  const { alert } = useAlert();

  useEffect(() => {
    fetchReferralStats();
  }, [fetchReferralStats]);

  const maskCode = (code?: string) => {
    if (!code || code.length < 2) return code || 'Kod yükleniyor...';
    const masked = code[0] + '*'.repeat(Math.max(code.length - 2, 5)) + code[code.length - 1];
    return masked;
  };

  const handleShareCode = async () => {
    if (!referralStats?.code) return;
    try {
      const deepLink = `asistanklavye://referral?ref=${referralStats.code}`;
      const appStoreLink = 'https://apps.apple.com/app/snippad';
      const playStoreLink = 'https://play.google.com/store/apps/details?id=tech.vertexforge.snippad';

      const message = `Snippad ile yazı yazımını otomatikleştir!

Hızlı, Güvenli ve Açık

Davet Linkim:
${deepLink}

iOS: ${appStoreLink}
Android: ${playStoreLink}`;

      await Share.share({
        message,
        title: 'Snippad',
      });
    } catch {}
  };

  const handleClaimReward = async () => {
    setClaiming(true);
    const result = await claimReward();
    setClaiming(false);
    if (result === 'ok') {
      alert('Reward claimed!', 'success');
    } else {
      alert('Failed to claim reward', 'error');
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <StandardHeader
        title={T.referralProgram}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Marketing Banner */}
        <View style={s.banner}>
          <Gift size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>Arkadaşlarını Davet Et</Text>
            <Text style={s.bannerSub}>Her referral'da sınırsız erişim kazan</Text>
          </View>
        </View>

        {/* Share Card */}
        {referralStats && (
          <View style={s.card}>
            <View style={s.cardContent}>
              <Text style={s.cardTitle}>Davet Kodun Hazır</Text>
              <Text style={s.cardDesc}>Arkadaşlarını davet et ve premium özelliklere erişim sağla</Text>
              <View style={s.codeBox}>
                <Text style={s.codeText}>{maskCode(referralStats.code)}</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={handleShareCode} activeOpacity={0.8}>
              <Share2 size={16} color="#fff" />
              <Text style={s.btnText}>Davet Linki Gönder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits */}
        <View style={s.benefitsCard}>
          <Text style={s.benefitsTitle}>Neler Kazanırsın?</Text>
          <View style={s.benefitRow}>
            <Text style={s.benefitIcon}>✨</Text>
            <View>
              <Text style={s.benefitName}>Sınırsız Erişim</Text>
              <Text style={s.benefitDesc}>Tüm premium özellikleri kullan</Text>
            </View>
          </View>
          <View style={s.benefitRow}>
            <Text style={s.benefitIcon}>⚡</Text>
            <View>
              <Text style={s.benefitName}>Akıllı Şablonlar</Text>
              <Text style={s.benefitDesc}>Hızlı yazı yazımı & otomasyonu</Text>
            </View>
          </View>
          <View style={s.benefitRow}>
            <Text style={s.benefitIcon}>☁️</Text>
            <View>
              <Text style={s.benefitName}>Bulut Yedekleme</Text>
              <Text style={s.benefitDesc}>Verileriniz her cihazda senkron</Text>
            </View>
          </View>
        </View>

        {/* Referrals Count */}
        {referralStats && referralStats.referral_count > 0 && (
          <View style={[s.statCard, { borderLeftColor: Colors.primary }]}>
            <Text style={s.statLabel}>👥 Davetilen Arkadaş</Text>
            <Text style={s.statValue}>{referralStats.referral_count}</Text>
          </View>
        )}

        {/* Empty State */}
        {referralStats?.referral_count === 0 && (
          <View style={s.empty}>
            <Gift size={56} color={Colors.primary} />
            <Text style={s.emptyText}>Henüz Kimse Davet Etmedin</Text>
            <Text style={s.emptySub}>İlk arkadaşını davet et ve premium'u açarak başla</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, paddingBottom: 40 },

  banner: {
    backgroundColor: 'rgba(196, 87, 10, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(196, 87, 10, 0.18)',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  bannerSub: { fontSize: 12, color: Colors.textGray, marginTop: 2 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardContent: { marginBottom: Spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginBottom: Spacing.sm },
  cardDesc: { fontSize: 13, color: Colors.textGray, marginBottom: Spacing.md, lineHeight: 18 },
  cardLabel: { fontSize: 11, fontWeight: '600', color: Colors.textGray, textTransform: 'uppercase', marginBottom: Spacing.sm },

  benefitsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  benefitsTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: Spacing.md },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  benefitIcon: { fontSize: 20 },
  benefitName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  benefitDesc: { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  codeBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(196, 87, 10, 0.25)',
  },
  codeText: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: 2, textAlign: 'center' },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: { borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  btnPrimary: { backgroundColor: Colors.primary },
  btnSecondary: { borderWidth: 1, borderColor: Colors.border },
  btnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  btnTextSecondary: { color: Colors.primary },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  statLabel: { fontSize: 12, color: Colors.textGray, marginBottom: Spacing.sm, fontWeight: '600' },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.textDark },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: Spacing.lg },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginTop: Spacing.md, textAlign: 'center' },
  emptySub: { fontSize: 13, color: Colors.textGray, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
});
