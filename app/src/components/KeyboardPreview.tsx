import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useCurrentTheme } from '../theme/ThemeProvider';
import { createKeyboardStyles } from '../theme/keyboardStyles';
import { KeyboardTheme } from '../theme/luxuryKeyboardThemes';
import { Spacing } from '../theme';

interface KeyboardPreviewProps {
  themeId?: string;
  size?: 'small' | 'medium' | 'large';
  rows?: number;
}

export default function KeyboardPreview({
  size = 'medium',
  rows = 2,
}: KeyboardPreviewProps) {
  const currentTheme = useCurrentTheme();

  const styles = useMemo(
    () => createKeyboardStyles(currentTheme),
    [currentTheme]
  );

  const sizeConfig = useMemo(
    () => ({
      small: { keySize: 24, keyPadding: 2, fontSize: 10 },
      medium: { keySize: 32, keyPadding: 4, fontSize: 12 },
      large: { keySize: 40, keyPadding: 6, fontSize: 14 },
    }),
    []
  );

  const config = sizeConfig[size];

  const previewRows = useMemo(() => {
    const qwertyRows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ];
    return qwertyRows.slice(0, rows);
  }, [rows]);

  const renderKey = (letter: string, index: number) => {
    const isSpecial = letter === 'space';

    return (
      <View
        key={`${letter}-${index}`}
        style={[
          {
            width: config.keySize,
            height: config.keySize,
            marginHorizontal: config.keyPadding,
            marginVertical: config.keyPadding,
            borderRadius: (currentTheme.keyCornerRadius || 8) * (config.keySize / 32),
            backgroundColor: isSpecial
              ? currentTheme.spaceKeyColor || currentTheme.specialKeyBackgroundColor
              : currentTheme.keyBackgroundColor,
            borderColor: currentTheme.keyBorderColor || 'transparent',
            borderWidth: currentTheme.keyBorderWidth || 0,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: currentTheme.keyShadowColor || '#000000',
            shadowOpacity: (currentTheme.keyShadowOpacity || 0.15) * 0.8,
            shadowRadius: (currentTheme.keyShadowRadius || 2) * 0.7,
            shadowOffset: {
              width: (currentTheme.keyShadowOffset?.width || 0) * 0.7,
              height: (currentTheme.keyShadowOffset?.height || 1) * 0.7,
            },
            elevation: 1.5,
          },
        ]}
      >
        <Text
          style={[
            {
              color: isSpecial
                ? currentTheme.spaceLabelColor || currentTheme.keyTextColor
                : currentTheme.keyTextColor,
              fontSize: config.fontSize,
              fontWeight: currentTheme.keyFontWeight || '500',
              textAlign: 'center',
            },
          ]}
        >
          {letter === 'space' ? '␣' : letter}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        s.container,
        { backgroundColor: currentTheme.backgroundColor },
      ]}
    >
      {previewRows.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={s.row}>
          {/* Indent for offset rows */}
          {rowIdx === 1 && <View style={{ width: config.keySize / 2 }} />}
          {rowIdx === 2 && <View style={{ width: config.keySize }} />}

          {row.map((letter, keyIdx) => renderKey(letter, keyIdx))}

          {/* Special key on right (delete/space/return) */}
          {rowIdx === 0 && (
            <View
              style={[
                {
                  width: config.keySize * 1.3,
                  height: config.keySize,
                  marginHorizontal: config.keyPadding,
                  marginVertical: config.keyPadding,
                  borderRadius: (currentTheme.keyCornerRadius || 8) *
                    (config.keySize / 32),
                  backgroundColor:
                    currentTheme.specialKeyBackgroundColor,
                  borderColor: currentTheme.keyBorderColor || 'transparent',
                  borderWidth: currentTheme.keyBorderWidth || 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: currentTheme.keyShadowColor || '#000000',
                  shadowOpacity:
                    (currentTheme.keyShadowOpacity || 0.15) * 0.8,
                  shadowRadius: (currentTheme.keyShadowRadius || 2) * 0.7,
                  shadowOffset: {
                    width:
                      (currentTheme.keyShadowOffset?.width || 0) * 0.7,
                    height:
                      (currentTheme.keyShadowOffset?.height || 1) * 0.7,
                  },
                  elevation: 1.5,
                },
              ]}
            >
              <Text
                style={{
                  color: currentTheme.specialKeyTextColor,
                  fontSize: config.fontSize * 0.8,
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                ⌫
              </Text>
            </View>
          )}

          {rowIdx === 2 && (
            <View
              style={[
                {
                  flex: 1,
                  height: config.keySize,
                  marginHorizontal: config.keyPadding,
                  marginVertical: config.keyPadding,
                  borderRadius: (currentTheme.keyCornerRadius || 8) *
                    (config.keySize / 32),
                  backgroundColor:
                    currentTheme.spaceKeyColor ||
                    currentTheme.specialKeyBackgroundColor,
                  borderColor: currentTheme.keyBorderColor || 'transparent',
                  borderWidth: currentTheme.keyBorderWidth || 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: currentTheme.keyShadowColor || '#000000',
                  shadowOpacity:
                    (currentTheme.keyShadowOpacity || 0.15) * 0.8,
                  shadowRadius: (currentTheme.keyShadowRadius || 2) * 0.7,
                  shadowOffset: {
                    width:
                      (currentTheme.keyShadowOffset?.width || 0) * 0.7,
                    height:
                      (currentTheme.keyShadowOffset?.height || 1) * 0.7,
                  },
                  elevation: 1.5,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    currentTheme.spaceLabelColor ||
                    currentTheme.keyTextColor,
                  fontSize: config.fontSize * 0.75,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                space
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 2,
  },
});
