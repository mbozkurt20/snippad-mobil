import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { useKeyboardTheme, useSetTheme } from '../theme/ThemeProvider';
import { luxuryKeyboardThemes, KeyboardTheme } from '../theme/luxuryKeyboardThemes';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

type FilterCategory = 'all' | 'dark' | 'light';

export default function KeyboardThemeSelector() {
  const { currentTheme, themeId } = useKeyboardTheme();
  const setTheme = useSetTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  const filteredThemes = useMemo(() => {
    const themes = Object.values(luxuryKeyboardThemes);
    if (selectedFilter === 'all') return themes;
    return themes.filter(t => t.category === selectedFilter);
  }, [selectedFilter]);

  const renderThemeCard = ({ item: theme }: { item: KeyboardTheme }) => {
    const isSelected = theme.id === themeId;

    return (
      <TouchableOpacity
        style={[
          s.themeCard,
          { backgroundColor: theme.backgroundColor },
          isSelected && s.themeCardSelected,
        ]}
        onPress={() => setTheme(theme.id)}
        activeOpacity={0.8}
      >
        {/* Theme Preview */}
        <View style={s.preview}>
          <View style={s.previewRow}>
            {['a', 'b', 'c'].map((letter, idx) => (
              <View
                key={idx}
                style={[
                  s.previewKey,
                  { backgroundColor: theme.keyBackgroundColor },
                ]}
              >
                <Text
                  style={[
                    s.previewKeyText,
                    {
                      color: theme.keyTextColor,
                      fontSize: 10,
                      fontWeight: theme.keyFontWeight || '500',
                    },
                  ]}
                >
                  {letter}
                </Text>
              </View>
            ))}
          </View>

          {/* Space Key Preview */}
          <View
            style={[
              s.spacePreview,
              { backgroundColor: theme.spaceKeyColor || theme.specialKeyBackgroundColor },
            ]}
          >
            <Text
              style={[
                s.spacePreviewText,
                {
                  color: theme.spaceLabelColor || theme.keyTextColor,
                  fontSize: 8,
                  fontWeight: '600',
                },
              ]}
            >
              space
            </Text>
          </View>
        </View>

        {/* Theme Info */}
        <Text style={[s.themeName, { color: theme.keyTextColor }]}>
          {theme.name}
        </Text>
        <Text style={[s.themeDescription, { color: theme.keyTextColor, opacity: 0.7 }]}>
          {theme.inspiration}
        </Text>

        {/* Selected Indicator */}
        {isSelected && (
          <View style={s.selectedBadge}>
            <Text style={s.selectedBadgeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      {/* Filter Tabs */}
      <View style={s.filterRow}>
        {(['all', 'dark', 'light'] as const).map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              s.filterBtn,
              selectedFilter === filter && s.filterBtnActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                s.filterBtnText,
                selectedFilter === filter && s.filterBtnTextActive,
              ]}
            >
              {filter === 'all' ? 'Tümü' : filter === 'dark' ? 'Koyu' : 'Açık'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Theme Grid */}
      <FlatList
        data={filteredThemes}
        renderItem={renderThemeCard}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={true}
        contentContainerStyle={s.gridContent}
        columnWrapperStyle={s.gridColumn}
        showsVerticalScrollIndicator={false}
      />

      {/* Current Theme Details */}
      <View style={[s.detailsBox, { backgroundColor: currentTheme.backgroundColor }]}>
        <Text style={[s.detailsTitle, { color: currentTheme.keyTextColor }]}>
          {currentTheme.name}
        </Text>
        <Text style={[s.detailsDesc, { color: currentTheme.keyTextColor, opacity: 0.8 }]}>
          {currentTheme.description}
        </Text>
        <Text style={[s.detailsInsp, { color: currentTheme.keyTextColor, opacity: 0.6 }]}>
          {currentTheme.inspiration}
        </Text>
      </View>
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - Spacing.lg * 2 - Spacing.md) / 2;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },

  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
  } as any,

  filterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  } as any,

  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  } as any,

  filterBtnText: {
    ...Typography.label,
    color: Colors.textGray,
    fontWeight: '600',
  } as any,

  filterBtnTextActive: {
    color: Colors.white,
  } as any,

  gridContent: {
    paddingBottom: Spacing.xl,
  } as any,

  gridColumn: {
    gap: Spacing.md,
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  } as any,

  themeCard: {
    width: cardWidth,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'space-between',
  } as any,

  themeCardSelected: {
    borderColor: Colors.primary,
    elevation: 5,
    shadowOpacity: 0.25,
  } as any,

  preview: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  } as any,

  previewRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
  } as any,

  previewKey: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  } as any,

  previewKeyText: {
    textAlign: 'center',
  } as any,

  spacePreview: {
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  } as any,

  spacePreviewText: {
    textAlign: 'center',
  } as any,

  themeName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
    fontWeight: '700',
  } as any,

  themeDescription: {
    ...Typography.label,
    marginBottom: Spacing.xs,
    fontSize: 11,
  } as any,

  selectedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,

  selectedBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  } as any,

  detailsBox: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: -Spacing.lg,
    marginBottom: -Spacing.lg,
    elevation: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  } as any,

  detailsTitle: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  } as any,

  detailsDesc: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  } as any,

  detailsInsp: {
    ...Typography.label,
    fontSize: 13,
    fontStyle: 'italic',
  } as any,
});
