import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors, typography, layout } from '../../theme/theme';
import AppText from './AppText';

interface Props {
  title?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  style?: ViewStyle;
}

export default function ScreenHeader({ title, onBack, rightAction, style }: Props) {
  return (
    <View style={[s.header, style]}>
      <TouchableOpacity
        onPress={onBack}
        disabled={!onBack}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        style={s.backButton}
      >
        <ChevronLeft size={24} color={onBack ? colors.ink : 'transparent'} strokeWidth={2} />
      </TouchableOpacity>

      {title && (
        <AppText variant="h2" color="textPrimary" style={s.title}>
          {title}
        </AppText>
      )}

      {rightAction && (
        <View style={s.rightAction}>{rightAction}</View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginLeft: layout.gap.md,
  },
  rightAction: {
    marginLeft: layout.gap.md,
  },
});
