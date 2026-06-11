import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import ProgressBar from './ProgressBar';
import { colors, spacing } from '../../theme/designTokens';

interface Props {
  current: number; // 0-indexed
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
  showBack?: boolean; // Ekran 0'da geri yok
}

export default function OnboardingHeader({ current, total, onBack, onSkip, showBack = true }: Props) {
  return (
    <View style={s.header}>
      <View style={s.topRow}>
        {showBack && onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <View style={{ flex: 1 }} />

        {onSkip && (
          <TouchableOpacity onPress={onSkip} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Text style={s.skipText}>Atla</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.progressContainer}>
        <ProgressBar current={current} total={total} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.horizontalPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  progressContainer: {
    alignItems: 'flex-start',
  },
});
