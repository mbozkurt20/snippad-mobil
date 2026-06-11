import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme/designTokens';

interface Props {
  title: string;
  subtitle?: string;
  accent?: React.ReactNode; // Turuncu vurgulu eleman
}

export default function HeroCard({ title, subtitle, accent }: Props) {
  return (
    <View style={s.card}>
      <Text style={[s.title, { marginBottom: accent || subtitle ? 8 : 0 }]}>{title}</Text>
      {accent && <View style={[s.accentContainer, { marginBottom: subtitle ? 8 : 0 }]}>{accent}</View>}
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    backgroundColor: colors.ink,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
    lineHeight: 1.4,
  },
  accentContainer: {
  },
  subtitle: {
    fontSize: 14,
    color: '#999999', // İkincil metin siyah kartta
    lineHeight: 1.4,
  },
});
