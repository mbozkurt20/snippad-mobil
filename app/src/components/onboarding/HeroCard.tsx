import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gift } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, spacing, radius } from '../../theme/designTokens';

interface Props {
  title: string;      // kalın beyaz kısım
  subtitle?: string;  // gri devam kısmı (aynı satırda akar)
  icon?: LucideIcon;  // verilmezse Gift
  accent?: React.ReactNode; // geriye uyumluluk — artık kullanılmıyor
}

export default function HeroCard({ title, subtitle, icon }: Props) {
  const Icon = icon ?? Gift;
  return (
    <View style={s.card}>
      <Icon size={18} color={colors.primary} strokeWidth={2.2} style={s.icon} />
      <Text style={s.textBlock}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}> {subtitle}</Text> : null}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  icon: {
    marginRight: 10,
  },
  textBlock: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: colors.surface,
    fontWeight: '600' as const,
  },
  subtitle: {
    color: '#999999',
    fontWeight: '400' as const,
  },
});
