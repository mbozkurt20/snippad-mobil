import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  variant?: 'default' | 'deleted' | 'warning';
}

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  variant = 'default',
}: ScreenHeaderProps) {
  const variantStyles = {
    default: {
      borderColor: Colors.primary + '25',
      btnBgColor: Colors.primaryLight,
    },
    deleted: {
      borderColor: Colors.danger + '20',
      btnBgColor: Colors.dangerBg,
    },
    warning: {
      borderColor: Colors.warning + '25',
      btnBgColor: Colors.warning + '15',
    },
  };

  const theme = variantStyles[variant];
  const subtitleColor = variant === 'deleted' ? Colors.danger : variant === 'warning' ? Colors.warning : Colors.textDark;

  return (
    <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
      <TouchableOpacity
        style={[styles.backBtn, variant === 'default' && { backgroundColor: Colors.primary }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={variant === 'default' ? Colors.white : Colors.textDark} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && (
          <Text style={[styles.headerSubtitle, { color: subtitleColor }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0,
    ...Shadows.card,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.primary,
    ...Shadows.button,
  },
  headerContent: { flex: 1 },
  headerTitle: { ...Typography.h3, color: Colors.textDark, fontWeight: '800' },
  headerSubtitle: { ...Typography.label, marginTop: 3 },
});
