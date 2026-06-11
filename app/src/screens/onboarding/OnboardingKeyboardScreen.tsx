import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import { colors, typography, spacing } from '../../theme/designTokens';

interface Props {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onOpenSettings: () => void;
}

export default function OnboardingKeyboardScreen({ onNext, onBack, onSkip, onOpenSettings }: Props) {
  return (
    <OnboardingLayout
      current={3}
      total={5}
      onBack={onBack}
      onSkip={onSkip}
      balanced
      footer={
        <View>
          <PrimaryButton
            label="Ayarları aç"
            onPress={onOpenSettings}
          />
          <TouchableOpacity onPress={onNext} style={s.skipLink}>
            <Text style={s.skipLinkText}>Daha sonra yaparım</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <Text style={s.h1}>Klavyeni etkinleştir</Text>

      {/* Adımlar */}
      <View style={s.steps}>
        <StepItem number={1} text="Ayarlar › Klavye › Yeni Klavye Ekle" />
        <StepItem number={2} text="Snippad'ı seç" />
        <StepItem number={3} text="Tam Erişim'i aç" />
      </View>

      <Text style={s.hint}>
        Tam erişim, şablonlarını güvenli şekilde almamız için gerekir. Hiçbir veri okumuyoruz.
      </Text>
    </OnboardingLayout>
  );
}

interface StepProps {
  number: number;
  text: string;
}

function StepItem({ number, text }: StepProps) {
  return (
    <View style={s.step}>
      <View style={s.stepNumber}>
        <Text style={s.stepNumberText}>{number}</Text>
      </View>
      <Text style={s.stepText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  h1: { ...typography.h1, marginBottom: spacing.lg },

  steps: {
    marginBottom: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.ink,
    lineHeight: 21,
    paddingTop: 8,
  },

  hint: {
    fontSize: 12,
    color: colors.textHint,
    lineHeight: 18,
  },

  skipLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  skipLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
});
