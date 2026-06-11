import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme/designTokens';

interface Props {
  text: string;
}

export default function ListRow({ text }: Props) {
  return (
    <View>
      <View style={s.row}>
        <View style={s.iconBox}>
          <Check size={18} color={colors.primary} strokeWidth={2.5} />
        </View>
        <Text style={s.text}>{text}</Text>
      </View>
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
