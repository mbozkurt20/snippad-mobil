import React, { useState } from 'react';
import { View } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import OnboardingLanguageScreen from './onboarding/OnboardingLanguageScreen';
import OnboardingValueScreen from './onboarding/OnboardingValueScreen';
import OnboardingTrustScreen from './onboarding/OnboardingTrustScreen';
import OnboardingKeyboardScreen from './onboarding/OnboardingKeyboardScreen';
import OnboardingReadyScreen from './onboarding/OnboardingReadyScreen';
import { mmkvStorage } from '../store/storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: NavigationProp;
}

type Language = 'tr' | 'en' | 'ar';

export default function OnboardingFlowScreen({ navigation }: Props) {
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('tr');
  const { completeOnboarding } = useAppStore();

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    mmkvStorage.setAppLanguage?.(lang);
    setCurrentScreen(1);
  };

  const handleSkip = () => {
    completeOnboarding();
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 150);
  };

  const handleNext = () => {
    if (currentScreen < 4) {
      setCurrentScreen(currentScreen + 1);
    } else {
      completeOnboarding();
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 150);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params: { mode: 'login' } }],
    });
  };

  const handleOpenSettings = () => {
    // Platform-specific keyboard settings opener
    // For now, just proceed to next screen
    handleNext();
  };

  return (
    <View style={{ flex: 1 }}>
      {currentScreen === 0 && (
        <OnboardingLanguageScreen
          onNext={handleLanguageSelect}
          onSkip={handleSkip}
        />
      )}

      {currentScreen === 1 && (
        <OnboardingValueScreen
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          onLogin={handleLogin}
        />
      )}

      {currentScreen === 2 && (
        <OnboardingTrustScreen
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
        />
      )}

      {currentScreen === 3 && (
        <OnboardingKeyboardScreen
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {currentScreen === 4 && (
        <OnboardingReadyScreen
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
    </View>
  );
}
