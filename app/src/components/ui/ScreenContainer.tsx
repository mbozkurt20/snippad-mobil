import React, { ReactNode } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, layout } from '../../theme/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  style?: ViewStyle;
}

export default function ScreenContainer({ children, scroll = false, footer, style }: Props) {
  const content = (
    <View style={[s.inner, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={s.scrollContent}>{children}</View>
      )}
      {footer && <View style={s.footer}>{footer}</View>}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.root}>
      <SafeAreaView style={s.root}>{content}</SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1 },
  scrollContent: { paddingHorizontal: layout.screenPadding, paddingBottom: layout.gap.xl },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: layout.gap.md,
    paddingBottom: layout.gap.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
