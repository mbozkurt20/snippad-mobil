import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme/designTokens';

interface Props {
  text: string;
  icon?: LucideIcon; // verilmezse Check
}

export default function ListRow({ text, icon }: Props) {
  const Icon = icon ?? Check;
  return (
    <View style={s.row}>
      <View style={s.iconBox}>
        <Icon size={18} color={colors.primary} strokeWidth={2.2} />
      </View>
      <Text style={s.text}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.smallIcon,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  text: {
    ...typography.listRow,
    flex: 1,
  },
});
