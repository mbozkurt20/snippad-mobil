import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  ScrollView, Platform, Linking, Image, NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, ArrowRight, Zap, SwitchCamera, Lock, Cpu, Smartphone, Globe, Info, Shield, Eye } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { KeyboardService } from '../store/storage';

type Props = {
  navigation: any; // Esneklik için korundu
};

function getAndroidBrandSteps(brand: string): { step1: string; step2: string } {
  const b = brand.toLowerCase();
  if (b.includes('samsung'))
    return {
      step1: 'Ayarlar ➔ Genel Yönetim ➔ Klavye Listesi ve Varsayılan ➔ Snippad\'i Aktif Et',
      step2: 'Bir metin alanına dokun ➔ Sağ alttaki Klavye simgesinden Snippad\'i seç',
    };
  if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco'))
    return {
      step1: 'Ayarlar ➔ Ek Ayarlar ➔ Dil ve Giriş ➔ Klavyeleri Yönet ➔ Snippad\'i Aç',
      step2: 'Klavyeyi aç ➔ Bildirim panelini indir ya da Giriş yöntemi değiştiriciye bas ➔ Snippad\'i seç',
    };
  return {
    step1: 'Ayarlar ➔ Sistem ➔ Dil ve Giriş ➔ Ekran Klavyesi ➔ Snippad\'i Etkinleştir',
    step2: 'Yazarken klavye değiştirme ikonuna basarak Snippad\'i seç',
  };
}

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [selectedAppLanguage, setSelectedAppLanguage] = useState<'tr' | 'en' | 'ar'>('tr');
  const setAppLanguage = useAppStore(s => s.setAppLanguage);
  const completeOnboarding = useAppStore(s => s.completeOnboarding);

  const getT = () => {
    if (selectedAppLanguage === 'en') return require('../i18n/en').en;
    if (selectedAppLanguage === 'ar') return require('../i18n/ar').ar;
    return require('../i18n/tr').tr;
  };
  const T = getT();

  const androidBrand: string = Platform.OS === 'android'
    ? (NativeModules?.PlatformConstants?.Brand ?? NativeModules?.RNDeviceInfo?.brand ?? '')
    : '';
  const brandSteps = getAndroidBrandSteps(androidBrand);

  const steps = [
    {
      Icon: Globe,
      title: selectedAppLanguage === 'tr' ? 'Dil ve Kurulum Başlasın' : selectedAppLanguage === 'en' ? 'Choose App Language' : 'اختر لغة التطبيق',
      description: selectedAppLanguage === 'tr' ? 'Snippad dünyasına hoş geldin! Devam etmek istediğin dili seç.' : selectedAppLanguage === 'en' ? 'Welcome to Snippad! Select your preferred language.' : 'مرحبًا بك في Snippad! اختر لغتك المفضلة.',
    },
    {
      Icon: Lock,
      title: selectedAppLanguage === 'tr' ? 'Verileriniz Tamamen Güvende' : selectedAppLanguage === 'en' ? 'Your Data Is Completely Secure' : 'بياناتك محمية تماماً',
      description: selectedAppLanguage === 'tr' ? 'AES-256 şifreleme, cihazda depolama, hiçbir sunucu kaydı. Gizliliğiniz bizim yasal yükümlülüğümüz.' : selectedAppLanguage === 'en' ? 'AES-256 encryption, on-device storage, zero server access. Privacy is our legal commitment.' : 'تشفير AES-256، التخزين على الجهاز، لا وصول للخادم.',
    },
    {
      Icon: Zap,
      title: selectedAppLanguage === 'tr' ? 'Adım 2: Hazırlanan Şablonları Başlat' : selectedAppLanguage === 'en' ? 'Step 2: Start Using Templates' : 'الخطوة 2: ابدأ باستخدام القوالب',
      description: selectedAppLanguage === 'tr' ? 'Hazır kategori kütüphanesinden hukuk, muhasebe, satış şablonlarını keşfet ve hemen kullan.' : selectedAppLanguage === 'en' ? 'Explore ready-made templates for legal, finance, sales and start saving time instantly.' : 'استكشف القوالس الجاهسة للقطاعات المختلفة وابدأ بتوفير الوقت فوراً.',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (step === 0) {
      setAppLanguage(selectedAppLanguage);
    }
    if (!isLast) {
      setStep(p => p + 1);
    } else {
      setAppLanguage(selectedAppLanguage);
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Compact & Premium Header */}
        <View style={styles.logoWrapCompact}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImageSmall} resizeMode="contain" />
          <Text style={styles.appNameSmall}>{T.appName || 'Snippad'}</Text>
          <Text style={styles.taglineSmall}>{T.appTagline || 'Smart Clipboard Keyboard'}</Text>
        </View>

        {/* Intuitive Progress Indicator */}
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
          ))}
        </View>

        {/* HERO CARD: Focused Interaction Area */}
        <View style={[styles.card, styles.cardPremiumShadow]}>
          <View style={styles.iconCircle}>
            <current.Icon size={28} color={Colors.primary} />
          </View>
          <Text style={styles.stepTitle}>{current.title}</Text>
          <Text style={styles.stepDesc}>{current.description}</Text>

          {/* Step 0: Language Selector Inside Card */}
          {step === 0 && (
            <View style={styles.languageButtonsInCard}>
              {(['tr', 'en', 'ar'] as const).map((lang) => {
                const labels = { tr: '🇹🇷 Türkçe', en: '🇬🇧 English', ar: '🇸🇦 العربية' };
                return (
                  <Pressable
                    key={lang}
                    style={[styles.languageBtnCompact, selectedAppLanguage === lang && styles.languageBtnActive]}
                    onPress={() => setSelectedAppLanguage(lang)}
                  >
                    <Text style={[styles.languageBtnTextCompact, selectedAppLanguage === lang && styles.languageBtnTextActive]}>
                      {labels[lang]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Step 1: Conversion-boosting dynamic OS tips */}
          {step === 1 && Platform.OS === 'android' && (
            <View style={styles.brandStepsBox}>
              <View style={styles.brandTitleRow}>
                <Info size={14} color={Colors.primary} />
                <Text style={styles.brandTitle}>{androidBrand.toUpperCase()} İçin Kolay Kurulum Yolu:</Text>
              </View>
              <Text style={styles.brandStepText}><Text style={{fontWeight: '700'}}>1.</Text> {brandSteps.step1}</Text>
              <Text style={styles.brandStepText}><Text style={{fontWeight: '700'}}>2.</Text> {brandSteps.step2}</Text>
            </View>
          )}

          {/* Step 2: Final call-to-action & social proof */}
          {step === 2 && (
            <View style={styles.finalCTABox}>
              <Text style={styles.finalCTATitle}>
                {selectedAppLanguage === 'tr' ? '✨ Hazır mısın?' : selectedAppLanguage === 'en' ? '✨ Ready to get started?' : '✨ هل أنت جاهز؟'}
              </Text>
              <Text style={styles.finalCTADesc}>
                {selectedAppLanguage === 'tr' ? '3 günlük deneme süresi boyunca sınırsız premium özelliklere erişebilirsin. Kredi kartı gerekmez, iptal et istediğinde. 100.000+ kullanıcı zaman kaybetmeyi bıraktı.' : selectedAppLanguage === 'en' ? 'Unlock unlimited premium features for 3 days. No credit card needed. 100K+ users have already saved thousands of hours.' : 'فتح الميزات المتقدمة غير المحدودة لمدة 3 أيام. بدون بطاقة ائتمان.'}
              </Text>
              <View style={styles.socialProofBadges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeEmoji}>⭐</Text>
                  <Text style={styles.badgeText}>{selectedAppLanguage === 'tr' ? '4.8/5' : '4.8/5'}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeEmoji}>📥</Text>
                  <Text style={styles.badgeText}>{selectedAppLanguage === 'tr' ? '100K+' : '100K+'}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeEmoji}>⏱️</Text>
                  <Text style={styles.badgeText}>{selectedAppLanguage === 'tr' ? 'Dakika' : 'Min'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* STEP 0: Value Proposition & Marketing Features */}
        {step === 0 && (
          <View style={styles.features}>
            {/* Conversion Booster: Free Trial Badge */}
            <View style={styles.trialBadgeRow}>
              <Zap size={14} color="#22c55e" />
              <Text style={styles.trialBadgeText}>
                {selectedAppLanguage === 'tr' ? '3 Günlük Ücretsiz Business Deneme Aktif — Kredi Kartı Gerekmez' : '3-Day Free Business Trial Active — No Credit Card Required'}
              </Text>
            </View>

            {[
              { text: T.onboardingFeature1 || 'Anında erişilebilir çoklu kopyalama geçmişi.', Icon: Zap },
              { text: T.onboardingFeature2 || 'Uçtan uca şifreli, güvenli yerel veri saklama.', Icon: Lock },
              { text: T.onboardingFeature3 || 'Yapay zeka destekli akıllı metin tamamlama.', Icon: Cpu },
              { text: selectedAppLanguage === 'tr' ? 'Avukat, muhasebeci, satış, sağlık gibi sektörlere özel hazır şablon tanınlaması.' : selectedAppLanguage === 'en' ? 'Industry-specific ready templates: lawyer, accountant, sales, healthcare & more.' : 'قوالب جاهزة خاصة بالقطاع: محام ومحاسب وموارد بشرية وأكثر.', Icon: Smartphone },
            ].map(({ text, Icon }, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={styles.featureIconBg}>
                  <Icon size={16} color={Colors.primary} />
                </View>
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* STEP 1: Professional Security & Trust - Premium Marketing */}
        {step === 1 && (() => {
          const securityFeatures = selectedAppLanguage === 'tr' ? [
            { text: 'AES-256 şifreleme ile bulut güvenliği sağlanır', Icon: Shield },
            { text: 'Verileriniz hesabınızda güvence altında tutulur', Icon: Eye },
            { text: 'Hesabınız dışında kimse hiçbir veriye erişemez', Icon: Lock },
          ] : selectedAppLanguage === 'en' ? [
            { text: 'Cloud-secured with AES-256 encryption', Icon: Shield },
            { text: 'Your data is protected in your account', Icon: Eye },
            { text: 'Only you can access your information', Icon: Lock },
          ] : [
            { text: 'آمن في السحابة مع تشفير AES-256', Icon: Shield },
            { text: 'بياناتك محمية في حسابك', Icon: Eye },
            { text: 'أنت فقط يمكنك الوصول إلى معلوماتك', Icon: Lock },
          ];
          return (
            <>
              <View style={[styles.trustBannerBox]}>
                <Shield size={20} color={Colors.primary} />
                <Text style={styles.trustBannerText}>
                  {selectedAppLanguage === 'tr' ? 'ISO 27001 ve GDPR uyumlu' : selectedAppLanguage === 'en' ? 'ISO 27001 & GDPR compliant' : 'متوافق مع ISO 27001 و GDPR'}
                </Text>
              </View>

              <View style={styles.features}>
                {securityFeatures.map(({ text, Icon }, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <View style={styles.featureIconBg}>
                      <Icon size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.featureText}>{text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.setupContainer}>
                <Pressable
                  style={({ pressed }) => [styles.setupBtn, styles.setupBtnPrimary, pressed && styles.pressedState]}
                  onPress={() => KeyboardService.openSettings()}
                >
                  <Settings size={18} color={Colors.white} />
                  <Text style={[styles.setupBtnText, { color: Colors.white }]}>{T.step1Action || 'Ayarları Aç'}</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.setupBtn, styles.setupBtnSecondary, pressed && styles.pressedState]}
                  onPress={() => KeyboardService.showPicker()}
                >
                  <SwitchCamera size={18} color={Colors.primary} />
                  <Text style={[styles.setupBtnText, { color: Colors.primary }]}>
                    {Platform.OS === 'ios' ? (T.step2ActionIos || 'Seç') : (T.step2ActionAndroid || 'Değiştir')}
                  </Text>
                </Pressable>
              </View>
            </>
          );
        })()}


        {/* PRIMARY CTA & NAVIGATION AREA */}
        <View style={styles.actionArea}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.pressedState]}
            onPress={handleNext}
          >
            <Text style={styles.ctaText}>{isLast ? (T.letsGo || 'Başlayalım') : (T.continue || 'Devam Et')}</Text>
            {isLast ? <Zap size={16} color="#fff" /> : <ArrowRight size={16} color="#fff" />}
          </Pressable>

          {step === 0 && (
            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.pressedState]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBtnText}>{T.loginOrRegister || 'Zaten bir hesabım var'}</Text>
            </Pressable>
          )}
        </View>

        {/* LEGAL DISCLAIMER */}
        <Text style={styles.disclaimer}>
          {T.termsPrefix || 'Devam ederek, '}
          <Text style={styles.disclaimerLink} onPress={() => Linking.openURL('https://vertexforge.tech/terms')}>
            {T.termsLinkLabel || 'Kullanım Koşulları'}
          </Text>
          {T.termsAnd || ' ve '}
          <Text style={styles.disclaimerLink} onPress={() => Linking.openURL('https://vertexforge.tech/privacy')}>
            {T.privacyLinkLabel || 'Gizlilik Politikası'}
          </Text>
          {T.termsSuffix || '’nı kabul etmiş olursunuz.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  pressedState: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  },
  logoWrapCompact: {
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  logoImageSmall: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  appNameSmall: {
    ...Typography.h2,
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  taglineSmall: {
    ...Typography.body,
    color: Colors.textGray,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: BorderRadius.full, 
    backgroundColor: Colors.border 
  },
  dotActive: { 
    width: 20, 
    backgroundColor: Colors.primary 
  },
  dotDone: { 
    backgroundColor: Colors.primaryLight 
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 0,
  },
  cardPremiumShadow: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stepTitle: {
    ...Typography.h2,
    color: Colors.textDark,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDesc: {
    ...Typography.body,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 13,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  languageButtonsInCard: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  languageBtnCompact: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.elevated,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  languageBtnActive: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  languageBtnTextCompact: {
    ...Typography.body,
    color: Colors.textGray,
    fontWeight: '600',
    fontSize: 12,
  },
  languageBtnTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  brandStepsBox: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  brandStepText: {
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 16,
    marginTop: 4,
  },
  features: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  trialBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 4,
  },
  trialBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.cardLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...Typography.body,
    color: Colors.textDark,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  setupContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  setupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  setupBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  setupBtnSecondary: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  setupBtnText: {
    fontWeight: '600',
    fontSize: 12,
  },
  actionArea: {
    width: '100%',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  cta: {
    width: '100%', 
    backgroundColor: Colors.primary, 
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center', 
    gap: Spacing.xs,
  },
  ctaText: { 
    ...Typography.h3, 
    color: Colors.white, 
    fontSize: 15,
    fontWeight: '600'
  },
  loginBtn: {
    width: '100%', 
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  loginBtnText: { 
    ...Typography.body, 
    color: Colors.textGray, 
    fontWeight: '600',
    fontSize: 13,
    textDecorationLine: 'underline'
  },
  disclaimer: {
    fontSize: 10, 
    color: Colors.textLight, 
    textAlign: 'center',
    lineHeight: 14, 
    marginTop: Spacing.md, 
    paddingHorizontal: Spacing.lg,
  },
  disclaimerLink: {
    color: Colors.primary,
    fontWeight: '500'
  },
  finalCTABox: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  finalCTATitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  finalCTADesc: {
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  socialProofBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  badge: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.cardLavender,
    borderRadius: BorderRadius.md,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  securityFeatures: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  trustBadge: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minWidth: 100,
  },
  trustBadgePrimary: {
    backgroundColor: Colors.cardLavender,
  },
  trustBadgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  trustBannerBox: {
    width: '100%',
    backgroundColor: Colors.cardLavender,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  trustBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
  },
});