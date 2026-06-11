import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, FlatList, KeyboardAvoidingView, Platform, ScrollView, Linking, NativeSyntheticEvent, TextInputSelectionChangeEventData,
} from 'react-native';
import { X, Plus, Trash2, CreditCard, MapPin, FileText, Key, Hash, ChevronDown, ChevronUp, Eye, EyeOff, Info, Copy, Link2, Truck, ExternalLink, QrCode, Navigation, Mail, Pencil, Phone, Search, Download } from 'lucide-react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import QRCodeSVG from 'react-native-qrcode-svg';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAlert } from './CustomAlert';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';
import type { Category, Template } from '../types';

export const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  bank: CreditCard, 'map-pin': MapPin, 'file-text': FileText,
  key: Key, hash: Hash, truck: Truck, link: Link2,
  CreditCard, MapPin, FileText, Key, Hash, Truck, Link2,
};

// {tarih} ve {saat} klavyede otomatik doldurulur.
// {isim}, {tutar} vb. şablona eklenir, kullanıcı yapıştırınca elle doldurur.
const SMART_VARS = [
  { tag: '{tarih}',   desc: 'Tarih',   auto: true  },  // ⚡ otomatik
  { tag: '{saat}',    desc: 'Saat',    auto: true  },  // ⚡ otomatik
  { tag: '{isim}',    desc: 'Rehber',  auto: true  },  // 👤 rehber seçimi
  { tag: '{telefon}', desc: 'Rehber',  auto: true  },  // 👤 rehber seçimi
  { tag: '{tutar}',   desc: 'Tutar',   auto: false },  // elle doldurulur
  { tag: '{adres}',   desc: 'Adres',   auto: false },  // elle doldurulur
];

