import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { colors, typography, ColorKey, TypographyKey } from '../../theme/theme';

interface Props extends TextProps {
  variant?: TypographyKey;
  color?: ColorKey;
  weight?: '400' | '500' | '600' | '700';
  children: React.ReactNode;
}

export default function AppText({
  variant = 'body',
  color = 'textPrimary',
  weight,
  style,
  children,
  ...props
}: Props) {
  const typographyStyle = typography[variant];
  const colorStyle = { color: colors[color] };
  const weightStyle = weight ? { fontWeight: weight as const } : {};

  return (
    <Text
      {...props}
      style={[
        typographyStyle,
        colorStyle,
        weightStyle,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
