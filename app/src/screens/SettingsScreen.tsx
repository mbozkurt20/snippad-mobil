import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, TextInput, Modal, KeyboardAvoidingView, Animated, Share, PermissionsAndroid } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, HelpCircle, Trash2, LogOut, ChevronRight, ChevronDown, Clock, BarChart2, Lock, Edit3, RefreshCw, Keyboard, MousePointer, Eye, PenLine, BookUser, Palette, Type, Baseline, Gauge, Gift, Library, Globe, Users, Upload, Signature, Mail, Grid3X3, Link2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { api } from '../store/api';
import { KeyboardService, mmkvStorage } from '../store/storage';
import { useAlert } from '../components/CustomAlert';
import { useT } from '../i18n';
import type { Lang } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList, RootStackParamList } from '../types';
import { PLAN_LIMITS } from '../types';
import { TEMPLATE_PACKS } from '../constants/templatePacks';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'SettingsHome'> };

const THEMES_ALL = [
  { key: 'ember',      label: 'Ember',      sub: 'Turuncu kor glow',          preview: '#26221A', accent: '#F07010' },
];

const FONT_SIZE_KEYS = [
  { key: 'small',  desc: '12px' },
  { key: 'normal', desc: '15px' },
  { key: 'large',  desc: '18px' },
  { key: 'xlarge', desc: '22px' },
] as const;

