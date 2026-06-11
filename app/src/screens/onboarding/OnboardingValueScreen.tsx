import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Zap, MonitorSmartphone, Lock } from 'lucide-react-native';
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
      balanced
      footer={
        <View>
          <PrimaryButton label="Devam et" onPress={onNext} />
          <TouchableOpacity onPress={onLogin} style={s.loginLink} hitSlop={{ top: 8, bottom: 8 }}>
            <Text style={s.linkText}>
              Hesabın var mı? <Text style={s.linkBold}>Giriş yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      {/* Logo — sola yaslı, koddan çizili (asset bağımlılığı yok) */}
      <View style={s.logoBox}>
        <Text style={s.logoS}>S</Text>
      </View>

      <Text style={s.h1}>Bir daha yazma.{'\n'}Tek tuşla yapıştır.</Text>

      <Text style={s.subtitle}>
        IBAN, adres ve şablonların her klavyede bir dokunuş uzağında.
      </Text>

      <View style={s.features}>
        <ListRow icon={Zap} text="8 şablon tipi, anında erişim" />
        <View style={s.divider} />
        <ListRow icon={MonitorSmartphone} text="Web ve mobilde senkron" />
        <View style={s.divider} />
        <ListRow icon={Lock} text="Verilerin cihazında, şifreli" />
      </View>

      <HeroCard
        title="3 gün Business ücretsiz."
        subtitle="Kart gerekmez. Bitmeden hatırlatırız."
      />
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  logoS: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  h1: { ...typography.h1, marginBottom: 8 },
  subtitle: { ...typography.subtitle, marginBottom: 16 },
  features: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
  },
  loginLink: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 13,
    color: colors.textHint,
    fontWeight: '400' as const,
  },
  linkBold: {
    color: colors.ink,
    fontWeight: '600' as const,
  },
});
