import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, ExternalLink } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useT } from '../i18n';
import ScreenHeader from '../components/ScreenHeader';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'Permissions'> };

type PermItem = { key: string; title: string; description: string; required: boolean; platform: 'all' | 'ios' | 'android' };

export default function PermissionsScreen({ navigation }: Props) {
  const T = useT();
  const insets = useSafeAreaInsets();

  const PERMISSIONS: PermItem[] = [
    { key: 'microphone', title: T.permMicTitle, description: T.permMicDesc, required: false, platform: 'all' },
    { key: 'contacts', title: T.permContactsTitle, description: T.permContactsDesc, required: false, platform: 'all' },
    { key: 'keyboard', title: T.permKeyboardTitle, description: T.permKeyboardDesc, required: true, platform: 'all' },
    { key: 'full_access', title: T.permFullAccessTitle, description: T.permFullAccessDesc, required: true, platform: 'ios' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScreenHeader
        title={T.permissionsTitle}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.intro}>{T.permissionsIntro}</Text>

        {PERMISSIONS.filter(p => p.platform === 'all' || p.platform === Platform.OS).map(perm => (
          <View key={perm.key} style={s.card}>
            <View style={s.cardRow}>
              <AlertCircle size={20} color={perm.required ? Colors.primary : Colors.textGray} />
              <View style={s.cardText}>
                <View style={s.cardTitleRow}>
                  <Text style={s.cardTitle}>{perm.title}</Text>
                  {perm.required && (
                    <View style={s.badge}>
                      <Text style={s.badgeTxt}>{T.permRequired}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.cardDesc}>{perm.description}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>{T.permManagementTitle}</Text>
          <Text style={s.infoText}>{T.permManagementText}</Text>
        </View>

        <TouchableOpacity
          style={[s.settingsBtn, { marginBottom: Math.max(32, insets.bottom + 16) }]}
          onPress={() => Linking.openSettings()}
        >
          <ExternalLink size={16} color={Colors.white} />
          <Text style={s.settingsBtnText}>{T.openSystemSettings}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { marginRight: Spacing.sm },
  title: { ...Typography.h2, color: Colors.textDark },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  intro: { ...Typography.body, color: Colors.textGray, marginBottom: Spacing.sm },
  card: { backgroundColor: Colors.cardLight, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  cardRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  cardText: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardTitle: { ...Typography.h3, color: Colors.textDark },
  badge: { backgroundColor: Colors.primary + '22', borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTxt: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  cardDesc: { ...Typography.caption, color: Colors.textGray, lineHeight: 18 },
  infoBox: { backgroundColor: Colors.cardLight, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  infoTitle: { ...Typography.h3, color: Colors.textDark, marginBottom: 6 },
  infoText: { ...Typography.caption, color: Colors.textGray, lineHeight: 18 },
  settingsBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl },
  settingsBtnText: { ...Typography.h3, color: Colors.white },
});
