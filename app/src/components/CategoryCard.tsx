import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { CreditCard, MapPin, FileText, Trash2, Pencil, ChevronDown, ChevronUp, Key, Hash, Truck, Link2, ExternalLink, Phone, Copy, Mail } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useT } from '../i18n';
import type { Category, Template } from '../types';

export const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  bank: CreditCard, 'map-pin': MapPin, 'file-text': FileText,
  key: Key, hash: Hash, truck: Truck, link: Link2, mail: Mail, phone: Phone,
  CreditCard, MapPin, FileText, Key, Hash, Truck, Link2, Mail, Phone,
};

export const isUrlContent   = (text: string) => /^https?:\/\//i.test(text.trim());
export const isPhoneContent = (text: string) => /^\+?[\d][\d\s\-()]{1,18}$/.test(text.trim());

type Props = {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onCopyTemplate: (t: Template) => void;
  copiedId: string | null;
};

export default function CategoryCard({
  category, expanded, onToggle, onPress, onDelete, onEdit, onCopyTemplate, copiedId,
}: Props) {
  const T = useT();
  const Icon = iconMap[category.icon] ?? FileText;
  const colorIdx = Colors.categoryColors.indexOf(category.color);
  const iconColor = colorIdx >= 0 ? Colors.categoryIconColors[colorIdx] : Colors.primary;

  const handleOpenUrl = (url: string) => Linking.openURL(url).catch(() => {});
  const handleCall    = (number: string) => Linking.openURL(`tel:${number.replace(/\s/g, '')}`).catch(() => {});

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={onToggle} activeOpacity={0.7}>
        <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
          <Icon size={19} color={iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
          <Text style={styles.count}>{T.cardTemplateCount(category.templates.length)}</Text>
        </View>
        {expanded
          ? <ChevronUp size={15} color={Colors.textLight} />
          : <ChevronDown size={15} color={Colors.textLight} />}
      </TouchableOpacity>

      {/* Expanded */}
      {expanded && (
        <View style={styles.body}>
          {category.templates.length === 0 && !category.is_system ? (
            <TouchableOpacity style={styles.emptyRow} onPress={onPress}>
              <Text style={styles.emptyRowText}>{T.cardAddTemplate}</Text>
            </TouchableOpacity>
          ) : (
            <>
              {category.templates.map((item, idx) => {
                const isUrl   = isUrlContent(item.content);
                const isPhone = !isUrl && isPhoneContent(item.content);
                const justCopied = copiedId === item.id;
                const isLast = idx === category.templates.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.templateRow, isLast && styles.templateRowLast]}
                    onPress={() => onCopyTemplate(item)}
                    activeOpacity={0.65}>
                    <View style={styles.templateInfo}>
                      <Text style={styles.templateTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.templateContent} numberOfLines={1}>{item.content}</Text>
                    </View>
                    {/* Kategori tipi rozeti */}
                    {category.type === 'iban' && (
                      <View style={styles.typeBadge}><Text style={styles.typeBadgeTxt}>₺</Text></View>
                    )}
                    {category.type === 'address' && (
                      <View style={styles.typeBadge}><MapPin size={9} color={Colors.primary} /></View>
                    )}
                    {category.type === 'password' && (
                      <View style={styles.typeBadge}><Key size={9} color={Colors.primary} /></View>
                    )}
                    {category.type === 'phone' && (
                      <View style={styles.typeBadge}><Phone size={9} color={Colors.primary} /></View>
                    )}
                    <View style={styles.templateActions}>
                      {isUrl && (
                        <TouchableOpacity onPress={() => handleOpenUrl(item.content)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} style={styles.actionBtn}>
                          <ExternalLink size={13} color={Colors.primary} />
                        </TouchableOpacity>
                      )}
                      {isPhone && (
                        <TouchableOpacity onPress={() => handleCall(item.content)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} style={styles.actionBtn}>
                          <Phone size={13} color={Colors.success} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => onCopyTemplate(item)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} style={[styles.actionBtn, justCopied && styles.actionBtnActive]}>
                        <Copy size={13} color={justCopied ? Colors.primary : Colors.textLight} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
          {!category.is_system && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.footerBtn} onPress={onPress}>
                <Text style={styles.footerBtnAccent}>{T.cardAddEdit}</Text>
              </TouchableOpacity>
              <View style={styles.footerSep} />
              <TouchableOpacity style={styles.footerBtn} onPress={onEdit}>
                <Pencil size={13} color={Colors.textGray} />
                <Text style={styles.footerBtnText}>{T.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBtn} onPress={onDelete}>
                <Trash2 size={13} color={Colors.danger} />
                <Text style={[styles.footerBtnText, { color: Colors.danger }]}>{T.delete}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    gap: 10,
  },
  iconWrap: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' as const, color: Colors.textDark, letterSpacing: -0.1 },
  count: { fontSize: 11, color: Colors.textGray, marginTop: 2 },

  body: { borderTopWidth: 0.5, borderTopColor: Colors.border },

  templateRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 12,
    borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  templateRowLast: { borderBottomWidth: 0 },
  templateInfo: { flex: 1 },
  typeBadge: { width: 16, height: 16, borderRadius: 4, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  typeBadgeTxt: { fontSize: 9, fontWeight: '700', color: Colors.primary },
  templateTitle: { fontSize: 12, fontWeight: '600' as const, color: Colors.textDark },
  templateContent: { fontSize: 11, color: Colors.textGray, marginTop: 1 },
  templateActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: { padding: 3, borderRadius: 6 },
  actionBtnActive: { backgroundColor: Colors.primaryLight },

  emptyRow: { padding: Spacing.md, alignItems: 'center' },
  emptyRowText: { fontSize: 13, color: Colors.primary, fontWeight: '500' as const },

  footer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 6,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    gap: 2,
    overflow: 'hidden',
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  footerBtnAccent: { fontSize: 11, color: Colors.primary, fontWeight: '600' as const },
  footerBtnText: { fontSize: 11, color: Colors.textGray },
  footerSep: { flex: 1 },
});
