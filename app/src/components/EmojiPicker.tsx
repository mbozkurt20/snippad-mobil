import React, { useState, useMemo, useCallback } from 'react';
import {
  View, FlatList, TouchableOpacity, Text, TextInput, StyleSheet, Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

const EMOJI_CATEGORIES = {
  recent: ['😀', '😂', '❤️', '👍', '🎉', '🔥', '👀', '✨'],
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩'],
  people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎'],
  nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
  food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '🥍'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖'],
};

type Category = keyof typeof EMOJI_CATEGORIES;

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
}

export default function EmojiPicker({ onSelectEmoji, onClose }: EmojiPickerProps) {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<Category>('recent');

  const filteredEmojis = useMemo(() => {
    if (!searchText || searchText.length < 1) {
      return EMOJI_CATEGORIES[activeTab] || [];
    }
    // Search across all emojis
    return Object.values(EMOJI_CATEGORIES)
      .flat()
      .filter((emoji, idx, arr) => arr.indexOf(emoji) === idx); // Remove duplicates
  }, [searchText, activeTab]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    onSelectEmoji(emoji);
    setSearchText('');
  }, [onSelectEmoji]);

  const tabLabels: Record<Category, string> = {
    recent: '🕐',
    smileys: '😀',
    people: '👋',
    nature: '🐶',
    food: '🍎',
    activities: '⚽',
    travel: '🚗',
    symbols: '❤️',
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TextInput
          style={s.searchInput}
          placeholder="Emoji ara..."
          placeholderTextColor={Colors.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {onClose && (
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <X size={20} color={Colors.textDark} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {(Object.keys(EMOJI_CATEGORIES) as Category[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              setSearchText('');
            }}
            style={[s.tab, activeTab === tab && s.tabActive]}
          >
            <Text style={s.tabLabel}>{tabLabels[tab]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Emojis Grid */}
      {filteredEmojis.length > 0 ? (
        <FlatList
          data={filteredEmojis}
          keyExtractor={(_, idx) => `${idx}`}
          numColumns={6}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.gridContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleEmojiSelect(item)}
              style={s.emojiCell}
              activeOpacity={0.7}
            >
              <Text style={s.emoji}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={s.empty}>
          <Text style={s.emptyText}>Emoji bulunamadı</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.textDark,
  },
  closeBtn: {
    padding: 8,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 18,
  },
  gridContent: {
    padding: Spacing.sm,
  },
  emojiCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    margin: 4,
  },
  emoji: {
    fontSize: 32,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
