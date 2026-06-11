import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, layout } from '../../theme/theme';
import AppText from './AppText';

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  editable?: boolean;
  style?: ViewStyle;
}

export default function AppInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={style}>
      {label && (
        <AppText variant="caption" color="textSecondary" style={s.label}>
          {label}
        </AppText>
      )}
      <TextInput
        style={[
          s.input,
          focused ? s.focused : {},
          error ? s.inputError : {},
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textHint}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
      />
      {error && (
        <AppText variant="hint" color="danger" style={s.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  label: {
    marginBottom: layout.gap.xs,
  },
  input: {
    height: layout.inputHeight,
    borderRadius: layout.radiusMd,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: layout.gap.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  focused: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: layout.gap.xs,
  },
});
