import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Pressable,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { X, Clipboard, Trash2, Copy, Lock } from 'lucide-react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';
import type { Translations } from '../i18n';
import type { ClipboardItem } from '../types';
import { PLAN_LIMITS } from '../types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onGoPaywall: () => void;
};

function timeAgo(ts: number, T: Translations): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return T.justNow;
  if (mins < 60) return T.minutesAgo(mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return T.hoursAgo(hrs);
  return T.daysAgo(Math.floor(hrs / 24));
}

export default function ClipboardHistorySheet({ visible, onClose, onGoPaywall }: Props) {
  const T = useT();
  const { clipboardHistory, removeFromClipboardHistory, clearClipboardHistory, getPlanLimits } = useAppStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const limits = getPlanLimits();
  const hasAccess = limits.smartClipboard;

  const handleCopyAgain = async (item: ClipboardItem) => {
    await ExpoClipboard.setStringAsync(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(id => (id === item.id ? null : id)), 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Clipboard size={20} color={Colors.primary} />
              <Text style={s.title}>{T.clipTitle}</Text>
            </View>
            <View style={s.headerRight}>
              {hasAccess && clipboardHistory.length > 0 && (
                <TouchableOpacity onPress={clearClipboardHistory} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Text style={s.clearText}>{T.clipClear}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <X size={22} color={Colors.textGray} />
              </TouchableOpacity>
            </View>
          </View>

          {!hasAccess ? (
            <View style={s.lockedBox}>
              <Lock size={36} color={Colors.textLight} />
              <Text style={s.lockedTitle}>{T.clipLockedTitle}</Text>
              <Text style={s.lockedDesc}>{T.clipLockedDesc(PLAN_LIMITS.pro.clipboardHistoryLimit)}</Text>
              <TouchableOpacity style={s.upgradeBtn} onPress={() => { onClose(); onGoPaywall(); }}>
                <Text style={s.upgradeBtnText}>{T.clipUpgradeBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : clipboardHistory.length === 0 ? (
            <View style={s.empty}>
              <Clipboard size={36} color={Colors.textLight} />
              <Text style={s.emptyTitle}>{T.clipEmptyTitle}</Text>
              <Text style={s.emptyDesc}>{T.clipEmptyDesc}</Text>
            </View>
          ) : (
            <>
              <Text style={s.hint}>{T.clipHint(clipboardHistory.length, PLAN_LIMITS.pro.clipboardHistoryLimit)}</Text>
              <FlatList
                data={clipboardHistory}
                keyExtractor={item => item.id}
                style={s.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }: { item: ClipboardItem; index: number }) => {
                  const justCopied = copiedId === item.id;
                  return (
                    <View style={s.row}>
                      <View style={s.indexBadge}>
                        <Text style={s.indexText}>{index + 1}</Text>
                      </View>
                      <View style={s.rowInfo}>
                        <Text style={s.rowTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={s.rowContent} numberOfLines={2}>
                          {item.categoryType === 'password' ? '••••••••' : item.content}
                        </Text>
                        <Text style={s.rowMeta}>{item.categoryName} · {timeAgo(item.copiedAt, T)}</Text>
                      </View>
                      <View style={s.rowActions}>
                        <TouchableOpacity
                          style={[s.copyBtn, justCopied && s.copyBtnActive]}
                          onPress={() => handleCopyAgain(item)}
                          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                          <Copy size={15} color={justCopied ? Colors.white : Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeFromClipboardHistory(item.id)}
                          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                          <Trash2 size={15} color={Colors.textLight} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + Spacing.lg, maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.border,
    alignSelf: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  title: { ...Typography.h3, color: Colors.textDark },
  clearText: { ...Typography.caption, color: Colors.danger, fontWeight: '600' },
  hint: { ...Typography.caption, color: Colors.textLight, marginBottom: Spacing.sm },
  list: { maxHeight: 420 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm,
  },
  indexBadge: {
    width: 24, height: 24, borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center',
  },
  indexText: { ...Typography.caption, color: Colors.textGray, fontWeight: '700', fontSize: 11 },
  rowInfo: { flex: 1 },
  rowTitle: { ...Typography.body, color: Colors.textDark, fontWeight: '600' },
  rowContent: { ...Typography.caption, color: Colors.textGray, marginTop: 2, lineHeight: 16 },
  rowMeta: { ...Typography.caption, color: Colors.textLight, marginTop: 3, fontSize: 10 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  copyBtn: {
    width: 30, height: 30, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  copyBtnActive: { backgroundColor: Colors.primary },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.textDark },
  emptyDesc: { ...Typography.caption, color: Colors.textGray, textAlign: 'center', lineHeight: 18 },
  lockedBox: {
    alignItems: 'center', paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg, gap: Spacing.md,
  },
  lockedTitle: { ...Typography.h3, color: Colors.textDark },
  lockedDesc: { ...Typography.body, color: Colors.textGray, textAlign: 'center', lineHeight: 22 },
  upgradeBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  upgradeBtnText: { ...Typography.h3, color: Colors.white },
});
