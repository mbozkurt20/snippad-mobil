import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import OnboardingHeader from './OnboardingHeader';
import { colors, spacing, insets } from '../../theme/designTokens';

interface Props {
  children?: ReactNode;
  footer?: ReactNode;
  current: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
  showBack?: boolean;
  centered?: boolean; // içeriği dikeyde ortala (son ekran)
}

export default function OnboardingLayout({
  children,
  footer,
  current,
  total,
  onBack,
  onSkip,
  showBack = true,
  centered = false,
}: Props) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <SafeAreaView style={s.root}>
        <OnboardingHeader
          current={current}
          total={total}
          onBack={onBack}
          onSkip={onSkip}
          showBack={showBack}
        />

        <ScrollView
          contentContainerStyle={[s.scrollContent, centered && s.centered]}
          showsVerticalScrollIndicator={false}
          style={s.scrollView}
        >
          {children}
        </ScrollView>

        {footer && <View style={s.footer}>{footer}</View>}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.horizontalPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.horizontalPadding,
    paddingTop: spacing.md,
    paddingBottom: insets.safeAreaBottom + 16,
    backgroundColor: colors.surface,
  },
});
