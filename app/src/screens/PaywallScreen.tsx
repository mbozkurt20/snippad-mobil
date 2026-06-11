import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X } from 'lucide-react-native';
import { Colors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Analytics } from '../store/analytics';
import { useEffect } from 'react';
import SubscriptionSuccess from '../components/SubscriptionSuccess';
import { useT } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DashboardStackParamList, PlanId, RootStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<DashboardStackParamList, 'Paywall'> };

interface Plan {
  id: PlanId;
  yearlyId: PlanId;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
  popular: boolean;
}


function currentPlanToCard(plan: PlanId): PlanId {
  if (plan === 'basic' || plan === 'basic_yearly') return 'basic';
  if (plan === 'business' || plan === 'business_yearly' || plan === 'ultra_pro' || plan === 'ultra_pro_yearly') return 'business';
  return 'pro'; // free veya pro → pro seçili
}

function currentPlanYearly(plan: PlanId): boolean {
  return plan === 'basic_yearly' || plan === 'pro_yearly' || plan === 'business_yearly' || plan === 'ultra_pro_yearly';
}

export default function PaywallScreen({ navigation }: Props) {
  const T = useT();
  const { purchasePlan, restorePurchases, userSettings, trialDaysLeft, isInTrial, isTrialExpired } = useAppStore();
  const currentPlan = userSettings.plan ?? 'basic';

  useEffect(() => {
    Analytics.paywallViewed('screen');
  }, []);
  const [selected, setSelected] = useState<PlanId>(() => currentPlanToCard(currentPlan));
  const [yearly, setYearly] = useState(() => currentPlanYearly(currentPlan));
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<NavigationProp<RootStackParamList>>();

  const PLANS: Plan[] = [
    {
      id: 'basic',
      yearlyId: 'basic_yearly',
      name: T.planPersonalName,
      monthlyPrice: '₺29,99',
      yearlyPrice: '₺199,99',
      features: T.planPersonalFeatures,
      popular: false,
    },
    {
      id: 'pro',
      yearlyId: 'pro_yearly',
      name: 'Pro',
      monthlyPrice: '₺49,99',
      yearlyPrice: '₺349,99',
      features: T.planProFeatures,
      popular: true,
    },
    {
      id: 'business',
      yearlyId: 'business_yearly',
      name: 'Business',
      monthlyPrice: '₺79,99',
      yearlyPrice: '₺599,99',
      features: T.planBusinessFeatures,
      popular: false,
    },
  ];

  const isLoggedIn = userSettings.is_logged_in;
  const plan = PLANS.find(p => p.id === selected)!;
  const price = yearly ? `${plan.yearlyPrice}${T.perYear}` : `${plan.monthlyPrice}${T.perMonth}`;
  const expired = isTrialExpired();
  const inTrial = isInTrial();
  const daysLeft = trialDaysLeft();

  const handleBuy = async () => {
    if (!isLoggedIn) { rootNav.navigate('Login'); return; }
    setPurchasing(true);
    await purchasePlan(yearly ? plan.yearlyId : selected);
    setPurchasing(false);
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <StatusBar style="light" />

      <SubscriptionSuccess
        visible={showSuccess}
        planName={plan.name}
        planAccent={Colors.primary}
        features={plan.features}
        onContinue={() => {
          setShowSuccess(false);
          if (navigation.canGoBack()) navigation.goBack();
        }}
      />

      {/* Restore — top right */}
      <TouchableOpacity
        style={s.restoreTop}
        onPress={async () => { setRestoring(true); await restorePurchases(); setRestoring(false); }}
        disabled={restoring}>
        <Text style={s.restoreTxt}>{restoring ? T.restoring : T.restorePurchase}</Text>
      </TouchableOpacity>

      {/* Close */}
      {!expired && (
        <TouchableOpacity style={s.close} onPress={() => navigation.goBack()}>
          <X size={16} color="#666" />
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={s.title}>{T.paywallTitle}</Text>
        <Text style={s.subtitle}>
          {expired
            ? T.paywallTrialExpired
            : inTrial
              ? T.paywallTrialActive(daysLeft)
              : T.paywallUnlock}
        </Text>

        {/* Sosyal kanıt */}
        <View style={s.socialProof}>
          <Text style={s.socialProofTxt}>⭐⭐⭐⭐⭐</Text>
          <Text style={s.socialProofSub}>IBAN, adres, şablonları tek dokunuşla yapıştır — günde dakikalar kazan</Text>
        </View>

        {/* Billing toggle */}
        <View style={s.toggle}>
          <TouchableOpacity
            style={[s.tPill, !yearly && s.tPillOn]}
            onPress={() => setYearly(false)}
            activeOpacity={0.8}>
            <Text style={[s.tTxt, !yearly && s.tTxtOn]}>{T.monthly}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tPill, yearly && s.tPillOn]}
            onPress={() => setYearly(true)}
            activeOpacity={0.8}>
            <Text style={[s.tTxt, yearly && s.tTxtOn]}>{T.yearly}</Text>
            <View style={s.saveBadge}><Text style={s.saveTxt}>%44</Text></View>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        {PLANS.map(p => {
          const active = selected === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[s.card, active && s.cardActive]}
              onPress={() => setSelected(p.id)}
              activeOpacity={0.85}>

              {/* Card top */}
              <View style={s.cardTop}>
                <View style={s.nameRow}>
                  <View style={[s.dot, !active && s.dotDim]} />
                  <Text style={[s.planName, active && s.planNameActive]}>{p.name}</Text>
                  {p.popular && (
                    <View style={s.popChip}>
                      <Text style={s.popTxt}>{T.popular}</Text>
                    </View>
                  )}
                </View>
                <View style={s.priceWrap}>
                  <Text style={[s.price, active && s.priceActive]}>
                    {yearly ? p.yearlyPrice : p.monthlyPrice}
                  </Text>
                  <Text style={s.per}>{yearly ? ` ${T.perYear}` : ` ${T.perMonth}`}</Text>
                </View>
              </View>

              {/* Features */}
              <View style={s.feats}>
                {p.features.map(f => (
                  <View key={f} style={s.featRow}>
                    <Check
                      size={12}
                      color={active ? Colors.primary : '#2a2a2a'}
                      strokeWidth={3}
                    />
                    <Text style={[s.featTxt, active && s.featTxtActive]}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Legal */}
        <View style={s.legalRow}>
          <Text
            style={s.link}
            onPress={() => Linking.openURL('https://snippad.vertexforge.tech/privacy')}>
            {T.privacy}
          </Text>
          <Text style={s.legalDot}>·</Text>
          <Text
            style={s.link}
            onPress={() => Linking.openURL('https://snippad.vertexforge.tech/terms')}>
            {T.termsLinkLabel}
          </Text>
        </View>

      </ScrollView>

      {/* Bottom CTA — extra padding so button clears tab bar */}
      <View style={[s.cta, { paddingBottom: Math.max(insets.bottom + 100, 120) }]}>
        <View style={s.divider} />
        <TouchableOpacity
          style={[s.ctaBtn, purchasing && s.ctaBtnDisabled]}
          onPress={handleBuy}
          activeOpacity={0.85}
          disabled={purchasing}>
          {purchasing
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.ctaTxt}>
                {isLoggedIn ? T.buyNow(price) : T.createAccountAndStart}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#0A0A0A' },

  close:          { position: 'absolute', top: 58, left: 20, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#161616', borderWidth: 0.5, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  restoreTop:     { position: 'absolute', top: 66, right: 20, zIndex: 10 },
  restoreTxt:     { fontSize: 11, color: '#888' },

  scroll:         { paddingHorizontal: 20, paddingTop: 80, paddingBottom: 24 },

  title:          { fontSize: 24, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 5 },
  subtitle:       { fontSize: 13, color: '#AAA', marginBottom: 20, lineHeight: 19 },

  toggle:         { flexDirection: 'row', backgroundColor: '#111', borderRadius: 10, padding: 3, marginBottom: 16, borderWidth: 0.5, borderColor: '#1e1e1e' },
  tPill:          { flex: 1, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  tPillOn:        { backgroundColor: '#1a1a1a', borderWidth: 0.5, borderColor: Colors.primary },
  tTxt:           { fontSize: 12, fontWeight: '600', color: '#888' },
  tTxtOn:         { color: '#fff' },
  saveBadge:      { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  saveTxt:        { fontSize: 9, fontWeight: '800', color: '#fff' },

  card:           { backgroundColor: '#0D0D0D', borderRadius: 14, borderWidth: 1, borderColor: '#1a1a1a', padding: 14, marginBottom: 8 },
  cardActive:     { borderColor: Colors.primary, backgroundColor: '#0f0800' },

  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  nameRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot:            { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  dotDim:         { backgroundColor: '#333' },
  planName:       { fontSize: 14, fontWeight: '600', color: '#999' },
  planNameActive: { color: '#fff' },
  popChip:        { backgroundColor: '#FF6B0015', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 0.5, borderColor: '#FF6B0040' },
  popTxt:         { fontSize: 9, fontWeight: '700', color: Colors.primary },

  priceWrap:      { flexDirection: 'row', alignItems: 'baseline' },
  price:          { fontSize: 16, fontWeight: '700', color: '#888' },
  priceActive:    { color: Colors.primary },
  per:            { fontSize: 11, color: '#666' },

  feats:          { gap: 6 },
  featRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featTxt:        { fontSize: 12, color: '#888', flex: 1, lineHeight: 17 },
  featTxtActive:  { color: '#ddd' },

  legalRow:       { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 },
  legalDot:       { color: '#666', fontSize: 12 },
  link:           { fontSize: 10, color: '#777', textDecorationLine: 'underline' },

  socialProof:    { alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 },
  socialProofTxt: { fontSize: 14, marginBottom: 4 },
  socialProofSub: { fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 17 },
  divider:        { height: 0.5, backgroundColor: '#161616', marginBottom: 14 },
  cta:            { paddingHorizontal: 20, paddingTop: 4, backgroundColor: '#0A0A0A' },
  ctaBtn:         { width: '100%', borderRadius: 13, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaTxt:         { fontSize: 15, fontWeight: '700', color: '#fff' },
});