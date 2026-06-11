import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, Modal, Pressable, Linking, TextInput, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin, ExternalLink, Mail, Phone, PenLine, Clipboard,
  Mic, ArrowBigUp, Delete, Smile, CornerDownLeft, Keyboard, Search,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import ScreenHeader from '../components/ScreenHeader';
import SnippodLogo from '../components/SnippodLogo';
import { useT } from '../i18n';
import { useFocusEffect } from '@react-navigation/native';
import { triggerHapticForKey } from '../utils/hapticPatterns';
import { SHADOWS } from '../utils/shadowSystem';
import { KEY_PRESS_FEEDBACK, LONG_PRESS_BEHAVIOR, serializeKeyboardConfig } from '../config/keyboardConfig';
import { mmkvStorage } from '../store/storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';
type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'KeyboardPreview'> };
import type { Category } from '../types';
import { THEMES, cornerRadiusFor } from '../constants/themes';
import type { KTheme } from '../constants/themes';
export { THEMES };
export type { KTheme };

// ─────────────────────────────────────────────────────────────────────────────
// KATEGORİ SABİTLERİ
// ─────────────────────────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, string> = {
  text: '📝', iban: '₺', address: '⌖', password: '🔑',
  cargo: '📦', link: '🔗', email: '✉',
};
const CAT_COLORS = [Colors.primary, '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

function detectContentAction(content: string): 'phone' | 'url' | 'email' | null {
  const s = content.trim();
  if (/^[\d\s+\-().]{3,25}$/.test(s) && (s.match(/\d/g) ?? []).length >= 3) return 'phone';
  if (/^(https?:\/\/|www\.)/i.test(s)) return 'url';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'email';
  return null;
}
function ActionIcon({ type, color }: { type: string; color: string }) {
  if (type === 'address') return <MapPin size={14} color={color} />;
  if (type === 'link' || type === 'url') return <ExternalLink size={14} color={color} />;
  if (type === 'email') return <Mail size={14} color={color} />;
  if (type === 'phone') return <Phone size={14} color={color} />;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// KLAVYE DİZİLİMLERİ
// ─────────────────────────────────────────────────────────────────────────────
const TR_Q_R1 = ['q','w','e','r','t','y','u','ı','o','p','ğ','ü'];
const TR_Q_R2 = ['a','s','d','f','g','h','j','k','l','ş','i'];
const TR_Q_R3 = ['z','x','c','v','b','n','m','ö','ç'];

const TR_F_R1 = ['f','g','ğ','ı','o','d','r','n','h','p','q','w'];
const TR_F_R2 = ['u','i','e','a','ü','t','k','m','l','y','ş'];
const TR_F_R3 = ['j','ö','v','c','ç','z','s','b','x'];

const EN_R1 = ['q','w','e','r','t','y','u','i','o','p'];
const EN_R2 = ['a','s','d','f','g','h','j','k','l'];
const EN_R3 = ['z','x','c','v','b','n','m'];

const AR_R1 = ['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د'];
const AR_R2 = ['ش','س','ي','ب','ل','ا','ت','ن','م','ك'];
const AR_R3 = ['ئ','ء','ؤ','ر','ى','ة','و','ز'];

const NUM_R1 = ['1','2','3','4','5','6','7','8','9','0'];
const NUM_R2 = ['-','/',':', ';','(',')', '₺','&','@','"'];
const NUM_R3 = ['.',',','?','!','\''];

const SYM_R1 = ['[',']','{','}','#','%','^','*','+','='];
const SYM_R2 = ['_','\\','|','~','<','>','€','$','£','·'];
const SYM_R3 = ['.',',','?','!','\''];

const LP_TR: Record<string, string[]> = {
  g: ['ğ'], u: ['ü','û','ù','ú','ū'], s: ['ş'],
  ı: ['î','ì','í','ï'], i: ['ì','í','î','ï','ī','ı'],
  o: ['ö','ô','ò','ó','õ','ø'], c: ['ç'],
  a: ['â','à','á','ä','å','ã','æ'], e: ['ê','è','é','ë','ě'], n: ['ñ'],
  ğ: ['g','ĝ'], ü: ['u','ū','ù','ú','û'],
};
const LP_EN: Record<string, string[]> = {
  a: ['à','á','â','ä','å','ã','æ'], e: ['è','é','ê','ë','ě'],
  i: ['ì','í','î','ï','ī','į','ĩ','ı'], o: ['ò','ó','ô','ö','õ','ø'],
  u: ['ù','ú','û','ü','ū'], c: ['ç'], n: ['ñ'], s: ['ß'],
};
const LP_AR: Record<string, string[]> = {
  ا: ['أ','إ','آ','ٱ'], و: ['ؤ'], ي: ['ئ','ى'], ه: ['ة'],
  ل: ['لا','لأ','لإ','لآ'], ت: ['ط'], ز: ['ظ'],
};

// ─────────────────────────────────────────────────────────────────────────────
// METRİK HESAPLAMA
// ─────────────────────────────────────────────────────────────────────────────
interface LayoutMetrics {
  kbWidth: number;
  horizontalPad: number;
  keyGap: number;
  rowGap: number;
  letterKeyH: number;
  bottomBarH: number;
  keyRadius: number;
  tr_q: LangMetrics;
  tr_f: LangMetrics;
  en:   LangMetrics;
  ar:   LangMetrics;
  num:  NumMetrics;
  bottomBar: BottomBarMetrics;
}
interface LangMetrics {
  r1: number; r2: number; r3: number;
  shiftDel: number; r2Indent: number; row1Pad: number;
}
interface NumMetrics {
  r1: number; r2: number; r3: number;
  shiftDel: number; r2Indent: number; row1Pad: number;
}
interface BottomBarMetrics {
  num: number; emoji: number; dot: number; enter: number; space: number;
}

/**
 * TÜM GENIŞLIK DEĞERLERİNİ BURADA HESAPLA.
 *
 * FORMÜLLER:
 *   usable    = kbWidth - 2*hPad
 *   r1        = floor((usable - (nKeys-1)*gap) / nKeys)
 *   row1Slack = usable - (nKeys*r1 + (nKeys-1)*gap)   → 12 tuş için genellikle 2-4px
 *   row1Pad   = hPad + floor(row1Slack / 2)            → her yana eşit → ROW 1 ORTALI
 *
 *   r2Indent  = floor((usable - nKeys_r2*r1 - (nKeys_r2-1)*gap) / 2)
 *               → row2'nin sol/sağ'da fazla alanını eşit böler
 *
 *   shiftDel  = r2Indent + r1
 *               → shift sağ kenarı = row2'nin 1. tuşunun sağ kenarı
 *               → z tuşu sol kenarı = s tuşu sol kenarı  ← s-z hizası ✓
 *
 *   r3        = floor((kbWidth - 2*row1Pad - 2*shiftDel - (nLetters+1)*gap) / nLetters)
 *               NOT usable! paddingHorizontal operates on the full kbWidth container.
 */
function computeMetrics(kbWidth: number): LayoutMetrics {
  const hPad       = 4;
  const keyGap     = 6;
  const rowGap     = 8;
  const letterKeyH = 44;
  const bottomBarH = 48;
  const keyRadius  = kbWidth >= 410 ? 11 : 10;

  const usable = kbWidth - 2 * hPad;

  // Yardımcı: n tuş için eşit genişlik
  const kw = (n: number) => Math.floor((usable - (n - 1) * keyGap) / n);

  // ── TR Q & TR F ──────────────────────────────────────────
  // Row1: 12 tuş  Row2: 11 tuş  Row3: 9 harf
  const trq_r1      = kw(12);
  const trq_row1Slack = usable - (12 * trq_r1 + 11 * keyGap);
  const trq_row1Pad   = hPad + Math.floor(trq_row1Slack / 2); // row1 ortalama padding
  const trq_r2Indent  = Math.floor((kbWidth - 2 * trq_row1Pad - 11 * trq_r1 - 10 * keyGap) / 2);
  const trq_shiftDel  = trq_r2Indent + trq_r1;                // s-z hizası için
  const trq_r3        = Math.floor(
    (kbWidth - 2 * trq_row1Pad - 2 * trq_shiftDel - 10 * keyGap) / 9
  );

  // ── EN ───────────────────────────────────────────────────
  // Row1: 10 tuş  Row2: 9 tuş  Row3: 7 harf
  const en_r1       = kw(10);
  const en_row1Slack  = usable - (10 * en_r1 + 9 * keyGap);
  const en_row1Pad    = hPad + Math.floor(en_row1Slack / 2);
  const en_r2Indent   = Math.floor((kbWidth - 2 * en_row1Pad - 9 * en_r1 - 8 * keyGap) / 2);
  const en_shiftDel   = en_r2Indent + en_r1;
  const en_r3         = Math.floor(
    (kbWidth - 2 * en_row1Pad - 2 * en_shiftDel - 8 * keyGap) / 7
  );

  // ── AR ───────────────────────────────────────────────────
  // Row1: 12 tuş  Row2: 10 tuş  Row3: 8 harf  (RTL)
  const ar_r1       = kw(12);
  const ar_row1Slack  = usable - (12 * ar_r1 + 11 * keyGap);
  const ar_row1Pad    = hPad + Math.floor(ar_row1Slack / 2);
  const ar_r2Indent   = Math.floor((kbWidth - 2 * ar_row1Pad - 10 * ar_r1 - 9 * keyGap) / 2);
  const ar_shiftDel   = ar_r2Indent + ar_r1;
  const ar_r3         = Math.floor(
    (kbWidth - 2 * ar_row1Pad - 2 * ar_shiftDel - 9 * keyGap) / 8
  );

  // ── NUM / SYM ─────────────────────────────────────────────
  // Row1&2: 10 tuş  Row3: 5 char
  const num_r1      = kw(10);
  const num_row1Slack = usable - (10 * num_r1 + 9 * keyGap);
  const num_row1Pad   = hPad + Math.floor(num_row1Slack / 2);
  const num_r2Indent  = Math.floor((kbWidth - 2 * num_row1Pad - 10 * num_r1 - 9 * keyGap) / 2); // r1=r2 sayısı eşit
  const num_shiftDel  = num_r2Indent + num_r1;
  const num_r3        = Math.floor(
    (kbWidth - 2 * num_row1Pad - 2 * num_shiftDel - 6 * keyGap) / 5
  );

  // ── BOTTOM BAR ────────────────────────────────────────────
  const BB_NUM   = 44;
  const BB_EMOJI = 38;
  const BB_DOT   = 32;
  const BB_ENTER = 52;
  const BB_SPACE = usable - BB_NUM - BB_EMOJI - BB_DOT - BB_ENTER - 4 * keyGap;

  return {
    kbWidth,
    horizontalPad: hPad,
    keyGap, rowGap, letterKeyH, bottomBarH, keyRadius,
    tr_q: { r1: trq_r1, r2: trq_r1, r3: trq_r3, shiftDel: trq_shiftDel, r2Indent: trq_r2Indent, row1Pad: trq_row1Pad },
    tr_f: { r1: trq_r1, r2: trq_r1, r3: trq_r3, shiftDel: trq_shiftDel, r2Indent: trq_r2Indent, row1Pad: trq_row1Pad },
    en:   { r1: en_r1,  r2: en_r1,  r3: en_r3,  shiftDel: en_shiftDel,  r2Indent: en_r2Indent,  row1Pad: en_row1Pad  },
    ar:   { r1: ar_r1,  r2: ar_r1,  r3: ar_r3,  shiftDel: ar_shiftDel,  r2Indent: ar_r2Indent,  row1Pad: ar_row1Pad  },
    num:  { r1: num_r1, r2: num_r1, r3: num_r3, shiftDel: num_shiftDel, r2Indent: num_r2Indent,  row1Pad: num_row1Pad },
    bottomBar: { num: BB_NUM, emoji: BB_EMOJI, dot: BB_DOT, enter: BB_ENTER, space: BB_SPACE },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function KeyboardPreview({
  theme, fontSize, fontFamily, categories, isBusiness, isPro,
  language, layout, vowelHighlight, trialExpired, userSettings,
}: {
  theme: any; fontSize: number; fontFamily?: string; categories: Category[];
  isBusiness?: boolean; isPro?: boolean; language?: string; layout?: string;
  vowelHighlight?: boolean; trialExpired?: boolean; userSettings?: any;
}) {
  const T = useT();

  // ── State ──────────────────────────────────────────────────────────────
  const [containerW, setContainerW]           = useState(Math.min(Dimensions.get('window').width, 390));
  const [previewFontSize, setPreviewFontSize] = useState<'small'|'normal'|'large'|'xlarge'>('normal');
  const [previewFontFamily, setPreviewFontFamily] = useState<'system'|'mono'|'bold'|'rounded'>('system');
  const [previewKbLanguage, setPreviewKbLanguage] = useState<'tr'|'en'|'ar'>('tr');
  const [previewKbLayout, setPreviewKbLayout] = useState<'q'|'f'>('q');
  const [kbMode, setKbMode]                   = useState<'alpha'|'num'|'sym'>('alpha');
  const [showEmojiMode, setShowEmojiMode]     = useState(false);
  const [isShiftActive, setIsShiftActive]     = useState(false);
  const [isCapsLock, setIsCapsLock]           = useState(false);
  const [typedText, setTypedText]             = useState('');
  const [selectedCat, setSelectedCat]         = useState(-1);
  const [libOpen, setLibOpen]                 = useState(false);
  const [libTabIdx, setLibTabIdx]             = useState(0);
  const [popup, setPopup]                     = useState<{
    key: string; variants: string[]; selectedIdx: number;
    keyX: number; keyY: number; keyW: number;
  } | null>(null);
  const [templateSearch, setTemplateSearch]   = useState('');
  const [showTemplateSearch, setShowTemplateSearch] = useState(false);
  const [showSignatures, setShowSignatures]   = useState(false);
  const [savedSignatures]                     = useState<{ id: string; data: string; date: string }[]>([]);
  const [activeEmojiCat, setActiveEmojiCat]   = useState('smileys');
  const [emojiSearch, setEmojiSearch]         = useState('');

  const deleteIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastShiftTapRef   = useRef(0);
  const keyAnimRefs = useRef(new Map<string, { scale: Animated.Value; opacity: Animated.Value }>()).current;

  // ── Metrikler ──────────────────────────────────────────────────────────
  // useMemo → containerW değişince yeniden hesapla, her render'da değil
  const M = useMemo(() => computeMetrics(containerW), [containerW]);

  // ── MMKV sync ──────────────────────────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      try { mmkvStorage.setKeyboardLayoutConfig(serializeKeyboardConfig()); } catch {}
    }, [])
  );

  // ── Flags ──────────────────────────────────────────────────────────────
  const isTR     = previewKbLanguage === 'tr';
  const isAR     = previewKbLanguage === 'ar';
  const isAlpha  = kbMode === 'alpha';
  const upper    = isAlpha && (isShiftActive || isCapsLock);

  // ── Satır dizileri ─────────────────────────────────────────────────────
  const R1 = !isAlpha ? (kbMode === 'sym' ? SYM_R1 : NUM_R1)
    : isAR ? AR_R1
    : isTR ? (previewKbLayout === 'f' ? TR_F_R1 : TR_Q_R1)
    : EN_R1;

  const R2 = !isAlpha ? (kbMode === 'sym' ? SYM_R2 : NUM_R2)
    : isAR ? AR_R2
    : isTR ? (previewKbLayout === 'f' ? TR_F_R2 : TR_Q_R2)
    : EN_R2;

  const R3 = !isAlpha ? (kbMode === 'sym' ? SYM_R3 : NUM_R3)
    : isAR ? AR_R3
    : isTR ? (previewKbLayout === 'f' ? TR_F_R3 : TR_Q_R3)
    : EN_R3;

  const LP = isAR ? LP_AR : isTR ? LP_TR : LP_EN;

  // ── Dile göre metrik seç ───────────────────────────────────────────────
  const LM: LangMetrics = !isAlpha ? { r1: M.num.r1, r2: M.num.r2, r3: M.num.r3, shiftDel: M.num.shiftDel, r2Indent: 0, row1Pad: M.horizontalPad }
    : isAR ? M.ar
    : isTR ? (previewKbLayout === 'f' ? M.tr_f : M.tr_q)
    : M.en;

  // ── Font ──────────────────────────────────────────────────────────────
  const fontSizeMap = { small: 12, normal: 15, large: 18, xlarge: 22 };
  const fSz = fontSizeMap[previewFontSize];
  const ff  = ({ system: undefined, mono: 'monospace', bold: undefined, rounded: undefined } as any)[previewFontFamily];
  const fw  = previewFontFamily === 'bold' ? '700' : '600';
  const keyR = M.keyRadius;
  const iSz  = Math.round(fSz * 1.3);

  // ── Animasyon ──────────────────────────────────────────────────────────
  const getAnim = (key: string) => {
    if (!keyAnimRefs.has(key))
      keyAnimRefs.set(key, { scale: new Animated.Value(1), opacity: new Animated.Value(1) });
    return keyAnimRefs.get(key)!;
  };
  const triggerAnim = (key: string) => {
    const a = getAnim(key);
    a.scale.setValue(KEY_PRESS_FEEDBACK.scaleOnPress);
    a.opacity.setValue(KEY_PRESS_FEEDBACK.opacityOnPress);
    setTimeout(() => { a.scale.setValue(1); a.opacity.setValue(1); }, KEY_PRESS_FEEDBACK.pressDuration);
  };

  // ── Stiller ────────────────────────────────────────────────────────────
  const keyStyle = (special = false, accent = false, h = M.letterKeyH) => ({
    backgroundColor: accent ? theme.accentBg : special ? theme.specBg : theme.keyBg,
    borderRadius: keyR,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: h,
    borderWidth: accent ? 0 : 1,
    borderColor: 'rgba(255,255,255,0.07)',
    ...(accent ? SHADOWS.keyAccent : special ? SHADOWS.keySpecial : SHADOWS.keyDefault),
  });
  const keyTxt = (special = false, accent = false) => ({
    color: accent ? (theme.accentTxt ?? '#fff') : special ? theme.specTxt : theme.keyTxt,
    fontSize: fSz,
    fontWeight: fw as any,
    ...(ff ? { fontFamily: ff } : {}),
  });

  // ── Tuş basma ──────────────────────────────────────────────────────────
  const handleKeyPress = (key: string) => {
    triggerAnim(key);
    let hapticType: Parameters<typeof triggerHapticForKey>[0] = 'letter';

    if (key === 'SPACE') {
      setTypedText(p => p + ' '); hapticType = 'space';
    } else if (key === 'DEL' || key === 'BACKSPACE') {
      setTypedText(p => p.slice(0, -1)); hapticType = 'delete';
    } else if (key === 'ENTER' || key === 'ACTION') {
      setTypedText(p => p + '\n'); hapticType = 'enter';
    } else if (key === 'SHIFT') {
      const now = Date.now();
      if (now - lastShiftTapRef.current < 300) { setIsCapsLock(p => !p); setIsShiftActive(false); }
      else { setIsShiftActive(p => !p); setIsCapsLock(false); }
      lastShiftTapRef.current = now; hapticType = 'toggle';
    } else if (key === '123' || key === 'NUM') {
      setKbMode('num'); setShowEmojiMode(false); hapticType = 'toggle';
    } else if (key === 'ABC') {
      setKbMode('alpha'); hapticType = 'toggle';
    } else if (key === '#+=') {
      setKbMode('sym'); hapticType = 'toggle';
    } else if (key === '123_SYM') {
      setKbMode('num'); hapticType = 'toggle';
    } else if (key === 'EMOJI') {
      setShowEmojiMode(p => !p); setKbMode('alpha'); hapticType = 'toggle';
    } else if (key === 'LANG') {
      setPreviewKbLanguage(p => p === 'tr' ? 'en' : p === 'en' ? 'ar' : 'tr'); hapticType = 'toggle';
    } else if (key.length >= 1) {
      let char = key;
      if (isAlpha && !isAR) {
        char = upper ? key.toUpperCase() : key;
        if (isShiftActive && !isCapsLock) setIsShiftActive(false);
      }
      setTypedText(p => p + char);
      hapticType = !isAlpha ? 'number' : 'letter';
    }
    triggerHapticForKey(hapticType);
  };

  // ── Delete uzun basma ──────────────────────────────────────────────────
  const startDeleteRepeat = () => {
    triggerHapticForKey('delete');
    setTypedText(p => p.slice(0, -1));
    deleteIntervalRef.current = setInterval(() => setTypedText(p => {
      if (p.length === 0) { clearInterval(deleteIntervalRef.current!); return p; }
      triggerHapticForKey('delete');
      return p.slice(0, -1);
    }), 50);
  };
  const stopDeleteRepeat = () => {
    if (deleteIntervalRef.current) { clearInterval(deleteIntervalRef.current); deleteIntervalRef.current = null; }
  };

  // ── Copy to Clipboard ──────────────────────────────────────────────────
  const handleCopyToClipboard = async () => {
    try {
      // Web API — navigator.clipboard kullan
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(typedText);
        // Başarı — haptic + görsel feedback
        triggerHapticForKey('insert');
        alert('Kopyalandı!');
      } else {
        // Fallback — eski tarayıcılar için TextArea tekniği
        const textarea = document.createElement('textarea');
        textarea.value = typedText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          triggerHapticForKey('insert');
          alert('Kopyalandı!');
        } catch (err) {
          alert('Kopyalama başarısız oldu');
        }
        document.body.removeChild(textarea);
      }
    } catch (err) {
      // Permission denied veya başka hata
      alert('Kopyalama başarısız oldu. Tarayıcı izni kontrol edin.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // HARF TUŞU
  // ─────────────────────────────────────────────────────────────────────
  const renderLetterKey = (k: string, w: number) => {
    const variants = (LP as any)[k];
    const label    = (isAlpha && !isAR && upper) ? k.toUpperCase() : k;
    const a        = getAnim(k);
    return (
      <Animated.View key={k} style={{ transform: [{ scale: a.scale }], opacity: a.opacity }}>
        <Pressable
          style={[keyStyle(false, false, M.letterKeyH), { width: w }]}
          onPress={() => handleKeyPress(k)}
          onLongPress={variants ? (e: any) => {
            const { pageX, pageY } = e.nativeEvent;
            setPopup({ key: k, variants, selectedIdx: 0, keyX: pageX, keyY: pageY, keyW: w });
          } : undefined}
          delayLongPress={300}
          pressRetentionOffset={{ top: 8, bottom: 8, left: 4, right: 4 }}
          hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}>
          <Text style={keyTxt()}>{label}</Text>
          {variants && (
            <View style={{
              position: 'absolute', bottom: 2, right: 3,
              width: 4, height: 4, borderRadius: 2,
              backgroundColor: theme.accentBg, opacity: 0.8,
            }} />
          )}
        </Pressable>
      </Animated.View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // SATIR 1
  // row1Pad = hPad + floor(row1Slack/2) → her iki yana eşit → ORTALI
  // justifyContent YOK — sadece gap ve paddingHorizontal
  // ─────────────────────────────────────────────────────────────────────
  const renderRow1 = () => {
    const isRTL  = isAR && isAlpha;
    const kw     = !isAlpha ? M.num.r1 : LM.r1;
    const rowPad = !isAlpha ? M.num.row1Pad : LM.row1Pad;
    return (
      <View style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        paddingHorizontal: rowPad,
        marginBottom: M.rowGap,
        gap: M.keyGap,
      }}>
        {R1.map(k => renderLetterKey(k, kw))}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // SATIR 2
  // paddingLeft  = row1Pad + r2Indent  (LTR)
  // paddingRight = row1Pad + r2Indent  (RTL)
  // r2Indent = (usable - nKeys*r1 - (nKeys-1)*gap) / 2
  // ─────────────────────────────────────────────────────────────────────
  const renderRow2 = () => {
    const isRTL   = isAR && isAlpha;
    const kw      = !isAlpha ? M.num.r2 : LM.r2;
    const rowPad  = !isAlpha ? M.num.row1Pad : LM.row1Pad;
    const indent  = isAlpha ? LM.r2Indent : 0;
    const totalPad = rowPad + indent;
    return (
      <View style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        paddingLeft:  totalPad,
        paddingRight: totalPad,
        marginBottom: M.rowGap,
        gap: M.keyGap,
      }}>
        {R2.map(k => renderLetterKey(k, kw))}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // SATIR 3  ← ANA DÜZELTİLEN SATIR
  //
  // SORUN: Harf tuşları `flex:1` bir View içindeydi.
  //   <View flex:1>  ← bu kalan alanı alıyor, içinde tuşlar ayrılıyor
  //     {R3.map(k => letterKey(k, lw))}
  //   </View>
  //
  // ÇÖZÜM: flex:1 View kaldırıldı. Tuşlar doğrudan row'a eklendi.
  //   Shift + [letterKeys] + Del hepsi aynı row'da, sadece gap ile ayrılıyor.
  //
  // shiftDel = r1 + keyGap  → shift sağ kenarı q'nun sağ kenarıyla hizalı
  // r3 = (usable - 2*shiftDel - (nLetters+1)*gap) / nLetters
  // ─────────────────────────────────────────────────────────────────────
  const renderRow3 = () => {
    const isRTL    = isAR && isAlpha;
    const shiftAnim = getAnim('SHIFT');
    const delAnim   = getAnim('DEL');

    // ── Sayı/sembol modu ──────────────────────────────────────────────
    if (!isAlpha) {
      const leftKey   = kbMode === 'sym' ? '123_SYM' : '#+=';
      const leftLabel = kbMode === 'sym' ? '123' : '#+=';
      return (
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: M.num.row1Pad,
          marginBottom: M.rowGap,
          gap: M.keyGap,
          alignItems: 'center',
        }}>
          {/* Sol özel tuş */}
          <Animated.View style={{ transform: [{ scale: delAnim.scale }], opacity: delAnim.opacity }}>
            <Pressable
              onPress={() => handleKeyPress(leftKey)}
              style={[keyStyle(true, false, M.letterKeyH), { width: M.num.shiftDel }]}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: theme.specTxt }}>{leftLabel}</Text>
            </Pressable>
          </Animated.View>

          {/* Harf/sembol tuşları — DOĞRUDAN row'da, flex:1 View YOK */}
          {R3.map(k => renderLetterKey(k, M.num.r3))}

          {/* DEL */}
          <Animated.View style={{ transform: [{ scale: delAnim.scale }], opacity: delAnim.opacity }}>
            <Pressable
              onPress={() => handleKeyPress('DEL')}
              onLongPress={startDeleteRepeat}
              onPressOut={stopDeleteRepeat}
              delayLongPress={300}
              style={[keyStyle(true, false, M.letterKeyH), { width: M.num.shiftDel }]}>
              <Delete size={iSz} color={theme.specTxt} strokeWidth={2} />
            </Pressable>
          </Animated.View>
        </View>
      );
    }

    // ── Alpha modu ────────────────────────────────────────────────────
    const sd     = LM.shiftDel;   // = r2Indent + r1  → s-z hizası sağlanır
    const lw     = LM.r3;
    const rowPad = LM.row1Pad;    // row1 ile aynı kenar padding

    return (
      <View style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        paddingHorizontal: rowPad,
        marginBottom: M.rowGap,
        gap: M.keyGap,
        alignItems: 'center',
      }}>
        {/* SHIFT */}
        <Animated.View style={{ transform: [{ scale: shiftAnim.scale }], opacity: shiftAnim.opacity }}>
          <Pressable
            onPress={() => handleKeyPress('SHIFT')}
            style={[
              keyStyle(true, false, M.letterKeyH),
              { width: sd, backgroundColor: upper ? theme.accentBg : theme.specBg },
            ]}>
            <ArrowBigUp
              size={iSz}
              color={upper ? (theme.accentTxt ?? '#fff') : theme.specTxt}
              strokeWidth={isCapsLock ? 3 : 2}
            />
          </Pressable>
        </Animated.View>

        {/* HARF TUŞLARI — flex:1 View OLMADAN, doğrudan row'da */}
        {R3.map(k => renderLetterKey(k, lw))}

        {/* DEL */}
        <Animated.View style={{ transform: [{ scale: delAnim.scale }], opacity: delAnim.opacity }}>
          <Pressable
            onPress={() => handleKeyPress('DEL')}
            onLongPress={startDeleteRepeat}
            onPressOut={stopDeleteRepeat}
            delayLongPress={300}
            style={[keyStyle(true, false, M.letterKeyH), { width: sd }]}>
            <Delete size={iSz} color={theme.specTxt} strokeWidth={2} />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // ALT SATIR (Bottom Bar)
  // space tuşu: sabit genişlik (flex değil!)
  // BB.space = usable - BB_NUM - BB_EMOJI - BB_DOT - BB_ENTER - 4*gap
  // Emoji açıkken space genişler: space + BB_EMOJI + gap
  // ─────────────────────────────────────────────────────────────────────
  const renderBottomBar = (userSettings: any) => {
    const numAnim   = getAnim('NUM');
    const emojiAnim = getAnim('EMOJI');
    const enterAnim = getAnim('ENTER');
    const isNum     = !isAlpha;
    const dotKey    = isAR ? '،' : '.';
    const BB        = M.bottomBar;

    // Emoji açıkken emoji butonu gizlenir, space genişler
    const spaceW = showEmojiMode
      ? BB.space + BB.emoji + M.keyGap
      : BB.space;

    const renderSpaceKey = () => (
      <Animated.View style={{
        width: spaceW,
        transform: [{ scale: getAnim('SPACE').scale }],
        opacity: getAnim('SPACE').opacity,
      }}>
        <Pressable
          onPress={() => handleKeyPress('SPACE')}
          style={[keyStyle(false, false, M.bottomBarH), { width: spaceW }]}>
          <Text style={{ fontSize: 10, color: userSettings.show_filigran ? theme.accentBg : theme.keyTxt + '70', fontWeight: '500', textAlign: 'center' }}>
            {userSettings.show_filigran ? 'Snippad' : isAR ? 'مسافة' : 'boşluk'}
          </Text>
        </Pressable>
      </Animated.View>
    );

    return (
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: LM.row1Pad,
        alignItems: 'center',
        gap: M.keyGap,
        height: M.bottomBarH,
      }}>

        {/* 123 / ABC */}
        <Animated.View style={{ transform: [{ scale: numAnim.scale }], opacity: numAnim.opacity }}>
          <Pressable
            onPress={() => {
              if (showEmojiMode) { setShowEmojiMode(false); triggerHapticForKey('dock'); }
              else handleKeyPress(isNum ? 'ABC' : 'NUM');
            }}
            style={[(userSettings?.show_filigran ?? true) && !isNum ? { backgroundColor: theme.accentBg, borderRadius: keyR, alignItems: 'center', justifyContent: 'center', height: M.bottomBarH, borderWidth: 0, ...SHADOWS.keyAccent } : keyStyle(true, false, M.bottomBarH), { width: BB.num }]}>
            {showEmojiMode
              ? <Keyboard size={fSz + 2} color={theme.specTxt} strokeWidth={1.8} />
              : isNum ? <Text style={{ fontSize: 11, fontWeight: '600', color: theme.specTxt }}>ABC</Text>
              : (userSettings?.show_filigran ?? true) ? <SnippodLogo size={24} color="#fff" bgColor={theme.accentBg} />
              : <Text style={{ fontSize: 11, fontWeight: '600', color: theme.specTxt }}>123</Text>
            }
          </Pressable>
        </Animated.View>

        {/* Emoji — sadece emoji modu kapalıyken görünür */}
        {!showEmojiMode && (
          <Animated.View style={{ transform: [{ scale: emojiAnim.scale }], opacity: emojiAnim.opacity }}>
            <Pressable
              onPress={() => { triggerAnim('EMOJI'); triggerHapticForKey('dock'); setShowEmojiMode(true); }}
              style={[keyStyle(true, false, M.bottomBarH), { width: BB.emoji }]}>
              <Smile size={fSz + 2} color={theme.specTxt} strokeWidth={1.8} />
            </Pressable>
          </Animated.View>
        )}

        {/* SPACE — sabit genişlik, flex yok */}
        {renderSpaceKey()}

        {/* Nokta */}
        <Animated.View style={{
          transform: [{ scale: getAnim(dotKey).scale }],
          opacity: getAnim(dotKey).opacity,
        }}>
          <Pressable
            onPress={() => handleKeyPress(dotKey)}
            style={[keyStyle(false, false, M.bottomBarH), { width: BB.dot }]}>
            <Text style={{ fontSize: 16, color: theme.keyTxt, fontWeight: '500' }}>{dotKey}</Text>
          </Pressable>
        </Animated.View>

        {/* Enter */}
        <Animated.View style={{ transform: [{ scale: enterAnim.scale }], opacity: enterAnim.opacity }}>
          <Pressable
            onPress={() => handleKeyPress('ENTER')}
            style={[keyStyle(false, true, M.bottomBarH), { width: BB.enter }]}>
            <CornerDownLeft size={iSz + 2} color={theme.accentTxt ?? '#fff'} strokeWidth={2} />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // EMOJİ GRİD
  // ─────────────────────────────────────────────────────────────────────
  const EMOJI_CATS = {
    smileys:  { label: '😊 Yüzler',  emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😋','😛','😜','🤪','😌','😔','😑','😐','😏','🥱','😞','😖','😢','😭','😤','😠','🤬','😈','👿','💀','🤡','👻','🤖'] },
    gestures: { label: '🤝 Jestler', emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝'] },
    hearts:   { label: '❤️ Kalpler', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','💕','💞','💓','💗','💖','💘','💝','💟'] },
    nature:   { label: '🌿 Doğa',    emojis: ['🌱','🌿','🍀','🌾','🌵','🌴','🌳','🌲','🌶','🌷','🌹','🥀','🌺','🌻','🌼','🌸','💐','🌎','🌍','🌏'] },
    food:     { label: '🍎 Yemek',   emojis: ['🍎','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍑','🥭','🍍','🥥','🥑','🍅','🍆','🥦','🥬','🌽'] },
    activity: { label: '⚽ Spor',    emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎳','🏓','🏸','🥊','🥋','🎣','🏄','🤽','🧗','🚵','🏋️','🤸'] },
    symbols:  { label: '✨ Sembol',   emojis: ['✨','⭐','💫','💥','🔥','💯','⚠️','🚫','⛔','🔞','☢️','☣️','⚡','✅','❌','❓','❕','🔴','🟡','🟢'] },
  };

  // ─────────────────────────────────────────────────────────────────────
  // TEMPLATE PANELİ
  // ─────────────────────────────────────────────────────────────────────
  const displayCats = categories.length > 0 ? categories : [
    { id: 'd1', name: 'IBAN',  type: 'iban'    as const, icon: 'bank',    color: Colors.primary, is_system: false,
      templates: [{ id: 't1', title: 'Garanti', content: 'TR73 0006 2000 1120 0006 2000 10' }, { id: 't2', title: 'İş Bankası', content: 'TR12 0001 2345 6789 0123 4567 89' }] },
    { id: 'd2', name: 'Adres', type: 'address' as const, icon: 'map-pin', color: '#3B82F6',      is_system: false,
      templates: [{ id: 't3', title: 'Ev', content: 'Atatürk Cad. No:15 İstanbul' }] },
    { id: 'd3', name: 'Link',  type: 'link'    as const, icon: 'link',    color: '#8B5CF6',      is_system: false,
      templates: [{ id: 't4', title: 'Web Sitem', content: 'https://example.com' }] },
  ];
  const sysCats      = displayCats.filter(c => c.is_system);
  const userCats     = displayCats.filter(c => !c.is_system);
  const safeLibIdx   = Math.min(libTabIdx, Math.max(0, sysCats.length - 1));
  const activeLibCat = libOpen && sysCats.length > 0 ? sysCats[safeLibIdx] : null;
  const activeCat    = !libOpen && selectedCat >= 0 ? userCats[selectedCat] : null;
  const catColor     = (i: number) => userCats[i]?.color ?? CAT_COLORS[i % CAT_COLORS.length];

  const openLink = (content: string, type: string) => {
    const s = content.trim(); let url = '';
    if (type === 'phone')    url = `tel:${s.replace(/[^\d+]/g, '')}`;
    else if (type === 'url') url = s.startsWith('http') ? s : `https://${s}`;
    else if (type === 'email')   url = `mailto:${s}`;
    else if (type === 'address') url = `https://maps.google.com/?q=${encodeURIComponent(s)}`;
    if (url) Linking.openURL(url).catch(() => {});
  };

  const renderTpl = (t: any, i: number, cc: string, actionType: string | null) => (
    <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: theme.tplItemBg, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: theme.specBg }}>
      <View style={{ width: 3, alignSelf: 'stretch', backgroundColor: cc + '80', marginRight: 10, borderRadius: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.tplTxt }}>{t.title}</Text>
        <Text style={{ fontSize: 11, color: theme.tplSub }} numberOfLines={1}>{t.content}</Text>
      </View>
      {actionType && (
        <Pressable onPress={() => openLink(t.content, actionType)}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          style={({ pressed }) => ({ width: 30, height: 30, borderRadius: 8, backgroundColor: pressed ? cc+'44' : cc+'22', alignItems: 'center', justifyContent: 'center', marginRight: 6 })}>
          <ActionIcon type={actionType} color={cc} />
        </Pressable>
      )}
      <Pressable onPress={() => { setTypedText(p => p + t.content.trim()); triggerHapticForKey('insert'); }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ color: theme.specTxt, fontSize: 16, marginRight: 12 }}>↩</Text>
      </Pressable>
    </View>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <>
    <View
      style={{ backgroundColor: theme.kbBg, overflow: 'hidden', width: '100%' }}
      onLayout={e => setContainerW(Math.floor(e.nativeEvent.layout.width))}>

      {/* Yazı alanı — COPY BUTTON EKLENDİ */}
      <View style={{ backgroundColor: theme.specBg, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.divider, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, color: theme.keyTxt, minHeight: 24, flex: 1 }}>
          {typedText || <Text style={{ color: theme.specTxt }}>Yazı burada görünecek...</Text>}
        </Text>
        {typedText && (
          <Pressable
            onPress={() => handleCopyToClipboard()}
            style={({ pressed }) => ({
              paddingHorizontal: 12, paddingVertical: 8,
              backgroundColor: theme.accentBg, borderRadius: 6,
              opacity: pressed ? 0.8 : 1,
              marginLeft: 12
            })}>
            <Text style={{ color: theme.accentTxt ?? '#fff', fontSize: 12, fontWeight: '600' }}>Kopyala</Text>
          </Pressable>
        )}
      </View>

      {/* Dock */}
      <View style={{ backgroundColor: theme.dockBg, flexDirection: 'row', alignItems: 'center', height: 48, borderBottomWidth: 1, borderBottomColor: theme.specBg + '60' }}>
        {trialExpired ? (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 }}>
            <Text style={{ fontSize: 13 }}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.keyTxt }}>{T.kbTrialFullPower}</Text>
              <Text style={{ fontSize: 10, color: theme.specTxt, marginTop: 1 }}>{T.kbTrialSubtitle}</Text>
            </View>
            <View style={{ backgroundColor: theme.accentBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.accentTxt ?? '#fff' }}>{T.kbPremiumCta}</Text>
            </View>
          </View>
        ) : (<>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingRight: 6, gap: 5, height: 48 }}>
            {sysCats.length > 0 && (
              <Pressable key="lib" onPressIn={() => { setLibOpen(o => !o); setSelectedCat(-1); }}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: libOpen ? theme.accentBg : theme.specBg, borderRadius: 8, paddingHorizontal: 9, height: 30, borderWidth: 1, borderColor: libOpen ? 'transparent' : 'rgba(255,255,255,0.35)', opacity: pressed ? 0.85 : 1 })}>
                <Text style={{ fontSize: 11, lineHeight: 14 }}>📚</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: libOpen ? '#fff' : theme.keyTxt }}>Hazır</Text>
              </Pressable>
            )}
            {userCats.map((cat, i) => {
              const cc = catColor(i); const active = !libOpen && selectedCat === i;
              return (
                <Pressable key={cat.id} onPressIn={() => { setLibOpen(false); setSelectedCat(active ? -1 : i); }}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  pressRetentionOffset={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: active ? theme.accentBg : theme.specBg, borderRadius: 8, paddingHorizontal: 9, height: 30, borderWidth: 1, borderColor: active ? 'transparent' : 'rgba(255,255,255,0.35)', opacity: pressed ? 0.85 : 1 })}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cc }} />
                  {CAT_ICONS[cat.type] && <Text style={{ fontSize: 10, lineHeight: 14 }}>{CAT_ICONS[cat.type]}</Text>}
                  <Text style={{ fontSize: 11, fontWeight: '600', color: theme.keyTxt }}>{cat.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ width: 1, height: 20, backgroundColor: theme.specBg, marginHorizontal: 6 }} />
          <Pressable onPress={() => triggerHapticForKey('dock')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.specBg, alignItems: 'center', justifyContent: 'center', marginRight: 4, ...SHADOWS.dockButton }}>
            <Mic size={14} color={theme.specTxt} />
          </Pressable>
          <Pressable onPress={() => { setTypedText(p => p + '[Pano]'); triggerHapticForKey('insert'); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.specBg, alignItems: 'center', justifyContent: 'center', marginRight: 4, ...SHADOWS.dockButton }}>
            <Clipboard size={14} color={theme.specTxt} />
          </Pressable>
          <Pressable onPress={() => { setShowSignatures(p => !p); triggerHapticForKey('dock'); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={({ pressed }) => [{ width: 32, height: 32, borderRadius: 8, backgroundColor: showSignatures ? theme.accentBg : theme.specBg, alignItems: 'center', justifyContent: 'center', marginRight: 4, ...SHADOWS.dockButton, opacity: pressed ? 0.8 : 1 }]}>
            <PenLine size={14} color={showSignatures ? theme.accentTxt : theme.specTxt} />
          </Pressable>
          <Pressable onPress={() => triggerHapticForKey('dock')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.specBg, alignItems: 'center', justifyContent: 'center', marginRight: 8, ...SHADOWS.dockButton }}>
            <ExternalLink size={14} color={theme.specTxt} />
          </Pressable>
        </>)}
      </View>

      {/* Template paneli — lib */}
      {activeLibCat && !trialExpired && (
        <View style={{ backgroundColor: theme.tplBg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.specBg }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}
              contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, gap: 4 }}>
              {sysCats.map((sc, i) => {
                const sc_color = sc.color ?? '#888'; const isActive = i === safeLibIdx;
                return (
                  <Pressable key={sc.id} onPressIn={() => setLibTabIdx(i)}
                    style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: isActive ? sc_color+'28' : 'transparent' }}>
                    <Text style={{ fontSize: 11, fontWeight: isActive ? '700' : '500', color: isActive ? sc_color : theme.specTxt }}>{sc.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => { setLibOpen(false); setLibTabIdx(0); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ color: theme.specTxt, fontSize: 16, paddingHorizontal: 12 }}>✕</Text>
            </Pressable>
          </View>
          {activeLibCat.templates.map((t: any, i: number) => {
            const cc = activeLibCat.color ?? theme.accentBg;
            const ca = detectContentAction(t.content);
            return renderTpl(t, i, cc, (activeLibCat.type === 'address' ? 'address' : null) ?? ca);
          })}
        </View>
      )}

      {/* Template paneli — kategori */}
      {activeCat && !trialExpired && (
        <View style={{ backgroundColor: theme.tplBg }}>
          {!showTemplateSearch && (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.specBg }}>
              <View style={{ width: 3, height: 18, borderRadius: 1.5, backgroundColor: catColor(selectedCat), marginRight: 8 }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: catColor(selectedCat), flex: 1 }}>
                {activeCat.name}
                <Text style={{ fontWeight: '400', color: theme.tplSub }}>  {T.cardTemplateCount(activeCat.templates.length)}</Text>
              </Text>
              <Pressable onPress={() => setShowTemplateSearch(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Search size={16} color={theme.specTxt} strokeWidth={2} style={{ marginRight: 8 }} />
              </Pressable>
              <Pressable onPress={() => setSelectedCat(-1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ color: theme.specTxt, fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
              </Pressable>
            </View>
          )}
          {showTemplateSearch && (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.specBg, gap: 8 }}>
              <Search size={16} color={theme.specTxt} strokeWidth={2} />
              <TextInput placeholder="Şablon ara..." placeholderTextColor={theme.specTxt+'70'} value={templateSearch} onChangeText={setTemplateSearch} autoFocus style={{ flex: 1, color: theme.keyTxt, fontSize: 13, paddingVertical: 6 }} />
              <Pressable onPress={() => { setShowTemplateSearch(false); setTemplateSearch(''); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ color: theme.specTxt, fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>
          )}
          {!showSignatures
            ? activeCat.templates.filter((t: any) => {
                if (!templateSearch.trim()) return true;
                const norm = (s: string) => s.toLowerCase().replace(/[ıİşŞğĞüÜöÖçÇ]/g, c => ({'ı':'i','İ':'i','ş':'s','Ş':'s','ğ':'g','Ğ':'g','ü':'u','Ü':'u','ö':'o','Ö':'o','ç':'c','Ç':'c'}[c] ?? c));
                return norm(t.title).includes(norm(templateSearch));
              }).map((t: any, i: number) => {
                const cc = catColor(selectedCat);
                const ca = detectContentAction(t.content);
                return renderTpl(t, i, cc, (activeCat.type === 'address' ? 'address' : null) ?? ca);
              })
            : (
              <View style={{ paddingVertical: 12, paddingHorizontal: 12 }}>
                {savedSignatures.length === 0
                  ? <Text style={{ fontSize: 12, color: theme.tplSub, textAlign: 'center', paddingVertical: 16 }}>Henüz kaydedilmiş imza yok.</Text>
                  : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {savedSignatures.map(sig => (
                        <Pressable key={sig.id} onPress={() => { setTypedText(p => p + `[İmza: ${sig.date}]`); triggerHapticForKey('insert'); }}
                          style={({ pressed }) => [{ width: 80, height: 80, borderRadius: 8, backgroundColor: pressed ? theme.accentBg+'22' : theme.keyBg, borderWidth: 1, borderColor: theme.specBg, alignItems: 'center', justifyContent: 'center', padding: 4 }]}>
                          <Text style={{ fontSize: 10, color: theme.tplSub, textAlign: 'center' }}>{sig.date}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}
              </View>
            )
          }
        </View>
      )}

      {/* Klavye gövdesi */}
      {!showEmojiMode && (
        <View style={{ paddingTop: 8, paddingBottom: 4 }}>
          {renderRow1()}
          {renderRow2()}
          {renderRow3()}
        </View>
      )}

      {/* Emoji grid */}
      {showEmojiMode && (
        <View style={{ maxHeight: 300, backgroundColor: theme.kbBg, paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.keyBg, borderRadius: 8, marginHorizontal: 8, marginBottom: 10, paddingHorizontal: 10, height: 38 }}>
            <Search size={16} color={theme.specTxt} strokeWidth={2} style={{ marginRight: 8 }} />
            <TextInput placeholder="Emoji ara..." placeholderTextColor={theme.specTxt+'70'} value={emojiSearch} onChangeText={setEmojiSearch} style={{ flex: 1, color: theme.keyTxt, fontSize: 13, paddingVertical: 8 }} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 8, marginBottom: 8 }}>
            {Object.entries(EMOJI_CATS).map(([key, cat]) => (
              <Pressable key={key} onPress={() => setActiveEmojiCat(key)}
                style={({ pressed }) => [{ paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, borderRadius: 8, backgroundColor: activeEmojiCat===key ? theme.accentBg : theme.keyBg, borderWidth: activeEmojiCat===key ? 0 : 1, borderColor: theme.specBg }]}>
                <Text style={{ fontSize: 11, fontWeight: '500', color: activeEmojiCat===key ? '#fff' : theme.keyTxt }}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView scrollEnabled style={{ maxHeight: 220, paddingHorizontal: 8 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
              {(emojiSearch.trim()
                ? Object.values(EMOJI_CATS).flatMap(c => c.emojis)
                : EMOJI_CATS[activeEmojiCat as keyof typeof EMOJI_CATS]?.emojis ?? []
              ).map((emoji, i) => (
                <Pressable key={i} onPress={() => { setTypedText(p => p + emoji); triggerHapticForKey('insert'); }}
                  style={({ pressed }) => [{ width: 36, height: 36, borderRadius: 8, backgroundColor: pressed ? theme.accentBg : theme.keyBg, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 22 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {renderBottomBar(userSettings)}

      <View style={{ height: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.kbBg }}>
        <Text style={{ fontSize: 9, color: theme.specTxt+'70', letterSpacing: 1.5, fontWeight: '600' }}>SNIPPAD</Text>
      </View>

      {/* Long-press popup */}
      {popup && (() => {
        const IW=38, IH=44, PAD=4, GAP=3;
        const all = [popup.key, ...popup.variants];
        const totalW = all.length*IW + (all.length-1)*GAP + PAD*2;
        const { width: SW2 } = Dimensions.get('window');
        const popLeft = Math.max(8, Math.min(SW2-totalW-8, popup.keyX-totalW/2));
        const popTop  = popup.keyY - IH - 60;
        return (
          <Modal visible transparent animationType="none" onRequestClose={() => setPopup(null)}>
            <Pressable style={{ flex: 1 }} onPress={() => setPopup(null)}>
              <View style={{ position: 'absolute', left: popLeft, top: popTop, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: PAD, gap: GAP, shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 16, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)' }}
                onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
                onResponderMove={e => { const rx = e.nativeEvent.pageX-popLeft-PAD; const idx = Math.max(0, Math.min(all.length-1, Math.floor(rx/(IW+GAP)))); setPopup(p => p ? { ...p, selectedIdx: idx } : null); }}
                onResponderRelease={() => setPopup(null)}>
                {all.map((ch, idx) => {
                  const sel = idx === popup.selectedIdx;
                  return (
                    <View key={ch+idx} style={{ width: IW, height: IH, borderRadius: 7, backgroundColor: sel ? '#007AFF' : idx===0 ? '#E8E8E8' : '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: sel ? '#fff' : '#000', fontSize: 20, fontWeight: sel ? '700' : '500' }}>{ch}</Text>
                    </View>
                  );
                })}
              </View>
            </Pressable>
          </Modal>
        );
      })()}
    </View>

    {/* Preview kontrol paneli */}
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background, width: '100%' }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>YAZI BOYUTU</Text>
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
        {(['small','normal','large','xlarge'] as const).map(sz => (
          <Pressable key={sz} onPress={() => { setPreviewFontSize(sz); setShowSignatures(false); }}
            style={({ pressed }) => [{ flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: previewFontSize===sz ? Colors.primary : '#f5f5f5', borderRadius: 8, borderWidth: 1, borderColor: previewFontSize===sz ? Colors.primary : Colors.border, opacity: pressed ? 0.85 : 1 }]}>
            <Text style={{ fontSize: 12, fontWeight: previewFontSize===sz ? '700' : '600', color: previewFontSize===sz ? '#fff' : Colors.textGray }}>{fontSizeMap[sz]}px</Text>
          </Pressable>
        ))}
      </View>
    </View>

    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background, width: '100%' }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>YAZI TİPİ</Text>
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
        {(['system','mono','bold','rounded'] as const).map(f => (
          <Pressable key={f} onPress={() => { setPreviewFontFamily(f); setShowSignatures(false); }}
            style={({ pressed }) => [{ flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: previewFontFamily===f ? Colors.primary : '#f5f5f5', borderRadius: 8, borderWidth: 1, borderColor: previewFontFamily===f ? Colors.primary : Colors.border, opacity: pressed ? 0.85 : 1 }]}>
            <Text style={{ fontSize: 11, fontWeight: previewFontFamily===f ? '700' : '600', color: previewFontFamily===f ? '#fff' : Colors.textGray, textTransform: 'capitalize' }}>{f}</Text>
          </Pressable>
        ))}
      </View>
    </View>

    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background, width: '100%' }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>KLAVYE DİLİ</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {(['tr','en','ar'] as const).map(l => (
          <Pressable key={l} onPress={() => { setPreviewKbLanguage(l); setShowSignatures(false); }}
            style={({ pressed }) => [{ flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: previewKbLanguage===l ? Colors.primary : '#f5f5f5', borderRadius: 8, borderWidth: 1, borderColor: previewKbLanguage===l ? Colors.primary : Colors.border, opacity: pressed ? 0.85 : 1 }]}>
            <Text style={{ fontSize: 10, fontWeight: previewKbLanguage===l ? '700' : '600', color: previewKbLanguage===l ? '#fff' : Colors.textGray }}>{l==='tr'?'Türkçe':l==='en'?'English':'العربية'}</Text>
          </Pressable>
        ))}
      </View>
    </View>

    {previewKbLanguage === 'tr' && (
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background, width: '100%' }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>KLAVYE DÜZENİ</Text>
        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
          {(['q','f'] as const).map(lt => (
            <Pressable key={lt} onPress={() => { setPreviewKbLayout(lt); setShowSignatures(false); }}
              style={({ pressed }) => [{ flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: previewKbLayout===lt ? Colors.primary : '#f5f5f5', borderRadius: 8, borderWidth: 1, borderColor: previewKbLayout===lt ? Colors.primary : Colors.border, opacity: pressed ? 0.85 : 1 }]}>
              <Text style={{ fontSize: 12, fontWeight: previewKbLayout===lt ? '700' : '600', color: previewKbLayout===lt ? '#fff' : Colors.textGray, textTransform: 'uppercase' }}>{lt}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function KeyboardPreviewScreen({ navigation }: Props) {
  const T = useT();
  const { categories, getPlanLimits, userSettings } = useAppStore();
  const planLimits = getPlanLimits();
  const [activeTheme, setActiveTheme]       = useState(0);
  const [activeFontSize, setActiveFontSize] = useState(1);
  const [previewShowFiligran, setPreviewShowFiligran] = useState(userSettings.show_filigran ?? true);
  const fontSizes = [
    { label: T.szSmall, size: 14 }, { label: T.szNormal, size: 17 },
    { label: T.szLarge, size: 20 }, { label: T.szXLarge, size: 24 },
  ];
  return (
    <SafeAreaView style={s.container}>
      <ScreenHeader title={T.kbPreviewLabel} subtitle={T.kbPreviewScreenSub} onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.preview}>
          <KeyboardPreview
            theme={THEMES[activeTheme]}
            fontSize={fontSizes[activeFontSize].size}
            categories={categories}
            isPro={planLimits.searchBar}
            isBusiness={planLimits.signatureText}
            userSettings={{ show_filigran: previewShowFiligran }}
          />
        </View>

        {/* Theme Section */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>Tema</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {THEMES.map((t, i) => (
              <Pressable key={i} onPress={() => setActiveTheme(i)} style={{ alignItems: 'center', gap: 4 }}>
                <View style={[{ width: 44, height: 44, borderRadius: 10, backgroundColor: t.kbBg, borderWidth: 2, borderColor: activeTheme===i ? t.accentBg : 'transparent' }, activeTheme===i && { shadowColor: t.accentBg, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 }]} />
                <Text style={{ fontSize: 11, fontWeight: activeTheme===i ? '600' : '500', color: activeTheme===i ? Colors.primary : Colors.textGray }}>{t.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Font Size Section */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>Yazı Boyutu</Text>
          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
            {fontSizes.map((f, i) => (
              <Pressable key={i} onPress={() => setActiveFontSize(i)} style={{ flex: 1 }}>
                <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: activeFontSize===i ? Colors.primary : Colors.surface, borderWidth: 1, borderColor: activeFontSize===i ? Colors.primary : Colors.border, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: activeFontSize===i ? '700' : '600', color: activeFontSize===i ? '#fff' : Colors.textGray }}>{f.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={s.sectionLabel}>Snippad Logosu</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>S</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textDark }}>Filigran Göster</Text>
            <Text style={{ fontSize: 12, color: Colors.textGray, marginTop: 2 }}>123 → S, Boşluk → Snippad</Text>
          </View>
          <Pressable onPress={() => setPreviewShowFiligran(!previewShowFiligran)}>
            <View style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: previewShowFiligran ? Colors.primary : Colors.border, justifyContent: 'center', paddingHorizontal: 2 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: previewShowFiligran ? 'flex-end' : 'flex-start' }} />
            </View>
          </Pressable>
        </View>
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>⌨️  {THEMES[activeTheme].name} · {fontSizes[activeFontSize].label}</Text>
          <Text style={s.infoText}>{T.kbPreviewNote}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  scroll:           { paddingVertical: Spacing.lg, paddingBottom: 120 },
  preview:          { alignItems: 'center', marginBottom: Spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  sectionLabel:     { ...Typography.label, color: Colors.textLight, letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.sm, paddingHorizontal: Spacing.lg },
  themeScroll:      { marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  themeChip:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: BorderRadius.full, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderWidth: 1.5, borderColor: Colors.border },
  themeChipActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  themeColor:       { width: 18, height: 18, borderRadius: 9 },
  themeLabel:       { ...Typography.caption, color: Colors.textGray, fontWeight: '600' },
  themeLabelActive: { color: Colors.primary },
  fontRow:          { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg },
  fontBtn:          { flex: 1, paddingVertical: Spacing.sm+2, borderRadius: BorderRadius.md, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  fontBtnActive:    { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  fontBtnTxt:       { ...Typography.caption, color: Colors.textGray, fontWeight: '600' },
  fontBtnTxtActive: { color: Colors.primary },
  infoBox:          { backgroundColor: Colors.cardLavender, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primaryLight, marginHorizontal: Spacing.lg },
  infoTitle:        { ...Typography.body, color: Colors.primary, fontWeight: '700', marginBottom: 4 },
  infoText:         { ...Typography.caption, color: Colors.textGray, lineHeight: 18 },
});
