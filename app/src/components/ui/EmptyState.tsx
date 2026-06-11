import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, layout } from '../../theme/theme';
import AppText from './AppText';
import GhostButton from './GhostButton';

interface Props {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: Props) {
  return (
    <View style={[s.container, style]}>
      {icon && (
        <View style={s.iconContainer}>
          {icon}
        </View>
      )}
      <AppText variant="h2" color="textPrimary" style={s.title}>
        {title}
      </AppText>
      <AppText variant="body" color="textSecondary" style={s.description}>
        {description}
      </AppText>
      {actionLabel && onAction && (
        <GhostButton label={actionLabel} onPress={onAction} style={s.button} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: layout.gap.xxl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: layout.gap.lg,
  },
  title: {
    marginBottom: layout.gap.sm,
    textAlign: 'center',
  },
  description: {
    marginBottom: layout.gap.lg,
    textAlign: 'center',
  },
  button: {
    marginTop: layout.gap.md,
  },
});
