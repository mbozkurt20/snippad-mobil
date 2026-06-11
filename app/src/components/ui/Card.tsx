import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, layout } from '../../theme/theme';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'hero';
  style?: ViewStyle;
}

export default function Card({ children, variant = 'default', style }: Props) {
  const cardStyle = variant === 'hero' ? s.heroCard : s.defaultCard;
  return (
    <View style={[s.card, cardStyle, style]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    padding: 16,
  },
  defaultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radiusLg,
  },
  heroCard: {
    backgroundColor: colors.ink,
    borderRadius: layout.radiusMd,
  },
});
