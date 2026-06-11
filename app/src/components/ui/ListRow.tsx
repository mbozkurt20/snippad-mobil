import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, typography, layout } from '../../theme/theme';
import AppText from './AppText';

interface Props {
  icon?: ReactNode;
  label: string;
  subtitle?: string;
  rightElement?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function ListRow({ icon, label, subtitle, rightElement, onPress, style }: Props) {
  const content = (
    <>
      {icon && <View style={s.iconBox}>{icon}</View>}
      <View style={s.content}>
        <AppText variant="bodyMedium" color="textPrimary">
          {label}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color="textSecondary">
            {subtitle}
          </AppText>
        )}
      </View>
      {rightElement && <View style={s.rightElement}>{rightElement}</View>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={[s.row, style]}>{content}</View>
      </TouchableOpacity>
    );
  }

  return <View style={[s.row, style]}>{content}</View>;
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: layout.gap.md,
  },
  iconBox: {
    width: layout.iconBox,
    height: layout.iconBox,
    borderRadius: layout.radiusSm,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: layout.gap.md,
  },
  content: {
    flex: 1,
  },
  rightElement: {
    marginLeft: layout.gap.md,
  },
});
