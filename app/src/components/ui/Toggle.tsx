import React from 'react';
import { Switch, ViewStyle, SwitchChangeEvent } from 'react-native';
import { colors } from '../../theme/theme';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Toggle({ value, onValueChange, disabled = false, style }: Props) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.surface}
      style={style}
    />
  );
}
