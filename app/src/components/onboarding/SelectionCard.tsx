import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, typography, spacing, radius, animation } from '../../theme/designTokens';

interface Props {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  iconSize?: number;
}

export default function SelectionCard({ title, subtitle, selected, onPress, iconSize = 20 }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        s.card,
        selected && s.cardSelected,
      ]}
    >
      <View style={s.content}>
        <Text style={[s.title, { marginBottom: subtitle ? 4 : 0 }]}>{title}</Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      {selected && (
        <Check
          size={iconSize}
          color={colors.primary}
          strokeWidth={2.5}
          style={s.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFF7F2', // Soft orange
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.buttonText,
    color: colors.ink,
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 12,
  },
  checkIcon: {
    marginLeft: spacing.md,
  },
});
