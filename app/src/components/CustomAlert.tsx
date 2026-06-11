import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Pressable,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onDismiss?: () => void;
}

export default function CustomAlert({ visible, title, message, buttons, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.box} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={[styles.btnRow, buttons.length > 2 && styles.btnCol]}>
            {buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.btn,
                  buttons.length === 1 && styles.btnFull,
                  btn.style === 'cancel' && styles.btnCancel,
                  btn.style === 'destructive' && styles.btnDestructive,
                  btn.style !== 'cancel' && btn.style !== 'destructive' && styles.btnPrimary,
                ]}
                onPress={() => { btn.onPress?.(); onDismiss?.(); }}>
                <Text style={[
                  styles.btnText,
                  btn.style === 'cancel' && styles.btnTextCancel,
                  btn.style === 'destructive' && styles.btnTextDestructive,
                  btn.style !== 'cancel' && btn.style !== 'destructive' && styles.btnTextPrimary,
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Convenience hook
import { useState, useCallback } from 'react';

interface AlertConfig {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

export function useAlert() {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
  }, []);

  const hideAlert = useCallback(() => setConfig(null), []);

  const alertElement = config ? (
    <CustomAlert
      visible={!!config}
      title={config.title}
      message={config.message}
      buttons={config.buttons}
      onDismiss={hideAlert}
    />
  ) : null;

  return { showAlert, alertElement };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  box: {
    width: '100%', maxWidth: 340,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 16,
  },
  title: { ...Typography.h3, color: Colors.textDark, marginBottom: Spacing.sm, textAlign: 'center' },
  message: { ...Typography.body, color: Colors.textGray, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  btnRow: { flexDirection: 'row', gap: Spacing.sm },
  btnCol: { flexDirection: 'column' },
  btn: {
    flex: 1, paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md, alignItems: 'center',
  },
  btnFull: { flex: 1 },
  btnPrimary: { backgroundColor: Colors.primary },
  btnCancel: { backgroundColor: Colors.cardLight, borderWidth: 1, borderColor: Colors.border },
  btnDestructive: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
  btnText: { ...Typography.body, fontWeight: '600' },
  btnTextPrimary: { color: Colors.white },
  btnTextCancel: { color: Colors.textGray },
  btnTextDestructive: { color: Colors.danger },
});
