import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, X, type LucideIcon } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../theme';

interface StandardHeaderProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  rightIcon?: LucideIcon;
  onRightPress?: () => void;
  rightLabel?: string;
  subtitle?: string;
  variant?: 'default' | 'modal';
}

export default function StandardHeader({
  title,
  onBack,
  onClose,
  rightIcon: RightIcon,
  onRightPress,
  rightLabel,
  subtitle,
  variant = 'default',
}: StandardHeaderProps) {
  const isModal = variant === 'modal';

  return (
    <View style={[styles.header, isModal && styles.headerModal]}>
      {/* Left - Back/Close Button */}
      <TouchableOpacity
        style={styles.leftBtn}
        onPress={onBack || onClose}
        activeOpacity={0.7}
      >
        {onClose && isModal ? (
          <X size={24} color={Colors.textDark} />
        ) : (
          <ChevronLeft size={24} color={Colors.textDark} />
        )}
      </TouchableOpacity>

      {/* Center - Title & Subtitle */}
      <View style={styles.centerContent}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right - Action Button or Icon */}
      {RightIcon && onRightPress ? (
        <TouchableOpacity
          style={styles.rightBtn}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <RightIcon size={20} color={Colors.primary} />
          {rightLabel && (
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerModal: {
    // Modal variant - slightly elevated
    shadowColor: Colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  leftBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginRight: Spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
  },
  rightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  rightPlaceholder: {
    width: 40,
    height: 40,
  },
});
