import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, MessageCircle, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useT } from '../i18n';
import ScreenHeader from '../components/ScreenHeader';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'HelpSupport'> };

export default function HelpSupportScreen({ navigation }: Props) {
  const T = useT();

  const contacts = [
    {
      icon: Mail,
      title: T.generalInfo,
      subtitle: 'info@vertexforge.tech',
      onPress: () => Linking.openURL('mailto:info@vertexforge.tech'),
    },
    {
      icon: MessageCircle,
      title: T.techSupport,
      subtitle: 'support@vertexforge.tech',
      onPress: () => Linking.openURL('mailto:support@vertexforge.tech'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={T.helpTitle}
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>👋</Text>
          <Text style={styles.heroTitle}>{T.howCanHelp}</Text>
          <Text style={styles.heroSub}>{T.helpSubtitle}</Text>
        </View>

        {/* Contact */}
        <Text style={styles.sectionLabel}>{T.contact}</Text>
        <View style={styles.card}>
          {contacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <React.Fragment key={c.title}>
                <TouchableOpacity style={styles.contactRow} onPress={c.onPress} activeOpacity={0.7}>
                  <View style={styles.contactIcon}>
                    <Icon size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>{c.title}</Text>
                    <Text style={styles.contactSubtitle}>{c.subtitle}</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.textLight} />
                </TouchableOpacity>
                {i < contacts.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>{T.faq}</Text>
        <View style={styles.faqCard}>
          {T.faqItems.map((item, i) => (
            <React.Fragment key={i}>
              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Text style={styles.faqA}>{item.a}</Text>
              </View>
              {i < T.faqItems.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </View>

        {/* Company */}
        <View style={styles.companyCard}>
          <Text style={styles.companyName}>VertexForge</Text>
          <Text style={styles.companyDesc}>{T.companyDesc}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...Typography.h3, color: Colors.textDark },
  scroll: { paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  heroEmoji: { fontSize: 48, marginBottom: Spacing.md },
  heroTitle: { ...Typography.h2, color: Colors.textDark, marginBottom: Spacing.sm },
  heroSub: { ...Typography.body, color: Colors.textGray, textAlign: 'center', lineHeight: 22 },
  sectionLabel: {
    ...Typography.label, color: Colors.textLight, letterSpacing: 1,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  card: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.lg,
  },
  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md + 2, gap: Spacing.md,
  },
  contactIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardLavender, alignItems: 'center', justifyContent: 'center',
  },
  contactInfo: { flex: 1 },
  contactTitle: { ...Typography.body, color: Colors.textDark, fontWeight: '600' },
  contactSubtitle: { ...Typography.caption, color: Colors.primary, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.md },
  faqCard: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.cardLight,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
  },
  faqItem: { paddingVertical: Spacing.md },
  faqQ: { ...Typography.body, color: Colors.textDark, fontWeight: '600', marginBottom: Spacing.xs },
  faqA: { ...Typography.body, color: Colors.textGray, lineHeight: 20 },
  companyCard: {
    marginHorizontal: Spacing.lg, alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  companyName: { ...Typography.label, color: Colors.textLight, fontWeight: '700', letterSpacing: 1 },
  companyDesc: { ...Typography.caption, color: Colors.textLight, marginTop: 4, textAlign: 'center' },
});
