import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, layout } from '../../theme/theme';
import AppText from './AppText';

interface Props {
  label: string;
  variant?: 'primary' | 'ink';
  style?: ViewStyle;
}

export default function Badge({ label, variant = 'primary', style }: Props) {
  const badgeStyle = variant === 'ink' ? s.inkBadge : s.primaryBadge;
  const textColor = variant === 'ink' ? 'white' : 'primaryDark';

  return (
    <View style={[s.badge, badgeStyle, style]}>
      <AppText
        variant="caption"
        color={textColor as any}
        weight="600"
      >
        {label}
      </AppText>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: layout.radiusPill,
  },
  primaryBadge: {
    backgroundColor: colors.primarySoft,
  },
  inkBadge: {
    backgroundColor: colors.ink,
  },
});
