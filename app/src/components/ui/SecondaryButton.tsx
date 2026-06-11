import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { colors, typography, layout } from '../../theme/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function SecondaryButton({ label, onPress, disabled = false, loading = false, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        s.button,
        disabled || loading ? s.disabled : {},
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={s.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  button: {
    height: layout.buttonHeight,
    borderRadius: layout.radiusPill,
    backgroundColor: colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: colors.surfaceAlt,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
});