type Props = {
  category: Category | null;
  onClose: () => void;
  onAddTemplate: (title: string, content: string, shortcut?: string) => Promise<'ok' | 'limit'> | 'ok' | 'limit';
  onUpdateTemplate?: (templateId: string, title: string, content: string, shortcut?: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onGoPaywall: () => void;
};

export default function TemplateSheet({ category, onClose, onAddTemplate, onUpdateTemplate, onDeleteTemplate, onGoPaywall }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [shortcutConflict, setShortcutConflict] = useState(false);
  const [adding, setAdding] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showVars, setShowVars] = useState(false);
  const [titleSelection, setTitleSelection] = useState({ start: 0, end: 0 });
  const [contentSelection, setContentSelection] = useState({ start: 0, end: 0 });

  const handleTitleChange = (text: string) => {
    if (titleSelection.start !== titleSelection.end && text.length < title.length) {
      const newText = title.slice(0, titleSelection.start) + title.slice(titleSelection.end);
      setTitle(newText);
    } else {
      setTitle(text);
    }
  };

  const handleContentChange = (text: string) => {
    if (contentSelection.start !== contentSelection.end && text.length < content.length) {
      const newText = content.slice(0, contentSelection.start) + content.slice(contentSelection.end);
      setContent(newText);
    } else {
      setContent(text);
    }
  };
  const [showVarInfo, setShowVarInfo] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<Template | null>(null);
  const [qrItem, setQrItem] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScope, setActiveScope] = useState<'personal' | 'team'>('personal');

  const hasTeamTemplates = useMemo(() =>
    category?.templates.some(t => t.scope === 'team'), [category]);

  const scopedTemplates = useMemo(() => {
    if (!category) return [];
    if (!hasTeamTemplates) return category.templates; // no tabs — show all
    return category.templates.filter(t =>
      activeScope === 'team' ? t.scope === 'team' : (t.scope !== 'team')
    );
  }, [category, activeScope, hasTeamTemplates]);

  const filteredTemplates = useMemo(() => {
    const base = scopedTemplates;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      (t.shortcut ?? '').toLowerCase().includes(q)
    );
  }, [category, searchQuery]);

  const isLink    = category?.type === 'link';
  const isAddress = category?.type === 'address';
  const isEmail   = category?.type === 'email';
  const isPhone   = category?.type === 'phone';

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.startsWith('90') && digits.length <= 12) {
      const r = digits.slice(2);
      if (r.length <= 3) return `+90 ${r}`;
      if (r.length <= 6) return `+90 ${r.slice(0,3)} ${r.slice(3)}`;
      if (r.length <= 8) return `+90 ${r.slice(0,3)} ${r.slice(3,6)} ${r.slice(6)}`;
      return `+90 ${r.slice(0,3)} ${r.slice(3,6)} ${r.slice(6,8)} ${r.slice(8,10)}`;
    }
    if (digits.startsWith('0') && digits.length <= 11) {
      const r = digits.slice(1);
      if (r.length <= 3) return `0${r}`;
      if (r.length <= 6) return `0${r.slice(0,3)} ${r.slice(3)}`;
      if (r.length <= 8) return `0${r.slice(0,3)} ${r.slice(3,6)} ${r.slice(6)}`;
      return `0${r.slice(0,3)} ${r.slice(3,6)} ${r.slice(6,8)} ${r.slice(8,10)}`;
    }
    return text;
  };

  const T = useT();
  const { showAlert, alertElement } = useAlert();
  const { getPlanLimits, copyTemplate, categories: allCategories, userSettings } = useAppStore();
  // User can edit/delete team templates only if they're the owner/admin
  const canEditTeamItem = (item: Template) => {
    if (item.scope !== 'team') return true; // personal: always editable
    return limits.contactsIntegration; // Business+ = admin rights assumed
  };

  if (!category) return null;

  const limits = getPlanLimits();
  const isBusiness = limits.contactsIntegration; // Business+ planı
  const canUseSmartVars = limits.smartVars;

  const downloadCategory = async (format: 'csv' | 'json') => {
    if (!category) return;
    setDownloadModal(false);
    try {
      let content: string;
      let filename: string;
      if (format === 'csv') {
        const rows = category.templates.map(t =>
          `"${category.name}","${t.title.replace(/"/g, '""')}","${t.content.replace(/"/g, '""')}"`
        );
        content = `kategori_adi,sablon_adi,sablon_icerik\n${rows.join('\n')}`;
        filename = `${category.name.replace(/[^a-zA-Z0-9]/g, '_')}_sablonlar.csv`;
      } else {
        const data = category.templates.map(t => ({ category: category.name, name: t.title, content: t.content }));
        content = JSON.stringify(data, null, 2);
        filename = `${category.name.replace(/[^a-zA-Z0-9]/g, '_')}_sablonlar.json`;
      }
      const file = new File(Paths.cache, filename);
      await file.write(content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: `${category.name} şablonlarını indir`,
        });
      }
    } catch { /* ignore */ }
  };
  const templateCount = category.templates.length;
  const templateLimit = limits.templatesPerCat;
  const isAtLimit = templateLimit !== -1 && templateCount >= templateLimit;
  const isSensitive = category.type === 'password';

  const Icon = iconMap[category.icon] ?? FileText;

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
    });
  };

  const maskContent = (text: string) => {
    if (text.length <= 4) return '•'.repeat(text.length);
    return text.slice(0, 2) + '•'.repeat(Math.min(text.length - 4, 8)) + text.slice(-2);
  };

  const insertVar = (tag: string) => setContent(prev => prev + tag);

  const handleCopy = async (item: Template) => {
    if (!category) return;
    await copyTemplate(item, category);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(id => (id === item.id ? null : id)), 1500);
  };

  const resetForm = () => {
    setTitle(''); setContent(''); setShortcut(''); setShortcutConflict(false);
    setAdding(false); setEditingId(null); setShowVars(false); setShowVarInfo(false);
  };

  const handleShortcutChange = (text: string) => {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    setShortcut(normalized);
    if (normalized.length >= 2) {
      const conflict = allCategories.some(cat =>
        cat.templates.some(t => t.shortcut === normalized && t.id !== editingId)
      );
      setShortcutConflict(conflict);
    } else {
      setShortcutConflict(false);
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || !content.trim() || shortcutConflict) return;
    const sc = shortcut.trim() || undefined;
    if (editingId && onUpdateTemplate) {
      onUpdateTemplate(editingId, title.trim(), content.trim(), sc);
      resetForm();
      return;
    }
    const result = await onAddTemplate(title.trim(), content.trim(), sc);
    if (result === 'limit') {
      showAlert({
        title: T.templateLimitAlertTitle,
        message: templateLimit !== -1 ? T.templateLimitAlertMsg(templateLimit) : T.templateLimitAlertReached,
        buttons: [
          { text: T.cancel, style: 'cancel' },
          { text: T.upgradeToPremium, onPress: onGoPaywall },
        ],
      });
      return;
    }
    resetForm();
  };

  return (
  <>
    <Modal visible={!!category} animationType="slide" transparent statusBarTranslucent>
      {alertElement}
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: category.color }]}>
                <Icon size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>{category.name}</Text>
                {/* Limit göstergesi */}
                <Text style={[
                  styles.limitText,
                  isAtLimit && styles.limitTextDanger,
                ]}>
                  {templateLimit === -1
                    ? T.templateCountUnlimited(templateCount)
                    : T.templateCountLimited(templateCount, templateLimit)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              {isBusiness && category.templates.length > 0 && (
                <TouchableOpacity onPress={() => setDownloadModal(true)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Download size={18} color={Colors.textGray} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => { setSearchQuery(''); onClose(); }}><X size={22} color={Colors.textGray} /></TouchableOpacity>
            </View>
          </View>

          {/* Limit doldu uyarısı */}
          {isAtLimit && (
            <TouchableOpacity style={styles.limitBanner} onPress={onGoPaywall}>
              <Text style={styles.limitBannerText}>
                {T.templateLimitBanner(templateLimit)}
              </Text>
            </TouchableOpacity>
          )}

          {/* Kişisel / Takım sekmeleri — sadece takım şablonu varsa */}
          {hasTeamTemplates && (
            <View style={styles.scopeTabRow}>
              {(['personal', 'team'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setActiveScope(s)}
                  style={[styles.scopeTab, activeScope === s && styles.scopeTabActive]}
                >
                  <Text style={[styles.scopeTabTxt, activeScope === s && styles.scopeTabTxtActive]}>
                    {s === 'personal' ? '🙋 Kişisel' : '👥 Takım'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Arama */}
          {category.templates.length > 0 && (
            <View style={styles.searchRow}>
              <Search size={15} color={Colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder={T.templateSearchPlaceholder}
                placeholderTextColor={Colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <X size={14} color={Colors.textLight} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={filteredTemplates}
            keyExtractor={t => t.id}
            style={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <FileText size={32} color={Colors.textLight} />
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? T.templateNoResults(searchQuery)
                    : category.is_system
                      ? T.categoryEmptySystem
                      : T.noTemplates}
                </Text>
                {!searchQuery.trim() && !category.is_system && (
                  <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setAdding(true)}>
                    <Plus size={16} color={Colors.white} />
                    <Text style={styles.emptyAddBtnText}>{T.addFirstTemplate}</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item }: { item: Template }) => {
              const revealed    = revealedIds.has(item.id);
              const justCopied  = copiedId === item.id;
              const displayText = isSensitive && !revealed
                ? maskContent(item.content)
                : item.content;

              const handleOpen = () => {
                if (isLink) {
                  const url = item.content.startsWith('http') ? item.content : `https://${item.content}`;
                  Linking.openURL(url).catch(() => {});
                } else if (isAddress) {
                  const q = encodeURIComponent(item.content);
                  Linking.openURL(`https://maps.google.com/?q=${q}`).catch(() => {});
                }
              };

              return (
                <TouchableOpacity
                  style={styles.templateRow}
                  onPress={() => handleCopy(item)}
                  onLongPress={() => setPreviewItem(item)}
                  delayLongPress={400}
                  activeOpacity={0.75}>
                  <View style={styles.tmplInfo}>
                    <Text style={styles.tmplTitle}>{item.title}</Text>
                    <Text style={[styles.tmplContent, isSensitive && !revealed && styles.tmplMasked]} numberOfLines={2}>
                      {displayText}
                    </Text>
                  </View>
                  <View style={styles.tmplActions}>
                    {/* Şifre göster/gizle */}
                    {isSensitive && (
                      <TouchableOpacity onPress={() => toggleReveal(item.id)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        {revealed ? <EyeOff size={15} color={Colors.textLight} /> : <Eye size={15} color={Colors.textLight} />}
                      </TouchableOpacity>
                    )}
                    {/* Link / Adres "Aç" butonu */}
                    {(isLink || isAddress) && (
                      <TouchableOpacity onPress={handleOpen} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        {isAddress
                          ? <Navigation size={15} color={Colors.primary} />
                          : <ExternalLink size={15} color={Colors.primary} />}
                      </TouchableOpacity>
                    )}
                    {/* E-posta aç butonu */}
                    {isEmail && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`mailto:${item.content}`).catch(() => {})}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Mail size={15} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                    {/* Telefon ara butonu */}
                    {isPhone && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${item.content.replace(/[^+\d]/g, '')}`).catch(() => {})}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Phone size={15} color={Colors.success} />
                      </TouchableOpacity>
                    )}
                    {/* Düzenle butonu — sistem kategorilerinde yok */}
                    {!category.is_system && (
                      <TouchableOpacity
                        onPress={() => { setEditingId(item.id); setTitle(item.title); setContent(item.content); setShortcut(item.shortcut ?? ''); setShortcutConflict(false); setAdding(true); }}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Pencil size={14} color={Colors.textLight} />
                      </TouchableOpacity>
                    )}
                    {/* QR butonu */}
                    <TouchableOpacity onPress={() => setQrItem(item)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <QrCode size={14} color={Colors.textLight} />
                    </TouchableOpacity>
                    {/* Kopyala */}
                    <TouchableOpacity onPress={() => handleCopy(item)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <Copy size={15} color={justCopied ? Colors.primary : Colors.textLight} />
                    </TouchableOpacity>
                    {/* Sil — sistem/takım kategorisinde sadece admin */}
                    {!category.is_system && canEditTeamItem(item) && (
                      <TouchableOpacity
                        onPress={() => showAlert({
                          title: T.deleteTemplate,
                          message: T.deleteTemplateConfirm(item.title),
                          buttons: [
                            { text: T.cancel, style: 'cancel' },
                            { text: T.delete, style: 'destructive', onPress: () => onDeleteTemplate(item.id) },
                          ],
                        })}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Trash2 size={16} color={Colors.textLight} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {adding ? (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder={T.templateTitle}
                placeholderTextColor={Colors.textLight}
                value={title}
                onChangeText={handleTitleChange}
                onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                  setTitleSelection(e.nativeEvent.selection);
                }}
                maxLength={40}
                selectTextOnFocus
              />
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder={
                  category.type === 'password' ? T.templatePasswordPlaceholder :
                  category.type === 'phone'    ? T.templatePhonePlaceholder :
                  category.type === 'email'    ? T.templateEmailPlaceholder :
                  T.templateDefaultPlaceholder
                }
                placeholderTextColor={Colors.textLight}
                value={content}
                onChangeText={isPhone ? (t) => {
                  const formatted = formatPhone(t);
                  handleContentChange(formatted);
                } : handleContentChange}
                onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                  setContentSelection(e.nativeEvent.selection);
                }}
                multiline={!isPhone && !isEmail}
                numberOfLines={isPhone || isEmail ? 1 : 3}
                keyboardType={isPhone ? 'phone-pad' : isEmail ? 'email-address' : 'default'}
                autoCapitalize={isEmail ? 'none' : 'sentences'}
                secureTextEntry={category.type === 'password'}
                selectTextOnFocus
              />

              {/* Klavye kısayolu */}
              <View style={styles.shortcutRow}>
                <TextInput
                  style={[styles.input, styles.shortcutInput, shortcutConflict && styles.inputError]}
                  placeholder="Kısayol (örn: mrhb)"
                  placeholderTextColor={Colors.textLight}
                  value={shortcut}
                  onChangeText={handleShortcutChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
                {shortcutConflict && (
                  <Text style={styles.shortcutError}>Bu kısayol zaten kullanımda</Text>
                )}
                {shortcut.length > 0 && !shortcutConflict && (
                  <Text style={styles.shortcutHint}>Klavyede "{shortcut}" yazınca öneri gösterilir</Text>
                )}
              </View>

              {/* Akıllı Değişkenler */}
              <View>
                <TouchableOpacity
                  style={[styles.varsToggle, !canUseSmartVars && styles.varsToggleLocked]}
                  onPress={() => {
                    if (!canUseSmartVars) {
                      showAlert({
                        title: T.smartVarsAlertTitle,
                        message: T.smartVarsAlertMsg,
                        buttons: [
                          { text: T.cancel, style: 'cancel' },
                          { text: T.goPro, onPress: onGoPaywall },
                        ],
                      });
                      return;
                    }
                    setShowVars(v => !v);
                  }}>
                  <Text style={[styles.varsTxt, !canUseSmartVars && styles.varsTxtLocked]}>
                    {canUseSmartVars ? T.smartVarsLabel2 : T.smartVarsLocked}
                  </Text>
                  {canUseSmartVars && (
                    showVars ? <ChevronUp size={14} color={Colors.primary} /> : <ChevronDown size={14} color={Colors.primary} />
                  )}
                  {canUseSmartVars && (
                    <TouchableOpacity onPress={() => setShowVarInfo(v => !v)} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
                      <Info size={14} color={Colors.textLight} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {showVarInfo && canUseSmartVars && (
                  <View style={styles.varInfoBox}>
                    <Text style={styles.varInfoText}>
                      📌 <Text style={{ fontWeight: '700' }}>{T.varInfoTitle}</Text>{'\n'}
                      {T.varInfoDesc}{'\n'}
                      • <Text style={{ color: Colors.primary }}>{'{tarih}'}</Text> ve <Text style={{ color: Colors.primary }}>{'{saat}'}</Text> {T.varInfoAutoFill}{'\n'}
                      • <Text style={{ color: Colors.primary }}>{'{isim}'}</Text> ve <Text style={{ color: Colors.primary }}>{'{telefon}'}</Text> {T.varInfoContactFill}{'\n'}
                      • <Text style={{ color: Colors.warning }}>{'{tutar}'}</Text>, <Text style={{ color: Colors.warning }}>{'{adres}'}</Text> {T.varInfoManualFill}
                    </Text>
                  </View>
                )}

                {showVars && canUseSmartVars && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.varScroll}>
                    {SMART_VARS.map(v => (
                      <TouchableOpacity key={v.tag} style={[styles.varChip, v.auto && styles.varChipAuto]} onPress={() => insertVar(v.tag)}>
                        <Text style={[styles.varTag, v.auto && styles.varTagAuto]}>{v.tag}</Text>
                        <Text style={styles.varDesc}>{v.auto ? '⚡ ' : ''}{v.desc}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.formBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={resetForm}>
                  <Text style={styles.cancelBtnText}>{T.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, (!title.trim() || !content.trim()) && styles.saveBtnDisabled]}
                  onPress={handleAdd} disabled={!title.trim() || !content.trim()}>
                  <Text style={styles.saveBtnText}>{editingId ? T.updateCategoryBtn : T.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            !category.is_system && (!isAtLimit ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
                <Plus size={20} color={Colors.white} />
                <Text style={styles.addBtnText}>{T.addTemplate}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.upgradeBtn} onPress={onGoPaywall}>
                <Text style={styles.upgradeBtnText}>{T.limitFullBanner}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>

    {/* Uzun metin önizleme modal — uzun basınca açılır */}
    <Modal visible={!!previewItem} transparent animationType="fade" onRequestClose={() => setPreviewItem(null)}>
      <TouchableOpacity style={styles.previewOverlay} activeOpacity={1} onPress={() => setPreviewItem(null)}>
        <View style={styles.previewBox}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle} numberOfLines={1}>{previewItem?.title}</Text>
            <TouchableOpacity onPress={() => setPreviewItem(null)}>
              <X size={20} color={Colors.textGray} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.previewContent} selectable>{previewItem?.content}</Text>
          </ScrollView>
          <View style={styles.previewActions}>
            {(isLink || isAddress) && (
              <TouchableOpacity style={styles.previewBtn} onPress={() => {
                if (!previewItem) return;
                setPreviewItem(null);
                if (isLink) {
                  const url = previewItem.content.startsWith('http') ? previewItem.content : `https://${previewItem.content}`;
                  Linking.openURL(url).catch(() => {});
                } else {
                  Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(previewItem.content)}`).catch(() => {});
                }
              }}>
                {isAddress ? <Navigation size={16} color={Colors.primary} /> : <ExternalLink size={16} color={Colors.primary} />}
                <Text style={styles.previewBtnTxt}>{isAddress ? T.openInMaps : T.openLink}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.previewBtn, styles.previewBtnPrimary]} onPress={async () => {
              if (!previewItem) return;
              await handleCopy(previewItem);
              setPreviewItem(null);
            }}>
              <Copy size={16} color={Colors.white} />
              <Text style={[styles.previewBtnTxt, { color: Colors.white }]}>Kopyala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>

    {/* QR Kod modal */}
    <Modal visible={!!qrItem} transparent animationType="fade" onRequestClose={() => setQrItem(null)}>
      <TouchableOpacity style={styles.previewOverlay} activeOpacity={1} onPress={() => setQrItem(null)}>
        <View style={styles.qrBox}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>{qrItem?.title}</Text>
            <TouchableOpacity onPress={() => setQrItem(null)}>
              <X size={20} color={Colors.textGray} />
            </TouchableOpacity>
          </View>
          <View style={styles.qrCenter}>
            {qrItem && (
              <QRCodeSVG
                value={qrItem.content}
                size={200}
                backgroundColor={Colors.white}
                color={Colors.textDark}
              />
            )}
            <Text style={styles.qrHint} numberOfLines={2}>{qrItem?.content}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>

      {/* Format seçim modalı — İndir */}
      <Modal visible={downloadModal} transparent animationType="fade" onRequestClose={() => setDownloadModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setDownloadModal(false)}>
          <View style={styles.dlBox}>
            <Text style={styles.dlTitle}>İndirme Formatı</Text>
            <Text style={styles.dlSub}>"{category.name}" kategorisindeki {category.templates.length} şablon</Text>
            <TouchableOpacity style={styles.dlBtn} onPress={() => downloadCategory('csv')}>
              <FileText size={18} color={Colors.primary} />
              <View>
                <Text style={styles.dlBtnLabel}>CSV olarak indir</Text>
                <Text style={styles.dlBtnSub}>Excel ve Google Sheets ile açılır</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dlBtn} onPress={() => downloadCategory('json')}>
              <Hash size={18} color={Colors.primary} />
              <View>
                <Text style={styles.dlBtnLabel}>JSON olarak indir</Text>
                <Text style={styles.dlBtnSub}>Toplu içe aktarma için uygun</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + Spacing.lg, maxHeight: '88%',
  },
  handle: {
    width: 40, height: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.border,
    alignSelf: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconWrap: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.h3, color: Colors.textDark },
  limitText: { ...Typography.label, color: Colors.textGray, marginTop: 2 },
  limitTextDanger: { color: Colors.danger },
  limitBanner: {
    backgroundColor: '#FEF2F2', borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: '#FECACA', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  limitBannerText: { ...Typography.caption, color: Colors.danger, fontWeight: '600' },
  list: { maxHeight: 240 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.textLight },
  templateRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.md,
  },
  tmplInfo: { flex: 1 },
  tmplTitle: { ...Typography.body, color: Colors.textDark, fontWeight: '600' },
  tmplContent: { ...Typography.caption, color: Colors.textGray, marginTop: 2 },
  tmplMasked: { letterSpacing: 2, color: Colors.textLight },
  tmplActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  addForm: { marginTop: Spacing.md, gap: Spacing.sm },
  input: {
    backgroundColor: Colors.cardLight, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
    ...Typography.body, color: Colors.textDark,
  },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  varsToggle: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  varsToggleLocked: { opacity: 0.6 },
  varsTxt: { ...Typography.label, color: Colors.primary, fontWeight: '600', flex: 1 },
  varsTxtLocked: { color: Colors.textLight },
  varInfoBox: {
    backgroundColor: Colors.cardLavender, borderRadius: BorderRadius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.primaryLight,
    marginBottom: Spacing.xs,
  },
  varInfoText: { ...Typography.caption, color: Colors.textGray, lineHeight: 20 },
  varScroll: { marginBottom: Spacing.xs },
  varChip: {
    backgroundColor: Colors.cardLight, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 2,
    marginRight: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  varChipAuto: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary + '40' },
  varTag: { ...Typography.label, color: Colors.textDark, fontWeight: '700' },
  varTagAuto: { color: Colors.primary },
  varDesc: { ...Typography.label, color: Colors.textGray, fontSize: 10 },
  formBtns: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: { flex: 1, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm + 4, alignItems: 'center', backgroundColor: Colors.cardLight },
  cancelBtnText: { ...Typography.body, color: Colors.textGray, fontWeight: '600' },
  saveBtn: { flex: 1, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm + 4, alignItems: 'center', backgroundColor: Colors.primary },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 2, marginTop: Spacing.md,
  },
  addBtnText: { ...Typography.h3, color: Colors.white },
  upgradeBtn: {
    backgroundColor: '#FEF2F2', borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: '#FECACA', paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.md,
  },
  upgradeBtnText: { ...Typography.body, color: Colors.danger, fontWeight: '600' },
  // Preview / QR modals
  previewOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: Spacing.lg,
  },
  previewBox: {
    width: '100%', backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
    maxHeight: '75%',
  },
  previewHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  previewTitle: { ...Typography.h3, color: Colors.textDark, flex: 1, marginRight: Spacing.sm },
  previewScroll: { maxHeight: 280, marginBottom: Spacing.md },
  previewContent: {
    ...Typography.body, color: Colors.textDark,
    lineHeight: 24, letterSpacing: 0.2,
  },
  previewActions: { flexDirection: 'row', gap: Spacing.sm },
  previewBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.primary,
  },
  previewBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  previewBtnTxt: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  qrBox: {
    width: '100%', backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
  },
  qrCenter: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.md },
  qrHint: {
    ...Typography.caption, color: Colors.textGray,
    textAlign: 'center', maxWidth: 220,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.cardLight, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1, ...Typography.body, color: Colors.textDark,
    paddingVertical: 0,
  },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  emptyAddBtnText: { ...Typography.label, color: Colors.white, fontWeight: '600' },
  shortcutRow: { marginBottom: Spacing.sm },
  shortcutInput: { marginBottom: 0 },
  inputError: { borderColor: '#EF4444', borderWidth: 1.5 },
  shortcutError: { ...Typography.caption, color: '#EF4444', marginTop: 4, marginLeft: 2 },
  shortcutHint: { ...Typography.caption, color: Colors.textLight, marginTop: 4, marginLeft: 2 },
  scopeTabRow:        { flexDirection: 'row', marginBottom: 8, backgroundColor: Colors.background, borderRadius: 10, padding: 3 },
  scopeTab:           { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  scopeTabActive:     { backgroundColor: Colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  scopeTabTxt:        { fontSize: 13, fontWeight: '600', color: Colors.textGray },
  scopeTabTxtActive:  { color: Colors.textDark },
  dlBox:       { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 48, gap: 12 },
  dlTitle:     { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  dlSub:       { fontSize: 12, color: Colors.textGray, marginBottom: 4 },
  dlBtn:       { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.background, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  dlBtnLabel:  { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  dlBtnSub:    { fontSize: 11, color: Colors.textGray, marginTop: 2 },
});