function CollapsibleSection({ title, badge, children, defaultOpen = false, Icon }: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
  Icon?: React.ComponentType<{ size: number; color: string }>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const anim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.spring(anim, { toValue: next ? 1 : 0, useNativeDriver: false, bounciness: 0, speed: 14 }).start();
  };

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={{
      backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
      borderWidth: 0,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
      overflow: 'hidden',
    }}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md }}>
        {Icon && (
          <View style={styles.menuIcon}>
            <Icon size={16} color={Colors.primary} />
          </View>
        )}
        <Text style={[styles.menuLabel, { flex: 1 }]}>{title}</Text>
        {badge && <Text style={[styles.proBadge, { marginRight: 8 }]}>{badge}</Text>}
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={16} color={Colors.textLight} />
        </Animated.View>
      </TouchableOpacity>
      {open && (
        <View style={{ borderTopWidth: 0, paddingVertical: Spacing.xs }}>
          {children}
        </View>
      )}
    </View>
  );
}

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: value ? 1 : 0, useNativeDriver: false, bounciness: 4 }).start();
  }, [value]);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [Colors.border, Colors.primary] });
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onValueChange(!value)}>
      <Animated.View style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: trackColor, justifyContent: 'center' }}>
        <Animated.View style={{
          width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
          transform: [{ translateX }],
          shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2,
        }} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function MenuRow({ Icon, label, danger, onPress, badge, sub, disabled }: {
  Icon: React.ComponentType<{ size: number; color: string }>;
  label: string; danger?: boolean; onPress: () => void; badge?: string; sub?: string; disabled?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.menuRow, disabled && styles.menuRowDisabled]} onPress={disabled ? undefined : onPress} activeOpacity={0.7} disabled={disabled}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger, disabled && styles.menuIconDisabled]}>
        <Icon size={16} color={disabled ? Colors.textLight : (danger ? Colors.danger : Colors.primary)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger, disabled && styles.menuLabelDisabled]}>{label}</Text>
        {sub && <Text style={[styles.menuSub, disabled && styles.menuSubDisabled]}>{sub}</Text>}
      </View>
      {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
      {disabled ? <Lock size={14} color={Colors.textLight} /> : <ChevronRight size={14} color={Colors.textLight} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const T = useT();
  const { userSettings, categories, resetAll, setPremium, setDevPlan, expireTrialNow, logout, syncKeyboardSettings, systemCategoryStates, setSystemCategoryState, setKeyboardLayout: storeSetLayout, setKeyboardLanguage: storeSetLanguage, setKeyboardTheme: storeSetTheme, setKeyboardFontSize: storeSetFontSize, setKeyboardFontFamily: storeSetFontFamily, getPlanLimits, appLanguage, setAppLanguage, teamMembership, getTrialState, trialDaysLeft, loadFromApi } = useAppStore();
  const trialState = getTrialState();
  const daysLeft   = trialDaysLeft();
  const triggerSync = () => syncKeyboardSettings();
  const [activeTheme, setActiveTheme] = useState(mmkvStorage.getKeyboardTheme());
  const [activeFontSize, setActiveFontSize] = useState(mmkvStorage.getKeyboardFontSize());
  const [activeFontFamily, setActiveFontFamily] = useState(mmkvStorage.getKeyboardFontFamily());
  const [activeProfile, setActiveProfile] = useState(mmkvStorage.getTypingProfile());
  const [kbLayout, setKbLayout]             = useState(mmkvStorage.getKeyboardLayout());
  const [kbLanguage, setKbLanguage]          = useState(mmkvStorage.getKeyboardLanguage());
  const [showFiligran, setShowFiligran]     = useState(userSettings.show_filigran ?? true);

  const [smartCatOpen, setSmartCatOpen]      = useState(false);

  const FONT_SIZES = [
    { key: 'small',  label: T.szSmall,  desc: '12px' },
    { key: 'normal', label: T.szNormal, desc: '15px' },
    { key: 'large',  label: T.szLarge,  desc: '18px' },
    { key: 'xlarge', label: T.szXLarge, desc: '22px' },
  ];

  const planLimits  = getPlanLimits();
  const themeLimit  = planLimits.themes === -1 ? THEMES_ALL.length : planLimits.themes;
  const { showAlert, alertElement } = useAlert();
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<NavigationProp<RootStackParamList>>();
  const goToLogin = () => rootNav.navigate('Login');
  const totalTemplates = categories.reduce((s, c) => s + c.templates.length, 0);
  const savedSec = userSettings.usage_count * 8;
  const savedMin = Math.floor(savedSec / 60);
  const timeLabel = savedSec < 60 ? `${savedSec}sn` : savedMin < 60 ? `${savedMin}dk` : `${Math.floor(savedMin/60)}s ${savedMin%60}dk`;

  const initials = (userSettings.profile.name || userSettings.profile.email || '')
    .split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  const isGuest = !userSettings.is_logged_in;

  const selectTheme = (key: string) => {
    setActiveTheme(key);
    storeSetTheme(key);
  };

  const selectFontSize = (key: string) => {
    if (!planLimits.fontSettings) { navigation.navigate('Paywall'); return; }
    setActiveFontSize(key);
    storeSetFontSize(key);
  };

  const selectFontFamily = (key: string) => {
    if (!planLimits.fontSettings) { navigation.navigate('Paywall'); return; }
    setActiveFontFamily(key);
    storeSetFontFamily(key);
  };

  const selectProfile = (key: string) => {
    setActiveProfile(key);
    mmkvStorage.setTypingProfile(key);
    triggerSync();
  };

  const handleManageSubscription = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
  };

  const handleLogout = () => {
    showAlert({
      title: T.logout,
      message: T.logoutConfirm,
      buttons: [
        { text: T.cancel, style: 'cancel' },
        { text: T.logout, style: 'destructive', onPress: logout },
      ],
    });
  };

  const handleReset = () => {
    const BUSINESS_PLANS = ['business', 'business_yearly', 'ultra_pro', 'ultra_pro_yearly'];
    const isBiz = BUSINESS_PLANS.includes(userSettings.plan ?? '');
    const msg = isBiz
      ? 'Kategoriler ve şablonlarınız silinecek. Sistem kategorileri pasife alınacak. Hesap bilgileri ve abonelik korunacak.'
      : 'Kategoriler ve şablonlarınız silinecek. Bu işlem geri alınamaz.';
    showAlert({
      title: T.deleteAll,
      message: msg,
      buttons: [
        { text: T.cancel, style: 'cancel' },
        { text: T.yes, style: 'destructive', onPress: resetAll },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {alertElement}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 8) + 100 }]}>

        {/* Trial durum banner'ı */}
        {(trialState === 'active' || trialState === 'last_day') && !userSettings.is_premium && (
          <TouchableOpacity
            style={[trialState === 'last_day' ? styles.trialBannerUrgent : styles.trialBanner]}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.85}>
            <Text style={styles.trialBannerEmoji}>{trialState === 'last_day' ? '⏰' : '🎁'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.trialBannerTitle}>
                {trialState === 'last_day' ? 'Son gün! Business denemen bitiyor' : `Business Deneme — ${daysLeft} gün kaldı`}
              </Text>
              <Text style={styles.trialBannerSub}>Plan seç ve kesintisiz devam et →</Text>
            </View>
          </TouchableOpacity>
        )}
        {(trialState === 'grace' || trialState === 'read_only') && !userSettings.is_premium && (
          <TouchableOpacity style={styles.trialBannerExpired} onPress={() => navigation.navigate('Paywall')} activeOpacity={0.85}>
            <Text style={styles.trialBannerEmoji}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.trialBannerTitle}>
                {trialState === 'grace' ? 'Denemen bitti — 24 saat grace süresi' : 'Salt Okunur Mod aktif'}
              </Text>
              <Text style={styles.trialBannerSub}>Tam erişim için planını seç →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Profile / Guest header */}
        <TouchableOpacity
          style={styles.profileHeader}
          onPress={() => !isGuest && navigation.navigate('Profile')}
          activeOpacity={isGuest ? 1 : 0.8}>
          <View style={[styles.avatar, isGuest && styles.avatarGuest]}>
            {isGuest
              ? <Text style={styles.avatarIcon}>👤</Text>
              : <Text style={styles.avatarText}>{initials}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>
              {isGuest ? T.guestUser : (userSettings.profile.name || 'Snippad')}
            </Text>
            {isGuest
              ? <TouchableOpacity onPress={goToLogin}>
                  <Text style={styles.loginHint}>{T.loginHint}</Text>
                </TouchableOpacity>
              : <>
                  {!!userSettings.profile.email && <Text style={styles.userEmail}>{userSettings.profile.email}</Text>}
                  <Text style={styles.editHint}>{T.editProfileHint}</Text>
                </>}
          </View>
          {userSettings.is_premium && (() => {
            const planLabel: Record<string, string> = {
              basic: 'Kişisel',  basic_yearly: 'Kişisel',
              pro: 'Pro',        pro_yearly: 'Pro',
              business: 'Business', business_yearly: 'Business',
              ultra_pro: 'Business', ultra_pro_yearly: 'Business',
            };
            const label = planLabel[userSettings.plan] ?? 'Premium';
            return (
              <View style={styles.premiumBadge}>
                <Zap size={12} color={Colors.primary} />
                <Text style={styles.premiumText}>{label}</Text>
              </View>
            );
          })()}
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsCard}>
          {[
            { Icon: Clock,    val: timeLabel,                        label: T.savings },
            { Icon: BarChart2,val: String(userSettings.usage_count), label: T.usage },
            { Icon: Zap,      val: String(totalTemplates),           label: T.statTemplates },
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

        {/* Hesap */}
        <Text style={styles.section}>{T.account}</Text>
        <View style={styles.card}>
          {!isGuest && <>
            <MenuRow Icon={Edit3} label={T.editProfile} onPress={() => navigation.navigate('Profile')} />
            <View style={styles.rowSep} />
            <MenuRow Icon={Lock} label={T.changePassword} onPress={() => navigation.navigate('ChangePassword')} />
            <View style={styles.rowSep} />
          </>}
          {!userSettings.is_premium && (
            <MenuRow Icon={Zap} label={T.upgradePlan} badge={T.unlimited} onPress={() => navigation.navigate('Paywall')} />
          )}
          {userSettings.is_premium && (
            <MenuRow Icon={RefreshCw} label={T.manageSubscription} sub={T.manageSubSub} onPress={handleManageSubscription} />
          )}
        </View>

        {/* Klavyeyi Kur */}
        <Text style={styles.section}>{T.keyboardSetup}</Text>
        <View style={styles.card}>
          <MenuRow Icon={Keyboard} label={T.enableKeyboard} sub={T.enableKeyboardSub} onPress={() => KeyboardService.openSettings()} />
          <View style={styles.rowSep} />
          <MenuRow Icon={MousePointer} label={T.selectActiveKeyboard} sub={Platform.OS === 'ios' ? T.selectKbSubIos : T.selectKbSubAndroid} onPress={() => KeyboardService.showPicker()} />
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>{T.keyboardTip}</Text>
        </View>

        {/* Önizleme butonu */}
        <Text style={styles.section}>{T.sectionKeyboardPreview}</Text>
        <View style={styles.card}>
          <MenuRow Icon={Eye} label={T.kbPreviewLabel} sub={T.kbPreviewSub} onPress={() => navigation.navigate('KeyboardPreview')} />
        </View>

        {/* Klavye düzeni Q / F + TR / EN */}
        <Text style={styles.section}>{T.sectionKeyboardLayout}</Text>
        <View style={styles.card}>
          {/* Dil: Türkçe / İngilizce */}
          <View style={styles.menuRow}>
            <View style={styles.menuIcon}><PenLine size={16} color={Colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{T.kbLangLabel}</Text>
              <Text style={styles.menuSub}>{T.kbLangSub}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {([['tr', 'TR'], ['en', 'EN'], ['ar', 'AR']] as const).map(([code, label]) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => { setKbLanguage(code); storeSetLanguage(code); }}
                  style={{
                    flex: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
                    backgroundColor: kbLanguage === code ? Colors.primary : Colors.surface,
                    borderWidth: 1, borderColor: kbLanguage === code ? Colors.primary : Colors.border,
                    alignItems: 'center'
                  }}>
                  <Text style={{ fontSize: 11, fontWeight: kbLanguage === code ? '700' : '600', color: kbLanguage === code ? '#fff' : Colors.textGray }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.rowSep} />
          {/* Düzen: Q / F (sadece Türkçe'de anlamlı) */}
          <View style={styles.menuRow}>
            <View style={styles.menuIcon}><PenLine size={16} color={Colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{T.kbLayoutLabel}</Text>
              <Text style={styles.menuSub}>{T.kbLayoutSub}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['q', 'f'] as const).map(l => (
                <TouchableOpacity
                  key={l}
                  onPress={() => { setKbLayout(l); storeSetLayout(l); }}
                  style={{
                    flex: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
                    backgroundColor: kbLayout === l ? Colors.primary : Colors.surface,
                    borderWidth: 1, borderColor: kbLayout === l ? Colors.primary : Colors.border,
                    alignItems: 'center'
                  }}>
                  <Text style={{ fontSize: 11, fontWeight: kbLayout === l ? '700' : '600', color: kbLayout === l ? '#fff' : Colors.textGray }}>
                    {l.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Mikrofon izni */}
        {Platform.OS === 'android' && (
          <>
            <Text style={styles.section}>{T.sectionVoiceInput}</Text>
            <View style={styles.card}>
              <MenuRow
                Icon={Gauge}
                label={T.micPermLabel}
                sub={T.micPermSub}
                onPress={async () => {
                  try {
                    const granted = await PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                      {
                        title: T.micPermLabel,
                        message: T.micPermSub,
                        buttonPositive: T.ok,
                        buttonNegative: T.cancel,
                      }
                    );
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                      showAlert({ title: T.micGrantedTitle, message: T.micGrantedMsg, buttons: [{ text: T.ok }] });
                    } else {
                      showAlert({ title: T.micDeniedTitle, message: T.micDeniedMsg, buttons: [{ text: T.ok }] });
                    }
                  } catch (_) {}
                }}
              />
            </View>
          </>
        )}

        {/* Görünüm — Tema, Yazı Boyutu, Font (collapsible) */}
        <Text style={styles.section}>{T.sectionAppearance}</Text>
        <CollapsibleSection title={T.kbThemeLabel} Icon={Palette} badge={themeLimit < THEMES_ALL.length ? `${themeLimit}/${THEMES_ALL.length}` : undefined}>
          {THEMES_ALL.map((theme, i) => {
            const locked = i >= themeLimit;
            return (
              <React.Fragment key={theme.key}>
                <TouchableOpacity
                  style={[styles.themeRow, locked && { opacity: 0.4 }]}
                  onPress={() => {
                    if (locked) { navigation.navigate('Paywall'); return; }
                    selectTheme(theme.key);
                  }}>
                  <View style={[styles.themePreview, { backgroundColor: theme.preview, borderColor: (theme as any).accent ?? Colors.border }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.themeLabel}>{theme.label}</Text>
                    <Text style={styles.themeSub}>{theme.sub}</Text>
                  </View>
                  {locked
                    ? <Lock size={14} color={Colors.textLight} />
                    : <View style={[styles.themeCheck, activeTheme === theme.key && styles.themeCheckActive]}>
                        {activeTheme === theme.key && <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>✓</Text>}
                      </View>
                  }
                </TouchableOpacity>
                {i < THEMES_ALL.length - 1 && <View style={styles.rowSep} />}
              </React.Fragment>
            );
          })}
        </CollapsibleSection>

        <CollapsibleSection title={T.fontSizeLabel} Icon={Type} badge={!planLimits.fontSettings ? 'Pro+' : undefined} defaultOpen={false}>
          <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'space-between', opacity: !planLimits.fontSettings ? 0.5 : 1 }}>
            {FONT_SIZES.map(fs => (
              <TouchableOpacity
                key={fs.key}
                disabled={!planLimits.fontSettings}
                style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: activeFontSize === fs.key && planLimits.fontSettings ? Colors.primary : Colors.surface, borderWidth: 1, borderColor: activeFontSize === fs.key && planLimits.fontSettings ? Colors.primary : Colors.border, alignItems: 'center' }}
                onPress={() => selectFontSize(fs.key)}>
                <Text style={{ fontSize: 11, fontWeight: activeFontSize === fs.key && planLimits.fontSettings ? '700' : '600', color: activeFontSize === fs.key && planLimits.fontSettings ? '#fff' : Colors.textGray }}>
                  {!planLimits.fontSettings ? '🔒' : fs.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>

        <CollapsibleSection title={T.fontFamilyLabel} Icon={Baseline} badge={!planLimits.fontSettings ? 'Pro+' : undefined} defaultOpen={false}>
          <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, justifyContent: 'space-between', opacity: !planLimits.fontSettings ? 0.5 : 1 }}>
            {[
              { key: 'system',  label: T.ffDefault },
              { key: 'mono',    label: T.ffMono },
              { key: 'bold',    label: T.ffBold },
              { key: 'rounded', label: T.ffRounded },
            ].map(ff => (
              <TouchableOpacity
                key={ff.key}
                disabled={!planLimits.fontSettings}
                style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: activeFontFamily === ff.key && planLimits.fontSettings ? Colors.primary : Colors.surface, borderWidth: 1, borderColor: activeFontFamily === ff.key && planLimits.fontSettings ? Colors.primary : Colors.border, alignItems: 'center' }}
                onPress={() => selectFontFamily(ff.key)}>
                <Text style={{ fontSize: 11, fontWeight: activeFontFamily === ff.key && planLimits.fontSettings ? '700' : '600', color: activeFontFamily === ff.key && planLimits.fontSettings ? '#fff' : Colors.textGray, textTransform: 'capitalize' }}>
                  {!planLimits.fontSettings ? '🔒' : ff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CollapsibleSection>

        {/* Yazım Profili */}
        <Text style={styles.section}>{T.sectionTypingProfile}</Text>
        <CollapsibleSection title={T.typingProfileLabel} Icon={Gauge} defaultOpen={false}>
          {[
            { key: 'default',  label: T.tpDefault,  desc: T.tpDefaultSub },
            { key: 'fast',     label: T.tpFast,     desc: T.tpFastSub },
            { key: 'beginner', label: T.tpBeginner, desc: T.tpBeginnerSub },
            { key: 'elder',    label: T.tpElder,    desc: T.tpElderSub },
          ].map((p, i, arr) => (
            <React.Fragment key={p.key}>
              <TouchableOpacity style={styles.themeRow} onPress={() => selectProfile(p.key)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.themeLabel}>{p.label}</Text>
                  <Text style={styles.themeSub}>{p.desc}</Text>
                </View>
                <View style={[styles.themeCheck, activeProfile === p.key && styles.themeCheckActive]}>
                  {activeProfile === p.key && <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>✓</Text>}
                </View>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.rowSep} />}
            </React.Fragment>
          ))}
        </CollapsibleSection>

        {/* Pro+ Özellikleri */}
        <View style={styles.sectionRow2}>
          <Text style={styles.section}>{T.sectionProFeatures}</Text>
          {!planLimits.smartVars && <Text style={styles.proBadge}>Pro+</Text>}
        </View>
        <View style={[styles.card, !planLimits.smartVars && styles.lockedCard]}>
          <MenuRow
            Icon={Eye}
            label={T.searchLabel}
            sub={T.searchSub}
            onPress={() => { if (!planLimits.searchBar) navigation.navigate('Paywall'); }}
          />
          <View style={styles.rowSep} />
          <MenuRow
            Icon={Eye}
            label={T.smartVarsLabel}
            sub={T.smartVarsSub}
            onPress={() => { if (!planLimits.smartVars) navigation.navigate('Paywall'); }}
          />
          <View style={styles.rowSep} />
          <MenuRow
            Icon={Eye}
            label={T.clipboardHistLabel}
            sub={T.clipboardHistSub(planLimits.clipboardHistoryLimit > 0 ? planLimits.clipboardHistoryLimit : 50)}
            onPress={() => { if (!planLimits.smartVars) navigation.navigate('Paywall'); }}
          />
        </View>

        {/* Takım Üyeliği — sadece non-owner üyeler için göster */}
        {teamMembership && !teamMembership.is_owner && (
          <>
            <View style={styles.sectionRow2}>
              <Text style={styles.section}>EKİP ÜYELİĞİ</Text>
            </View>
            <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: '#FF6B00' }]}>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B0020', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Users size={18} color="#FF6B00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{teamMembership.team_name}</Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      {teamMembership.owner_name} tarafından davet edildiniz
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#FF6B0020', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF6B00', textTransform: 'uppercase' }}>
                      {{ owner: 'Owner', admin: 'Admin', editor: 'Editör', viewer: 'İzleyici' }[teamMembership.role] ?? teamMembership.role}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 17 }}>
                  Bu ekibin paylaşımlı şablonlarına klavyeden erişebilirsiniz.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Sektörel Hazır Paketler — herkese açık */}
        <View style={styles.sectionRow2}>
          <Text style={styles.section}>HAZIR PAKETLER</Text>
        </View>
        <View style={styles.card}>
          <MenuRow
            Icon={Library}
            label="Sektörel Şablon Paketleri"
            sub="Muhasebeci, emlakçı, avukat, esnaf, sağlık — tek tıkla yükle"
            disabled={!planLimits.sectorPacks}
            onPress={() => navigation.navigate('SectorPacks')}
          />
        </View>

        {/* Business Özellikleri */}
        <View style={styles.sectionRow2}>
          <Text style={styles.section}>{T.sectionBusinessFeatures}</Text>
        </View>
        <View style={styles.card}>
          <MenuRow
            Icon={Signature}
            label={T.signaturesLabel}
            sub={planLimits.signatureText ? T.signaturesLabelSub : T.signatureBizReq}
            badge={!planLimits.signatureText ? '🔒' : undefined}
            onPress={() => {
              if (!planLimits.signatureText) { navigation.navigate('Paywall'); return; }
              navigation.navigate('SignatureManager');
            }}
          />
          <View style={styles.rowSep} />
          <MenuRow
            Icon={Users}
            label={T.teamMgmtLabel}
            sub={planLimits.contactsIntegration ? T.teamMgmtSub : T.signatureBizReq}
            badge={!planLimits.contactsIntegration ? '🔒' : undefined}
            onPress={() => {
              if (!planLimits.contactsIntegration) { navigation.navigate('Paywall'); return; }
              navigation.navigate('Team');
            }}
          />
          <View style={styles.rowSep} />
          <MenuRow
            Icon={Upload}
            label={T.bulkImportLabel}
            sub={planLimits.contactsIntegration ? T.bulkImportSub : T.signatureBizReq}
            badge={!planLimits.contactsIntegration ? '🔒' : undefined}
            onPress={() => {
              if (!planLimits.contactsIntegration) { navigation.navigate('Paywall'); return; }
              navigation.navigate('BusinessImport');
            }}
          />
          <View style={styles.rowSep} />
          <MenuRow
            Icon={BookUser}
            label={T.contactsLabel}
            sub={planLimits.contactsIntegration ? T.contactsSub : T.contactsBizReq}
            onPress={() => {
              if (!planLimits.contactsIntegration) { navigation.navigate('Paywall'); return; }
              showAlert({
                title: T.contactsAlertTitle,
                message: T.contactsAlertMsg,
                buttons: [{ text: T.ok, style: 'default' }],
              });
            }}
          />
          <>
            <View style={styles.rowSep} />
            <TouchableOpacity style={styles.menuRow} onPress={() => setSmartCatOpen(v => !v)} activeOpacity={0.7}>
              <View style={styles.menuIcon}>
                <Library size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{T.smartCatsLabel}</Text>
                <Text style={styles.menuSub}>
                  {TEMPLATE_PACKS.filter(p => systemCategoryStates[p.slug] !== false).length} / {TEMPLATE_PACKS.length} aktif
                </Text>
              </View>
              <View style={{ transform: [{ rotate: smartCatOpen ? '180deg' : '0deg' }] }}>
                <ChevronDown size={16} color={Colors.textLight} />
              </View>
            </TouchableOpacity>
            {smartCatOpen && (
              TEMPLATE_PACKS.map(pack => (
                <React.Fragment key={pack.slug}>
                  <View style={styles.rowSep} />
                  <View style={styles.menuRow}>
                    <View style={styles.menuIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuLabel}>{pack.name}</Text>
                      <Text style={styles.menuSub}>{pack.description}</Text>
                    </View>
                    <CustomSwitch
                      value={systemCategoryStates[pack.slug] !== false}
                      onValueChange={v => setSystemCategoryState(pack.slug, v)}
                    />
                  </View>
                </React.Fragment>
              ))
            )}
          </>
        </View>

        {/* Paylaş / Referral */}
        <Text style={styles.section}>{T.sectionInvite}</Text>
        <View style={styles.card}>
          {userSettings.referral_code && (
            <>
              <View style={styles.menuRow}>
                <View style={styles.menuIcon}><Gift size={16} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>Davet Kodun</Text>
                  <Text style={[styles.menuSub, { letterSpacing: 2, fontWeight: '700', color: Colors.primary }]}>
                    {userSettings.referral_code}
                  </Text>
                </View>
              </View>
              <View style={styles.rowSep} />
            </>
          )}
          <MenuRow
            Icon={Gift}
            label={T.shareLabel}
            sub="Arkadaşın üye olursa ikinize de 1 ay ücretsiz Business"
            onPress={async () => {
              const code = userSettings.referral_code;
              // Deep link: asistanklavye://referral?code=XXX — uygulama kuruluysa direkt açar
              const deepLink = code ? `asistanklavye://referral?code=${code}` : '';
              const webLink = code
                ? `https://snippad.vertexforge.tech?ref=${code}`
                : 'https://snippad.vertexforge.tech';
              const refPart = code ? `\n\nDavet kodum: ${code}\nDirekt indir: ${webLink}` : `\n\nİndir: ${webLink}`;
              const msg = `Bu uygulamayı kullanmadan önce IBAN kopyalamak için 5 adım atıyordum. Şimdi 1 dokunuş.\n\nSnippad — IBAN, adres, hazır cevaplar, şifreler... Her şey klavyenden tek tuşta.${refPart}`;
              if (Platform.OS === 'web') {
                if (typeof navigator !== 'undefined' && (navigator as any).share) {
                  await (navigator as any).share({ text: msg });
                }
                return;
              }
              await Share.share({ message: msg, title: "Snippad'a davet" });
            }}
          />
        </View>

        {/* Uygulama Dili */}
        <Text style={styles.section}>{T.appLangSection}</Text>
        <View style={styles.card}>
          <View style={styles.menuRow}>
            <View style={styles.menuIcon}><Globe size={16} color={Colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{T.appLang}</Text>
              <Text style={styles.menuSub}>{T.appLangDesc}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {([['tr', 'TR'], ['en', 'EN'], ['ar', 'AR']] as const).map(([code, label]) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => {
                    if (code === appLanguage) return;
                    const needsRestart = (code === 'ar') !== (appLanguage === 'ar');
                    setAppLanguage(code as Lang);
                    if (needsRestart) {
                      showAlert({
                        title: 'Yeniden Başlatılıyor',
                        message: 'Dil düzeni değiştiği için uygulama yeniden başlatılıyor…',
                        buttons: [{ text: 'Tamam', style: 'default' }],
                      });
                    }
                  }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                    backgroundColor: appLanguage === code ? Colors.primary : Colors.background,
                    borderWidth: 1.5, borderColor: appLanguage === code ? Colors.primary : Colors.border,
                  }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: appLanguage === code ? '#fff' : Colors.textGray }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Destek */}
        <Text style={styles.section}>{T.support}</Text>
        <View style={styles.card}>
          <MenuRow Icon={HelpCircle} label={T.helpSupport} onPress={() => navigation.navigate('HelpSupport')} />
          <View style={styles.rowSep} />
          <MenuRow Icon={Lock} label={T.appPermLabel} sub={T.appPermSub} onPress={() => navigation.navigate('Permissions')} />
          <View style={styles.rowSep} />
          <MenuRow Icon={Mail} label={T.emailPreferences} onPress={() => navigation.navigate('EmailPreferences')} />
          <View style={styles.rowSep} />
          <MenuRow Icon={Trash2} label={T.deletedCategories} onPress={() => navigation.navigate('DeletedCategories')} />
          <View style={styles.rowSep} />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md }}>
            <View style={{ width: 34, height: 34, borderRadius: BorderRadius.sm, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.primary }}>S</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Snippad Logosu</Text>
              <Text style={styles.menuSub}>Klavyede logo göster</Text>
            </View>
            <CustomSwitch value={showFiligran} onValueChange={(val) => { setShowFiligran(val); /* TODO: Save to backend */ }} />
          </View>
        </View>

        {/* Özellikler */}
        <Text style={styles.section}>Özellikler</Text>
        <View style={styles.card}>
          <MenuRow Icon={Grid3X3} label="Şablonları Yönet" sub="Tüm kategorileri ve şablonları görüntüle" onPress={() => navigation.navigate('TemplateManager')} />
          <View style={styles.rowSep} />
          <MenuRow Icon={Link2} label="Web'den Oturum Aç" sub="Web platformasında yönet" onPress={() => navigation.navigate('WebSignIn')} />
        </View>

        {/* Güvenlik */}
        <Text style={styles.section}>{T.security}</Text>
        <View style={styles.card}>
          {!isGuest && (
            <>
              <MenuRow Icon={LogOut} label={T.logout} danger onPress={handleLogout} />
              <View style={styles.rowSep} />
            </>
          )}
          <MenuRow Icon={Trash2} label={T.deleteAll} danger onPress={handleReset} />
        </View>

        {/* Hakkında */}
        <Text style={styles.section}>Hakkında</Text>
        <View style={styles.card}>
          <MenuRow Icon={Gift} label={T.referralProgram} onPress={() => navigation.navigate('ReferralProgram')} />
          <View style={styles.rowSep} />
          <MenuRow Icon={Globe} label={T.privacy} onPress={() => Linking.openURL('https://snippad.vertexforge.tech/privacy')} />
          <View style={styles.rowSep} />
          <MenuRow Icon={Globe} label={T.termsLinkLabel} onPress={() => Linking.openURL('https://snippad.vertexforge.tech/terms')} />
          <View style={styles.rowSep} />
          <MenuRow Icon={Gift} label="Arkadaşını Davet Et" onPress={() => Share.share({
            message: 'Snippad: IBAN, adres, şifre ve sık yazılan metinleri 1 tuşla yapıştır!\n\n3 günlük ücretsiz Business denemesi:\nhttps://snippad.vertexforge.tech',
            title: 'Snippad',
            url: 'https://snippad.vertexforge.tech',
          })} />
        </View>

        {__DEV__ && (() => {
          const DEV_PLANS = ['basic', 'basic_yearly', 'pro', 'pro_yearly', 'business', 'business_yearly'] as const;
          const currentIdx = DEV_PLANS.indexOf(userSettings.plan as typeof DEV_PLANS[number]);
          const nextPlan = DEV_PLANS[(currentIdx + 1) % DEV_PLANS.length];
          return (
            <>
              <Text style={styles.section}>{T.developer}</Text>
              <View style={styles.card}>
                <MenuRow
                  Icon={Zap}
                  label={`Plan: ${userSettings.plan.toUpperCase()}`}
                  sub={`→ ${nextPlan.toUpperCase()}`}
                  onPress={() => setDevPlan(nextPlan)}
                />
                <View style={styles.rowSep} />
                <MenuRow
                  Icon={Clock}
                  label="Expire Trial"
                  sub="Set plan to free, trial 3 days ago → paywall opens"
                  onPress={expireTrialNow}
                />
              </View>
            </>
          );
        })()}

        <Text style={styles.version}>{T.version}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  trialBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FF6B0015', borderRadius: 12, borderWidth: 1, borderColor: '#FF6B0040', padding: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  trialBannerUrgent: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FF6B00', borderRadius: 12, padding: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  trialBannerExpired: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#374151', borderRadius: 12, padding: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  trialBannerEmoji: { fontSize: 22 },
  trialBannerTitle: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 2 },
  trialBannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  scroll: {},
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: {
    width: 60, height: 60, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarGuest: { backgroundColor: Colors.cardLight, borderWidth: 1.5, borderColor: Colors.border },
  avatarText: { fontSize: 22, fontWeight: '700', color: Colors.white },
  avatarIcon: { fontSize: 26 },
  userName: { ...Typography.h3, color: Colors.textDark },
  userEmail: { ...Typography.caption, color: Colors.textGray, marginTop: 2 },
  editHint: { ...Typography.caption, color: Colors.primary, marginTop: 4 },
  loginHint: { ...Typography.caption, color: Colors.primary, marginTop: 4, fontWeight: '600' },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  premiumText: { ...Typography.label, color: Colors.primary, fontWeight: '700' },
  statsCard: {
    flexDirection: 'row', marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl,
    borderWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statDiv: { width: 0, backgroundColor: 'transparent' },
  statVal: { ...Typography.h3, color: Colors.textDark, fontWeight: '800' },
  statLabel: { ...Typography.caption, color: Colors.textGray },
  section: {
    ...Typography.label, color: Colors.textDark, letterSpacing: 1, fontWeight: '700',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, marginTop: Spacing.lg,
  },
  card: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.sm,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  menuRowDisabled: { opacity: 0.5 },
  rowSep: { height: 0, backgroundColor: 'transparent', marginLeft: 68 },
  menuIcon: {
    width: 34, height: 34, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#FEE2E2' },
  menuIconDisabled: { backgroundColor: Colors.background },
  menuLabel: { ...Typography.body, color: Colors.textDark, fontWeight: '600' },
  menuLabelDanger: { color: Colors.danger },
  menuLabelDisabled: { color: Colors.textLight },
  menuSub: { ...Typography.caption, color: Colors.textDark, fontWeight: '600', marginTop: 1 },
  menuSubDisabled: { color: Colors.textLight },
  badge: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 2, marginRight: Spacing.sm,
  },
  badgeText: { ...Typography.label, color: Colors.white, fontWeight: '700' },
  tipBox: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: '#FFF5F0', borderRadius: BorderRadius.md,
    borderWidth: 0, padding: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipText: { ...Typography.caption, color: Colors.primary, lineHeight: 18, fontWeight: '500' },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  themePreview: { width: 28, height: 28, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
  themeLabel: { ...Typography.body, color: Colors.textDark, fontWeight: '600' },
  themeSub: { ...Typography.caption, color: Colors.textDark, fontWeight: '600', marginTop: 1 },
  themeCheck: {
    width: 22, height: 22, borderRadius: BorderRadius.full,
    borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  themeCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  fontSizeCard: { flexDirection: 'row', overflow: 'hidden', marginHorizontal: Spacing.lg, marginVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  fontBtn: {
    flex: 1, paddingVertical: Spacing.md, alignItems: 'center', gap: 2,
    borderRightWidth: 1, borderRightColor: Colors.border,
  },
  fontBtnActive: { backgroundColor: Colors.primaryLight },
  fontBtnLabel: { ...Typography.body, color: Colors.textGray, fontWeight: '600' },
  fontBtnLabelActive: { color: Colors.primary },
  fontBtnDesc: { ...Typography.label, color: Colors.textLight },
  fontBtnDescActive: { color: Colors.primary },
  sectionRow2: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  proBadge: { ...Typography.label, color: Colors.primary, fontWeight: '700', backgroundColor: Colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  lockedCard: { opacity: 0.55 },
  version: { ...Typography.caption, color: Colors.textLight, textAlign: 'center', paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  sigModal: {
    backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: Spacing.lg, paddingBottom: 32,
  },
  sigModalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  sigModalTitle: { ...Typography.h2, color: Colors.textDark, marginBottom: Spacing.sm },
  sigModalDesc: { ...Typography.body, color: Colors.textGray, lineHeight: 20, marginBottom: Spacing.lg },
  sigModalInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm,
    ...Typography.body, color: Colors.textDark, backgroundColor: Colors.background,
    textAlignVertical: 'top', minHeight: 100,
  },
  sigModalBtn: {
    paddingVertical: Spacing.md, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  sigModalBtnTxt: { ...Typography.body, fontWeight: '700' },
});
