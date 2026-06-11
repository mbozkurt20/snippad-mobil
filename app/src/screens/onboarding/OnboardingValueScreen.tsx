import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import ListRow from '../../components/onboarding/ListRow';
import HeroCard from '../../components/onboarding/HeroCard';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import { colors, typography, spacing } from '../../theme/designTokens';

interface Props {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onLogin: () => void;
}

export default function OnboardingValueScreen({ onNext, onBack, onSkip, onLogin }: Props) {
  return (
    <OnboardingLayout
      current={1}
      total={5}
      onBack={onBack}
      onSkip={onSkip}
      footer={
        <View>
          <PrimaryButton
            label="Devam et"
            onPress={onNext}
          />
          <TouchableOpacity onPress={onLogin} style={s.loginLink}>
            <Text style={s.linkText}>Hesabın var mı? Giriş yap</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {/* Logo */}
      <View style={s.logoContainer}>
        <Image
          source={require('../../../assets/logo.png')}
          style={s.logo}
          resizeMode="contain"
        />
      </View>

      {/* Başlık */}
      <Text style={s.h1}>Bir daha yazma. Tek tuşla yapıştır.</Text>

      {/* Alt başlık */}
      <Text style={s.subtitle}>
        Hemen yanıt vermek için hazır şablonlarla konuşmayı hızlandır.
      </Text>

      {/* Özellikler */}
      <View style={s.features}>
        <ListRow text="8 şablon tipi, anında erişim" />
        <View style={s.divider} />
        <ListRow text="Web ve mobilde senkron" />
        <View style={s.divider} />
        <ListRow text="Verilerin cihazında, şifreli" />
      </View>

      {/* Hero Card */}
      <HeroCard
        title="3 gün Business ücretsiz"
        subtitle="Kart gerekmez. Deneme bitmeden hatırlatırız."
        accent={<Text style={s.accentText}>Sınırsız şablon · Tüm özellikleri dene</Text>}
      />
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 15,
  },

  h1: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.subtitle, marginBottom: spacing.lg },

  features: {
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
  },

  accentText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    lineHeight: 1.4,
  },

  loginLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
});
