import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/designTokens';

interface Props {
  current: number; // 0-indexed
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  return (
    <View style={s.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            s.bar,
            i === current ? s.barActive : s.barInactive,
          ]}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  bar: {
    height: 4,
    borderRadius: 2,
  },
  barActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  barInactive: {
    width: 8,
    backgroundColor: colors.border,
  },
});
