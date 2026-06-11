import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, radius, animation } from '../../theme/designTokens';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function PrimaryButton({ label, onPress, disabled = false, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.97}
      style={[
        s.button,
        disabled && s.disabled,
        style,
      ]}
    >
      <Text style={[s.text, disabled && s.disabledText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: colors.surfaceAlt,
  },
  text: {
    ...typography.buttonText,
    color: colors.surface,
  },
  disabledText: {
    color: colors.textHint,
  },
});
