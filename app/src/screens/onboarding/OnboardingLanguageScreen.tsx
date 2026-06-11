import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLocales } from 'expo-localization';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import SelectionCard from '../../components/onboarding/SelectionCard';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import { colors, typography, spacing } from '../../theme/designTokens';

interface Props {
  onNext: (lang: 'tr' | 'en' | 'ar') => void;
  onSkip: () => void;
}

const languages = [
  { id: 'tr', label: 'Türkçe', native: 'Türkçe' },
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ar', label: 'العربية', native: 'العربية' },
];

export default function OnboardingLanguageScreen({ onNext, onSkip }: Props) {
  const [selected, setSelected] = useState<'tr' | 'en' | 'ar'>('tr');

  useEffect(() => {
    const deviceLang = getLocales()[0].languageCode;
    if (deviceLang === 'en') setSelected('en');
    else if (deviceLang === 'ar') setSelected('ar');
    else setSelected('tr');
  }, []);

  return (
    <OnboardingLayout
      current={0}
      total={5}
      showBack={false}
      onSkip={onSkip}
      footer={
        <PrimaryButton
          label="Devam et"
          onPress={() => onNext(selected)}
        />
      }
    >
      <Text style={s.h1}>Dilini seç</Text>

      <View style={s.cardGroup}>
        {languages.map(lang => (
          <SelectionCard
            key={lang.id}
            title={lang.label}
            selected={selected === lang.id}
            onPress={() => setSelected(lang.id as 'tr' | 'en' | 'ar')}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  h1: { ...typography.h1, marginBottom: spacing.lg },
  cardGroup: { marginBottom: spacing.xl },
});
