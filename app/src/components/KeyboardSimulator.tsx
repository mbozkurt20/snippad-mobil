import React, { useState } from 'react';
import {
  View, Text, Pressable, Modal, StyleSheet,
  Dimensions, Animated,
} from 'react-native';
import { Keyboard as KeyboardIcon, X } from 'lucide-react-native';
import { Colors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';
import { KeyboardPreview } from '../screens/KeyboardPreviewScreen';
import { THEMES, themeByKey } from '../constants/themes';

const { width: SW } = Dimensions.get('window');

const FONT_SIZE_MAP: Record<string, number> = {
  small: 13, normal: 15, large: 18, xlarge: 22,
};

export default function KeyboardSimulator() {
  const T = useT();
  const [visible, setVisible] = useState(false);
  const { categories, getPlanLimits, keyboardLayout, keyboardLanguage, keyboardTheme, keyboardFontSize, keyboardFontFamily, vowelHighlight, isTrialExpired, userSettings } = useAppStore();
  const planLimits = getPlanLimits();
  const trialExpired = !userSettings.is_premium && isTrialExpired();

  const resolvedTheme = themeByKey(keyboardTheme);
  const fontSize = FONT_SIZE_MAP[keyboardFontSize] ?? 15;

  return (
    <>
      {/* Floating button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        onPress={() => setVisible(true)}
       >
        <KeyboardIcon size={20} color="#fff" />
      </Pressable>

      {/* Simulator modal — slides up from bottom */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          {/* Backdrop tap = close */}
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

          <View style={styles.sheet}>
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>⌨️  {T.kbPreviewLabel}</Text>
              <Pressable
                onPress={() => setVisible(false)}
               
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <X size={20} color={Colors.textGray} />
              </Pressable>
            </View>

            {/* Keyboard */}
            <View style={styles.kbWrap}>
              <KeyboardPreview
                theme={resolvedTheme}
                fontSize={fontSize}
                fontFamily={keyboardFontFamily}
                categories={categories}
                isBusiness={planLimits.signatureText}
                isPro={planLimits.searchBar}
                language={keyboardLanguage}
                layout={keyboardLayout}
                vowelHighlight={vowelHighlight}
                trialExpired={trialExpired}
              />
            </View>

            <Text style={styles.hint}>
              {T.kbPreviewScreenSub}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 999,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  kbWrap: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 10,
    paddingHorizontal: 20,
  },
});
