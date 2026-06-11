import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, typography, layout } from '../../theme/theme';
import AppText from './AppText';

interface Props {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export default function SelectionCard({ title, subtitle, selected, onPress, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        s.card,
        selected ? s.selected : {},
        style,
      ]}
    >
      <View style={s.content}>
        <AppText variant="bodyMedium" color="textPrimary">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color="textSecondary">
            {subtitle}
          </AppText>
        )}
      </View>
      {selected && (
        <Check size={20} color={colors.primary} strokeWidth={2.5} />
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: layout.radiusMd,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: layout.gap.md,
    paddingVertical: 16,
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginBottom: layout.gap.md,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFF7F2',
  },
  content: {
    flex: 1,
  },
});
