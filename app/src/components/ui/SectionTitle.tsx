import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { layout } from '../../theme/theme';
import AppText from './AppText';

interface Props {
  label: string;
  style?: ViewStyle;
}

export default function SectionTitle({ label, style }: Props) {
  return (
    <View style={[s.container, style]}>
      <AppText
        variant="caption"
        color="textSecondary"
        weight="600"
        style={s.text}
      >
        {label.toUpperCase()}
      </AppText>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: layout.gap.xxl,
    marginBottom: layout.gap.sm,
  },
  text: {
    letterSpacing: 1,
  },
});
