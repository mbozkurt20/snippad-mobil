import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import ListRow from '../../components/onboarding/ListRow';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import { colors, typography, spacing } from '../../theme/designTokens';

interface Props {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function OnboardingTrustScreen({ onNext, onBack, onSkip }: Props) {
  return (
    <OnboardingLayout
      current={2}
      total={5}
      onBack={onBack}
      onSkip={onSkip}
      footer={
        <PrimaryButton
          label="Devam et"
          onPress={onNext}
        />
      }
    >
      <Text style={s.h1}>Verilerin sende kalır</Text>

      <Text style={s.subtitle}>
        Hiçbir sunucuya yüklenmez, tamamen cihazında şifreli şekilde saklanır.
      </Text>

      {/* Güvenlik özellikleri */}
      <View style={s.features}>
        <ListRow text="AES-256 şifreleme" />
        <View style={s.divider} />
        <ListRow text="Cihazda depolama, buluta değil" />
        <View style={s.divider} />
        <ListRow text="Kimse erişemez, sadece sen" />
      </View>

      {/* Yasal metin — kart değil, düz metin */}
      <Text style={s.legalText}>
        ISO 27001 & GDPR uyumlu. Gizlilik politikamızı oku.
      </Text>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  h1: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.subtitle, marginBottom: spacing.lg },

  features: {
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
  },

  legalText: {
    fontSize: 12,
    color: colors.textHint,
    lineHeight: 1.5,
    fontWeight: '400' as const,
  },
});
