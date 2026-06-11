import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import { colors, typography, spacing } from '../../theme/designTokens';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingReadyScreen({ onNext, onBack }: Props) {
  return (
    <OnboardingLayout
      current={4}
      total={5}
      onBack={onBack}
      showBack={true}
      centered
      footer={<PrimaryButton label="Başlayalım" onPress={onNext} />}
    >
      <View style={s.centeredContent}>
        <View style={s.checkCircle}>
          <Check size={36} color={colors.primary} strokeWidth={2.5} />
        </View>

        <Text style={s.h1}>Her şey hazır</Text>

        <Text style={s.socialProof}>100.000+ kullanıcı · 4.8 ★</Text>
      </View>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  centeredContent: {
    alignItems: 'center',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  h1: { ...typography.h1, marginBottom: spacing.xs, textAlign: 'center' },
  socialProof: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
