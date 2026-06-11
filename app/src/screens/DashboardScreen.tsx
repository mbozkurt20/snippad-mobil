import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Pressable, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Zap, Clock, BarChart2, AlertTriangle, ChevronRight, Clipboard, Timer, Grid2x2, Lock, Globe } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { KeyboardService, mmkvStorage } from '../store/storage';
import { Analytics } from '../store/analytics';
import { useAlert } from '../components/CustomAlert';
import CategoryCard from '../components/CategoryCard';
import AddCategoryModal from '../components/AddCategoryModal';
import TemplateSheet from '../components/TemplateSheet';
import ClipboardHistorySheet from '../components/ClipboardHistorySheet';
import TrialModal from '../components/TrialModal';
import { useT } from '../i18n';
import type { Lang } from '../i18n';
import type { Category } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'> };

export default function DashboardScreen({ navigation }: Props) {
  const T = useT();
  const { categories, userSettings, addCategory, updateCategory, deleteCategory, addTemplate, updateTemplate, deleteTemplate, getPlanLimits, clipboardHistory, isInTrial, isTrialExpired, trialDaysLeft, getTrialState, copyTemplate, systemCategoryStates, checkClipboard, appLanguage, setAppLanguage } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showClipboard, setShowClipboard] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLangModal, setShowLangModal] = useState(false);

  const trialActive  = isInTrial();
  const trialExpired = isTrialExpired();
  const daysLeft     = trialDaysLeft();
  const trialState   = getTrialState();
  const isReadOnly   = trialState === 'read_only'; // şablonları görebilir ama kopyalayamaz
  const selected = selectedId ? categories.find(c => c.id === selectedId) ?? null : null;
  const [keyboardEnabled, setKeyboardEnabled] = useState<boolean | null>(null);
  const { showAlert, alertElement } = useAlert();
  const insets = useSafeAreaInsets();
  const listBottomPad = 60 + Math.max(insets.bottom, 16) + 24;

  useFocusEffect(
    useCallback(() => {
      KeyboardService.isEnabled().then(enabled => {
        setKeyboardEnabled(enabled);
        // Analytics: klavye durumu takibi
        if (enabled) Analytics.keyboardEnabled();
      });
      checkClipboard();
    }, [])
  );

  const limits = getPlanLimits();
  const avgSecondsPerUse = 8;
  const savedSeconds  = userSettings.usage_count * avgSecondsPerUse;
  const savedMinutes  = Math.floor(savedSeconds / 60);

  const handleAddCategory = async (name: string, type: Category['type'], icon: string, color: string) => {
    const result = await addCategory(name, type, icon, color);
    if (result === 'limit') {
      showAlert({
        title: T.limitTitle,
        message: T.limitCategoryMsg(userSettings.plan),
        buttons: [
          { text: T.cancel, style: 'cancel' },
          { text: T.upgradeToPremium, onPress: () => navigation.navigate('Paywall') },
        ],
      });
    }
  };

  const handleUpdateCategory = async (id: string, name: string, type: Category['type'], icon: string, color: string) => {
    await updateCategory(id, { name, type, icon, color });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCopyFromCard = async (cat: Category, tmpl: import('../types').Template) => {
    if (isReadOnly) {
      showAlert({
        title: '🔒 ' + T.readOnlyMode,
        message: T.readOnlyCopyError,
        buttons: [
          { text: T.cancel, style: 'cancel' },
          { text: T.upgradeToPremium, onPress: () => navigation.navigate('Paywall') },
        ],
      });
      return;
    }
    await copyTemplate(tmpl, cat);
    setCopiedId(tmpl.id);
    setTimeout(() => setCopiedId(id => (id === tmpl.id ? null : id)), 1500);
  };

  const handleDelete = (cat: Category) => {
    showAlert({
      title: T.deleteCategory,
      message: T.deleteCategoryConfirm,
      buttons: [
        { text: T.cancel, style: 'cancel' },
        {
          text: T.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat.id);
              showAlert({
                title: T.success,
                message: T.categoryDeleted(cat.name),
                buttons: [{ text: T.ok, style: 'default' }],
              });
            } catch (e: any) {
              showAlert({
                title: T.error,
                message: e?.message ?? T.deleteFailed,
                buttons: [{ text: T.ok, style: 'default' }],
              });
            }
          },
        },
      ],
    });
  };

  const statVal = savedSeconds < 60
    ? `${savedSeconds}sn`
    : savedMinutes < 60 ? `${savedMinutes}dk`
    : `${Math.floor(savedMinutes / 60)}s`;

  const planLabel: Record<string, string> = {
    free: trialActive ? `${daysLeft}d` : T.planFree,
    basic: T.planPersonal, basic_yearly: T.planPersonal,
    pro: 'Pro', pro_yearly: 'Pro',
    business: 'Business', business_yearly: 'Business',
    ultra_pro: 'Business', ultra_pro_yearly: 'Business',
  };
  const currentPlanLabel = planLabel[userSettings.plan] ?? (userSettings.is_premium ? 'Premium' : T.planFree);
  const badgeStyle = userSettings.is_premium ? styles.planBadge : styles.planBadgeFree;

  // Vakite göre selamlama
  const hour = new Date().getHours();
  const timeGreeting = hour < 5 ? T.timeGreetingNight : hour < 12 ? T.timeGreetingMorning : hour < 18 ? T.timeGreetingAfternoon : hour < 22 ? T.timeGreetingEvening : T.timeGreetingNight;
  const userName = userSettings.profile.name;
  const greetingText = timeGreeting;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {alertElement}
      <TrialModal onGoPaywall={() => navigation.navigate('Paywall')} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.greeting}>{greetingText}</Text>
          <Text style={styles.subtitle}>{T.manageTemplates}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowLangModal(true)} activeOpacity={0.7}>
            <Globe size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowClipboard(true)} activeOpacity={0.7}>
            <Clipboard size={18} color={Colors.primary} />
            {clipboardHistory.length > 0 && (
              <View style={styles.notifDot} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={badgeStyle} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.8}>
            <Zap size={11} color={userSettings.is_premium ? '#fff' : Colors.primary} />
            <Text style={[styles.planBadgeText, !userSettings.is_premium && { color: Colors.primary }]}>
              {currentPlanLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Banners ── */}
      {keyboardEnabled === false && (
        <Pressable style={[styles.banner, styles.bannerWarning]} onPress={() => KeyboardService.openSettings()}>
          <View style={[styles.bannerIcon, { backgroundColor: Colors.primary + '20' }]}>
            <AlertTriangle size={14} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: Colors.primary }]}>{T.keyboardNotActive}</Text>
            <Text style={[styles.bannerSub, { color: Colors.textGray }]}>{T.keyboardNotActiveDesc}</Text>
          </View>
          <ChevronRight size={14} color={Colors.primary} />
        </Pressable>
      )}

      {/* Trial countdown — son 2 günde belirgin banner */}
      {trialActive && !userSettings.is_premium && daysLeft <= 2 && (
        <Pressable style={[styles.banner, styles.bannerTrial]} onPress={() => navigation.navigate('Paywall')}>
          <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Timer size={14} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: '#fff' }]}>
              {daysLeft === 0 ? T.trialLastDay : T.trialDaysLeft(daysLeft)}
            </Text>
            <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.85)' }]}>
              {T.trialExpiringSoon}
            </Text>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.7)" />
        </Pressable>
      )}

      {/* Grace period banner */}
      {trialState === 'grace' && !userSettings.is_premium && (
        <Pressable style={[styles.banner, styles.bannerGrace]} onPress={() => navigation.navigate('Paywall')}>
          <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Zap size={14} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: '#fff' }]}>{T.graceExpired}</Text>
            <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.8)' }]}>{T.graceContinue}</Text>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.7)" />
        </Pressable>
      )}

      {/* Read-only banner */}
      {trialState === 'read_only' && !userSettings.is_premium && (
        <Pressable style={[styles.banner, styles.bannerReadOnly]} onPress={() => navigation.navigate('Paywall')}>
          <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Lock size={14} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: '#fff' }]}>{T.readOnlyMode}</Text>
            <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.8)' }]}>{T.readOnlyUpgrade}</Text>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.7)" />
        </Pressable>
      )}

      {trialExpired && !userSettings.is_premium && (
        <Pressable style={[styles.banner, styles.bannerDanger]} onPress={() => navigation.navigate('Paywall')}>
          <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <AlertTriangle size={14} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: '#fff' }]}>{T.paywallSub}</Text>
            <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.8)' }]}>{T.upgradeToPremium} →</Text>
          </View>
          <ChevronRight size={14} color="rgba(255,255,255,0.7)" />
        </Pressable>
      )}

      {/* ── Stats ── */}
      <View style={styles.statsRow}>
        {[
          { Icon: Clock,     val: statVal,                                                                          label: T.savings },
          { Icon: BarChart2, val: String(userSettings.usage_count),                                                label: T.usage },
          { Icon: Grid2x2,   val: `${categories.length}/${limits.categories === -1 ? '∞' : limits.categories}`,   label: T.category },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <View style={styles.statItem}>
              <s.Icon size={18} color={Colors.primary} />
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={styles.statDiv} />}
          </React.Fragment>
        ))}
      </View>

      {/* Kullanım özeti + son sync */}
      {userSettings.usage_count > 0 && (() => {
        const lastSync = mmkvStorage.getLastSyncAt();
        const syncLabel = lastSync
          ? `Son senkronizasyon: ${new Date(lastSync).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
          : '';
        return (
          <View style={styles.syncRow}>
            <Text style={styles.syncText}>
              Toplam {userSettings.usage_count} şablon kullandın —{' '}
              {Math.round(userSettings.usage_count * 8 / 60)} dk tasarruf
            </Text>
            {!!syncLabel && <Text style={styles.syncTime}>{syncLabel}</Text>}
          </View>
        );
      })()}

      {/* ── Section header ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{T.categories}</Text>
        {categories.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{categories.length}</Text>
          </View>
        )}
      </View>

      {categories.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Text style={{ fontSize: 40 }}>📂</Text>
          </View>
          <Text style={styles.emptyTitle}>{T.firstCategory}</Text>
          <Text style={styles.emptyDesc}>{T.firstCategoryDesc}</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
            <Plus size={18} color={Colors.white} />
            <Text style={styles.emptyBtnText}>{T.addCategory}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories.filter(c => !c.is_system || systemCategoryStates[c.id] !== false)}
          keyExtractor={c => c.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPad }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <CategoryCard
                category={item}
                expanded={expandedIds.has(item.id)}
                onToggle={() => toggleExpand(item.id)}
                onPress={() => setSelectedId(item.id)}
                onDelete={() => handleDelete(item)}
                onEdit={() => { setEditCat(item); setShowAdd(true); }}
                onCopyTemplate={(tmpl) => handleCopyFromCard(item, tmpl)}
                copiedId={copiedId}
              />
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity style={styles.addRow} onPress={() => { setEditCat(null); setShowAdd(true); }}>
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.addRowText}>{T.newCategory}</Text>
            </TouchableOpacity>
          }
        />
      )}

      {categories.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => { setEditCat(null); setShowAdd(true); }}>
          <Plus size={22} color={Colors.white} />
        </TouchableOpacity>
      )}

      <ClipboardHistorySheet
        visible={showClipboard}
        onClose={() => setShowClipboard(false)}
        onGoPaywall={() => navigation.navigate('Paywall')}
      />

      <AddCategoryModal
        visible={showAdd}
        editCategory={editCat}
        onClose={() => { setShowAdd(false); setEditCat(null); }}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
      />

      <TemplateSheet
        category={selected}
        onClose={() => setSelectedId(null)}
        onAddTemplate={async (title, content, shortcut?) => {
          if (!selected) return 'ok';
          const result = await addTemplate(selected.id, title, content, shortcut);
          if (result === 'limit') {
            showAlert({
              title: T.templateLimitTitle,
              message: T.templateLimitDesc(userSettings.plan),
              buttons: [
                { text: T.cancel, style: 'cancel' },
                { text: T.upgradeToPremium, onPress: () => navigation.navigate('Paywall') },
              ],
            });
          }
          return result;
        }}
        onUpdateTemplate={async (templateId, title, content, shortcut?) => { if (selected) await updateTemplate(selected.id, templateId, { title, content, ...(shortcut !== undefined ? { shortcut: shortcut || undefined } : {}) }); }}
        onDeleteTemplate={async id => { if (selected) await deleteTemplate(selected.id, id); }}
        onGoPaywall={() => { setSelectedId(null); navigation.navigate('Paywall'); }}
      />

      {/* Language Modal */}
      <Modal
        visible={showLangModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLangModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{T.selectLanguage}</Text>
            {(['tr', 'en', 'ar'] as const).map(code => (
              <TouchableOpacity
                key={code}
                style={[styles.langOption, appLanguage === code && styles.langOptionActive]}
                onPress={() => {
                  setAppLanguage(code);
                  setShowLangModal(false);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.langDot, appLanguage === code && { backgroundColor: Colors.primary }]} />
                <Text style={[styles.langLabel, appLanguage === code && styles.langLabelActive]}>
                  {code === 'tr' ? T.turkish : code === 'en' ? T.english : T.arabic}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowLangModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>{T.cancel}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header — Modern Hero
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  headerTitleGroup: { gap: 4 },
  greeting: {
    fontSize: 26, fontWeight: '800' as const,
    color: Colors.textDark, letterSpacing: -0.6,
  },
  subtitle: { fontSize: 13, color: Colors.textGray, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, borderWidth: 1.5, borderColor: Colors.surface,
  },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  planBadgeFree: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  planBadgeText: { fontSize: 11, fontWeight: '700' as const, color: '#fff' },

  // Banners — Modern elevated
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: Spacing.lg, marginTop: Spacing.md,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 0,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  bannerWarning: {
    backgroundColor: '#FFF5F0', borderColor: Colors.primary + '20',
  },
  bannerTrial: {
    backgroundColor: '#FF6B00', borderColor: '#FF6B00',
  },
  bannerGrace: {
    backgroundColor: '#7C3AED', borderColor: '#7C3AED',
  },
  bannerReadOnly: {
    backgroundColor: '#374151', borderColor: '#374151',
  },
  syncRow:  { paddingHorizontal: Spacing.lg, paddingVertical: 6 },
  syncText: { fontSize: 12, color: Colors.textGray },
  syncTime: { fontSize: 10, color: Colors.textLight, marginTop: 2 },
  bannerDanger: {
    backgroundColor: Colors.danger, borderColor: Colors.danger,
  },
  bannerUrgent: { borderColor: Colors.danger + '40' },
  bannerIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerTitle: { fontSize: 13, fontWeight: '600' as const, color: Colors.textDark },
  bannerSub: { fontSize: 11, color: Colors.textGray, marginTop: 1 },

  // Stats — Modern Hero
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg, marginTop: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statDiv: { width: 0, backgroundColor: 'transparent' },
  statVal: { fontSize: 20, fontWeight: '800' as const, color: Colors.textDark, letterSpacing: -0.4 },
  statLabel: { fontSize: 11, color: Colors.textGray, fontWeight: '600' as const },

  // Section
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800' as const, color: Colors.textDark, letterSpacing: 1, textTransform: 'uppercase' as const },
  countBadge: {
    backgroundColor: Colors.border, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textGray },

  row: { gap: 10 },
  listContent: { paddingHorizontal: Spacing.lg },
  cardWrap: { flex: 1 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingBottom: 120 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.textDark, textAlign: 'center', marginBottom: Spacing.sm, letterSpacing: -0.3 },
  emptyDesc: { fontSize: 15, color: Colors.textGray, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: 14,
  },
  emptyBtnText: { fontSize: 16, fontWeight: '600' as const, color: Colors.white },

  // Footer add row
  addRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 6, marginBottom: 4,
    paddingVertical: 14,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
  },
  addRowText: { fontSize: 14, color: Colors.primary, fontWeight: '600' as const },

  // FAB
  fab: {
    position: 'absolute', right: Spacing.lg, bottom: 130,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
  },

  // Language Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700' as const,
    color: Colors.textDark, marginBottom: Spacing.lg, textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    minHeight: 56,
  },
  langOptionActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  langDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.border, marginRight: Spacing.md,
    borderWidth: 2, borderColor: Colors.border,
  },
  langLabel: {
    fontSize: 16, fontWeight: '500' as const,
    color: Colors.textPrimary, flex: 1,
    lineHeight: 24,
    textAlign: 'left' as const,
  },
  langLabelActive: {
    color: Colors.primary, fontWeight: '700' as const,
  },
  closeBtn: {
    alignItems: 'center', paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  closeBtnText: {
    fontSize: 15, fontWeight: '600' as const,
    color: Colors.textGray,
  },
});
