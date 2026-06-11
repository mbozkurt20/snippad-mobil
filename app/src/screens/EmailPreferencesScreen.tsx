import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Check } from 'lucide-react-native';
import { useT } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList, EmailPreferences } from '../types';
import { useAlert } from '../components/CustomAlert';
import ScreenHeader from '../components/ScreenHeader';
import { Colors, BorderRadius, Spacing } from '../theme';
import { api } from '../store/api';
import { colors, categoryColors } from '../theme/designTokens';

interface Props {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'EmailPreferences'>;
}

export default function EmailPreferencesScreen({ navigation }: Props) {
  const T = useT();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<EmailPreferences>({
    marketing: true,
    productUpdates: true,
    referralNotifications: true,
    newsletter: true,
  });
  const { showAlert, alertElement } = useAlert();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await api.get('/auth/me');
        const emailPrefs = res.data?.user?.email_preferences || {};
        setPrefs({
          marketing: emailPrefs.marketing ?? true,
          productUpdates: emailPrefs.product_updates ?? true,
          referralNotifications: emailPrefs.referral_notifications ?? true,
          newsletter: emailPrefs.newsletter ?? true,
        });
      } catch (err) {
        console.warn('Failed to load email preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/auth/email-preferences', {
        marketing: prefs.marketing,
        product_updates: prefs.productUpdates,
        referral_notifications: prefs.referralNotifications,
        newsletter: prefs.newsletter,
      });
      setSaved(true);
      showAlert({
        title: T.emailPreferencesSaved,
        message: '',
        buttons: [{ text: T.ok, style: 'default' }],
      });
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      showAlert({
        title: T.error,
        message: err?.message || T.emailPreferencesFailed,
        buttons: [{ text: T.ok, style: 'default' }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {alertElement}
      <ScreenHeader
        title={T.emailPreferences}
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={s.banner}>
          <Mail size={24} color={colors.primary} strokeWidth={1.5} />
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>{T.emailPreferences}</Text>
            <Text style={s.bannerText}>{T.emailPreferencesDesc}</Text>
          </View>
        </View>

        {/* Preference Items */}
        <View style={s.card}>
          <PreferenceRow
            label={T.emailMarketing}
            sub={T.emailMarketingSub}
            value={prefs.marketing}
            onToggle={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
          />
          <View style={s.sep} />

          <PreferenceRow
            label={T.emailUpdates}
            sub={T.emailUpdatesSub}
            value={prefs.productUpdates}
            onToggle={() => setPrefs(p => ({ ...p, productUpdates: !p.productUpdates }))}
          />
          <View style={s.sep} />

          <PreferenceRow
            label={T.emailReferral}
            sub={T.emailReferralSub}
            value={prefs.referralNotifications}
            onToggle={() => setPrefs(p => ({ ...p, referralNotifications: !p.referralNotifications }))}
          />
          <View style={s.sep} />

          <PreferenceRow
            label={T.emailNewsletter}
            sub={T.emailNewsletterSub}
            value={prefs.newsletter}
            onToggle={() => setPrefs(p => ({ ...p, newsletter: !p.newsletter }))}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[s.saveBtn, loading && s.saveBtnDisabled, saved && s.saveBtnSuccess]}
          onPress={handleSave}
          disabled={loading || saved}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : saved ? (
            <>
              <Check size={18} color={colors.surface} strokeWidth={2.5} />
              <Text style={s.saveBtnText}>{T.emailPreferencesSaved}</Text>
            </>
          ) : (
            <Text style={s.saveBtnText}>{T.emailSavePreferences}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: value ? 1 : 0, useNativeDriver: false, bounciness: 4 }).start();
  }, [value]);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [Colors.border, Colors.primary] });
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onValueChange(!value)}>
      <Animated.View style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: trackColor, justifyContent: 'center' }}>
        <Animated.View style={{
          width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface,
          transform: [{ translateX }],
          shadowColor: colors.ink, shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2,
        }} />
      </Animated.View>
    </TouchableOpacity>
  );
}

interface RowProps {
  label: string;
  sub: string;
  value: boolean;
  onToggle: () => void;
}

function PreferenceRow({ label, sub, value, onToggle }: RowProps) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowSub}>{sub}</Text>
      </View>
      <CustomSwitch value={value} onValueChange={onToggle} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.5 },
  scroll: { paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 },

  banner: {
    backgroundColor: colors.primarySoft,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 24,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  bannerText: { fontSize: 13, color: Colors.textGray, lineHeight: 18, fontWeight: '500' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: colors.ink,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rowLabel: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  rowSub: { fontSize: 12, color: Colors.textGray, fontWeight: '500' },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },

  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnSuccess: { backgroundColor: categoryColors[1] },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: colors.surface, letterSpacing: -0.2 },
});
