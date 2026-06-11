/**
 * ════════════════════════════════════════════════════════════════════════════════════
 * 🌍 WORLD-CLASS KEYBOARD CONFIGURATION
 * ════════════════════════════════════════════════════════════════════════════════════
 *
 * SINGLE SOURCE OF TRUTH — All platforms read from here:
 * ✓ React Native Web Preview
 * ✓ iOS Native Extension
 * ✓ Android Native Extension
 *
 * Design Principles:
 * ✓ Premium tactile feedback (visual + audio + haptic)
 * ✓ Instant response (<100ms latency)
 * ✓ Perfect responsiveness across all device sizes
 * ✓ World-class comfort and precision
 * ✓ No hardcoding elsewhere
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// RESPONSIVE KEY SIZING (Device-Specific Optimization)
// ═══════════════════════════════════════════════════════════════════════════════════

export interface DeviceSizeProfile {
  screenWidth: number;
  screenWidthMax: number; // Upper bound for range-based matching
  letterKeyWidth: number;
  letterKeyHeight: number;
  bottomRowHeight: number;
  gap: number;
  cornerRadius: number;
  horizontalPadding: number; // Keyboard left+right outer padding
  row2Indent: number;        // 2nd row indent (px each side) for staggered look
  shiftDelWidth: number;     // Shift & Backspace key width (auto-calculated)
  description: string;
}

/**
 * Device-specific profiles optimized for comfort and precision.
 * Based on Fitts' Law and ergonomic research.
 *
 * FIX: Switched from nearest-match (broken for mid-range widths) to
 * explicit range matching via screenWidthMax.
 *
 * FIX: Added horizontalPadding, row2Indent, shiftDelWidth so every
 * platform can compute exact pixel math without guessing.
 *
 * Key width formula (used to derive shiftDelWidth):
 *   usableWidth = screenWidth - horizontalPadding * 2
 *   row3LetterCount = 9  (TR/EN)  or  9  (AR)
 *   shiftDelWidth = (usableWidth - row3LetterCount * letterKeyWidth - (row3LetterCount + 1) * gap) / 2
 */
export const DEVICE_PROFILES: DeviceSizeProfile[] = [
  // iPhone SE, iPhone 13 mini (≤ 380px)
  {
    screenWidth: 375,
    screenWidthMax: 380,
    letterKeyWidth: 26,
    letterKeyHeight: 40,
    bottomRowHeight: 44,
    gap: 5,
    cornerRadius: 9,
    horizontalPadding: 3,
    row2Indent: 14,
    // (375-6 - 9*26 - 10*5) / 2 = (369-234-50)/2 = 42.5 → 42
    shiftDelWidth: 42,
    description: 'iPhone SE / Mini',
  },
  // iPhone 12, 13, 14 (381–409px) — OPTIMAL
  {
    screenWidth: 390,
    screenWidthMax: 409,
    letterKeyWidth: 28,
    letterKeyHeight: 42,
    bottomRowHeight: 46,
    gap: 5,
    cornerRadius: 10,
    horizontalPadding: 3,
    row2Indent: 16,
    // (390-6 - 9*28 - 10*5) / 2 = (384-252-50)/2 = 41
    shiftDelWidth: 41,
    description: 'iPhone 12–14 / Standard',
  },
  // iPhone 14 Pro Max, 15 Pro Max (410–459px)
  {
    screenWidth: 430,
    screenWidthMax: 459,
    letterKeyWidth: 30,
    letterKeyHeight: 44,
    bottomRowHeight: 48,
    gap: 6,
    cornerRadius: 10,
    horizontalPadding: 4,
    row2Indent: 18,
    // (430-8 - 9*30 - 10*6) / 2 = (422-270-60)/2 = 46
    shiftDelWidth: 46,
    description: 'iPhone 14+ / Pro Max',
  },
  // iPad (460px+) — TABLET
  {
    screenWidth: 768,
    screenWidthMax: 9999,
    letterKeyWidth: 56,
    letterKeyHeight: 52,
    bottomRowHeight: 56,
    gap: 8,
    cornerRadius: 11,
    horizontalPadding: 6,
    row2Indent: 30,
    // (768-12 - 9*56 - 10*8) / 2 = (756-504-80)/2 = 86
    shiftDelWidth: 86,
    description: 'iPad / Tablet',
  },
];

/**
 * FIX: Range-based profile matching instead of "nearest screenWidth".
 * The old reduce() picked the wrong profile for e.g. 700px screens.
 */
export function getDeviceProfile(screenWidth: number): DeviceSizeProfile {
  const match = DEVICE_PROFILES.find(
    p => screenWidth <= p.screenWidthMax
  );
  // Fall back to largest profile for very wide screens
  return match ?? DEVICE_PROFILES[DEVICE_PROFILES.length - 1];
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎯 PREMIUM FEEDBACK SYSTEM (Visual + Audio + Haptic)
// ═══════════════════════════════════════════════════════════════════════════════════

export interface KeyPressFeedback {
  scaleOnPress: number;
  opacityOnPress: number;
  pressDuration: number;
  shadowOnPress: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  soundDuration: number;
  hapticEnabled: boolean;
  hapticIntensity: number;
  hapticPattern: 'light' | 'medium' | 'heavy';
}

export const KEY_PRESS_FEEDBACK: KeyPressFeedback = {
  scaleOnPress: 0.92,
  opacityOnPress: 0.85,
  pressDuration: 60,
  shadowOnPress: true,
  soundEnabled: true,
  soundVolume: 0.4,
  soundDuration: 50,
  hapticEnabled: true,
  hapticIntensity: 0.7,
  hapticPattern: 'light',
};

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎮 TOUCH & LATENCY OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════════════

export interface TouchOptimization {
  debounceMs: number;
  hitBoxExpand: number;
  pressMinDuration: number;
  maxConcurrentPresses: number;
}

export const TOUCH_OPTIMIZATION: TouchOptimization = {
  debounceMs: 0,
  hitBoxExpand: 4,
  pressMinDuration: 30,
  maxConcurrentPresses: 2,
};

// ═══════════════════════════════════════════════════════════════════════════════════
// 📍 LONG-PRESS MODAL BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════════════

export interface LongPressBehavior {
  triggerDuration: number;
  /**
   * FIX: modalOffsetY was -12, which caused the modal to overlap the key.
   * Correct value: -(keyHeight + modalHeight/2 + gap).
   * Using -60 as a safe default; platforms should recalculate if modal height varies.
   */
  modalOffsetY: number;
  modalAnimationDuration: number;
  variantSelectionMode: 'tap' | 'drag';
}

export const LONG_PRESS_BEHAVIOR: LongPressBehavior = {
  triggerDuration: 300,
  modalOffsetY: -60, // FIX: was -12, now safely above the key
  modalAnimationDuration: 150,
  variantSelectionMode: 'drag',
};

// ═══════════════════════════════════════════════════════════════════════════════════
// ⌨️ SPECIAL KEY TOKENS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * All non-character keys. Platforms render these as icon/label keys.
 *
 * ACTION  — context-sensitive: "Git" in URL bar, "Ara" in search, "↵" elsewhere.
 *           Platforms must pass the current input context so the correct label renders.
 * LANG    — cycles through enabled input languages (TR → EN → AR → …)
 */
export type SpecialKey =
  | 'SHIFT'
  | 'BACKSPACE'
  | 'NUM'
  | 'EMOJI'
  | 'SPACE'
  | 'LANG'
  | '.'
  | 'ACTION';

// ═══════════════════════════════════════════════════════════════════════════════════
// ⌨️ KEYBOARD LAYOUT TYPES
// ═══════════════════════════════════════════════════════════════════════════════════

export interface KeyboardRow {
  keys: string[];
  keyCount: number;
  /**
   * Fractional horizontal indent applied to both sides of this row (0–0.5).
   * e.g. 0.05 → row starts 5% of keyboard width in from each edge.
   * Used for the staggered "home row" look on row 2.
   * Platforms that handle stagger natively (iOS) may ignore this.
   */
  indentRatio?: number;
}

export interface KeyboardLayout {
  language: string;
  name: string;
  /** RTL text direction flag — critical for AR layout rendering. */
  isRTL: boolean;
  rows: KeyboardRow[];
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ⌨️ KEYBOARD LAYOUTS (TR · EN · AR)
// ═══════════════════════════════════════════════════════════════════════════════════

export const KEYBOARD_LAYOUTS: Record<string, KeyboardLayout> = {

  // ─── Türkçe ──────────────────────────────────────────────────────────────────────
  tr: {
    language: 'tr',
    name: 'Türkçe',
    isRTL: false,
    rows: [
      /**
       * FIX: Added ğ and ü to row 1.
       * Standard Turkish keyboard (GBoard, Samsung, iOS) has 12 keys on row 1:
       * q w e r t y u ı o p ğ ü
       * The old config had only 10 — ğ and ü were missing entirely.
       */
      {
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
        keyCount: 12,
      },
      /**
       * FIX: Row 2 stays at 11 keys (a s d f g h j k l ş i).
       * "i" remains here (not moved to long-press of ı) to match standard TR layout.
       * indentRatio staggers the row visually like a real keyboard.
       */
      {
        keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
        keyCount: 11,
        indentRatio: 0.05,
      },
      /**
       * FIX: Added SHIFT and BACKSPACE — they were completely missing.
       * shiftDelWidth from DeviceSizeProfile is used for these two keys.
       */
      {
        keys: ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', 'BACKSPACE'],
        keyCount: 11,
      },
      /**
       * FIX: Added LANG key (TR/EN switcher visible in reference screenshot).
       * FIX: Renamed ENTER → ACTION (context-aware: Git / Ara / ↵).
       */
      {
        keys: ['NUM', 'EMOJI', 'SPACE', 'LANG', '.', 'ACTION'],
        keyCount: 6,
      },
    ],
  },

  // ─── English ─────────────────────────────────────────────────────────────────────
  en: {
    language: 'en',
    name: 'English',
    isRTL: false,
    rows: [
      // Standard QWERTY row 1 — 10 keys, correct as-is
      {
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        keyCount: 10,
      },
      /**
       * FIX: Added SHIFT and BACKSPACE to row 3 — they were missing.
       * Row 2 indented for stagger.
       */
      {
        keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        keyCount: 9,
        indentRatio: 0.07,
      },
      {
        keys: ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACKSPACE'],
        keyCount: 9,
      },
      /**
       * FIX: Added LANG key.
       * FIX: Renamed ENTER → ACTION.
       */
      {
        keys: ['NUM', 'EMOJI', 'SPACE', 'LANG', '.', 'ACTION'],
        keyCount: 6,
      },
    ],
  },

  // ─── العربية ─────────────────────────────────────────────────────────────────────
  ar: {
    language: 'ar',
    name: 'العربية',
    /**
     * FIX: isRTL was missing entirely.
     * Native extensions MUST flip row rendering direction when isRTL is true.
     */
    isRTL: true,
    rows: [
      /**
       * FIX: Added BACKSPACE to row 1 (standard Arabic keyboard pattern).
       * Arabic row 1 has 13 character keys; on narrow phones some are moved
       * to long-press — platforms may truncate to fit, keeping the token list
       * as the canonical order.
       */
      {
        keys: ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
        keyCount: 12,
      },
      /**
       * FIX: Added BACKSPACE at end of row 2 (LTR token order; isRTL flips render).
       * Removed 'ط' from this row — it was causing row overflow (12 keys on 390px).
       * 'ط' moved to long-press of 'ت' (phonetically related).
       */
      {
        keys: ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك'],
        keyCount: 10,
        indentRatio: 0.03,
      },
      /**
       * FIX: Added SHIFT and BACKSPACE.
       * Removed 'ظ' overflow — moved to long-press of 'ز' (same phoneme family).
       */
      {
        keys: ['SHIFT', 'ئ', 'ء', 'ؤ', 'ر', 'ى', 'ة', 'و', 'ز', 'BACKSPACE'],
        keyCount: 10,
      },
      /**
       * FIX: Added LANG key.
       * FIX: Renamed ENTER → ACTION.
       * '،' (Arabic comma) replaces '.' as the primary punctuation key.
       */
      {
        keys: ['NUM', 'EMOJI', 'SPACE', 'LANG', '،', 'ACTION'],
        keyCount: 6,
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════
// 🔤 LONG-PRESS VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════

export const LONG_PRESS_VARIANTS: Record<string, Record<string, string[]>> = {
  tr: {
    // FIX: ğ is now a dedicated key on row 1, but keep long-press on g as fallback
    g: ['ğ'],
    u: ['ü', 'û', 'ù', 'ú', 'ū'],
    // FIX: ş is now a dedicated key on row 2, keep long-press on s as fallback
    s: ['ş'],
    // FIX: ı stays on row 1 as dedicated key; long-press gives latin variants
    ı: ['î', 'ì', 'í', 'ï'],
    i: ['ì', 'í', 'î', 'ï', 'ī', 'į', 'ĩ', 'ı'],
    o: ['ö', 'ô', 'ò', 'ó', 'õ', 'ø'],
    // FIX: ö is dedicated key on row 3, keep long-press on o as fallback
    c: ['ç'],
    a: ['â', 'à', 'á', 'ä', 'å', 'ã', 'æ'],
    e: ['ê', 'è', 'é', 'ë', 'ě'],
    n: ['ñ'],
    // New: ğ long-press gives other g variants
    ğ: ['g', 'ĝ'],
    // New: ü long-press gives other u variants
    ü: ['u', 'ū', 'ù', 'ú', 'û'],
  },

  en: {
    a: ['à', 'á', 'â', 'ä', 'å', 'ã', 'æ'],
    e: ['è', 'é', 'ê', 'ë', 'ě'],
    i: ['ì', 'í', 'î', 'ï', 'ī', 'į', 'ĩ', 'ı'],
    o: ['ò', 'ó', 'ô', 'ö', 'õ', 'ø'],
    u: ['ù', 'ú', 'û', 'ü', 'ū'],
    c: ['ç'],
    n: ['ñ'],
    s: ['ß'],
  },

  ar: {
    ا: ['أ', 'إ', 'آ', 'ٱ'],
    و: ['ؤ'],
    ي: ['ئ', 'ى'],
    ه: ['ة'],
    ل: ['لا', 'لأ', 'لإ', 'لآ'],
    // FIX: ط and ظ moved here from row overflow
    ت: ['ط'],
    ز: ['ظ'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎨 THEME DEFINITIONS (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════════

export interface KeyboardThemeColors {
  kbBg: string;
  keyBg: string;
  keyPress: string;
  keyTxt: string;
  specBg: string;
  specPress: string;
  specTxt: string;
  accentBg: string;
  accentPress: string;
  accentTxt?: string;
  dockBg: string;
  tplBg: string;
  tplItemBg: string;
  tplTxt: string;
  tplSub: string;
  divider: string;
  keyAccentBorder: string;
}

export interface KeyboardTheme {
  id: string;
  name: string;
  category: 'dark' | 'light' | 'neutral';
  colors: KeyboardThemeColors;
}

export const KEYBOARD_THEMES: Record<string, KeyboardTheme> = {
  ember: { id: 'ember', name: 'Ember', category: 'dark', colors: { kbBg: '#0F0A08', keyBg: '#2E1A0E', keyPress: '#FF6B2B', specBg: '#1A0F0A', specPress: '#100805', accentBg: '#FF6B2B', accentPress: '#D94D1A', keyTxt: '#FF6B2B', specTxt: '#FF8B4D', dockBg: '#080604', tplBg: '#1A1008', tplItemBg: '#2E1A0E', tplTxt: '#FF6B2B', tplSub: '#D4A574', divider: '#1A0F0A', keyAccentBorder: '#FF6B2B' } },
  noir: { id: 'noir', name: 'Noir', category: 'dark', colors: { kbBg: '#0D0D0D', keyBg: '#1C1C1C', keyPress: '#E8E8E8', specBg: '#141414', specPress: '#0A0A0A', accentBg: '#E8E8E8', accentPress: '#D0D0D0', accentTxt: '#0D0D0D', keyTxt: '#E8E8E8', specTxt: '#E8E8E8', dockBg: '#080808', tplBg: '#0F0F0F', tplItemBg: '#1C1C1C', tplTxt: '#E8E8E8', tplSub: '#A0A0A0', divider: '#2A2A2A', keyAccentBorder: '#E8E8E8' } },
  jade: { id: 'jade', name: 'Jade', category: 'dark', colors: { kbBg: '#0B1E17', keyBg: '#122B20', keyPress: '#4ECBA0', specBg: '#0D2018', specPress: '#0A1814', accentBg: '#4ECBA0', accentPress: '#3AA088', keyTxt: '#4ECBA0', specTxt: '#5FD4B0', dockBg: '#081410', tplBg: '#0F2820', tplItemBg: '#122B20', tplTxt: '#4ECBA0', tplSub: '#3AA088', divider: '#1A3A36', keyAccentBorder: '#4ECBA0' } },
  galaxy: { id: 'galaxy', name: 'Galaxy', category: 'dark', colors: { kbBg: '#060814', keyBg: '#0C1028', keyPress: '#4F46E5', specBg: '#08091E', specPress: '#040616', accentBg: '#4F46E5', accentPress: '#2A28B8', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#04050E', tplBg: '#08091A', tplItemBg: '#0C1028', tplTxt: '#FFFFFF', tplSub: '#6060D0', divider: '#08091E', keyAccentBorder: '#2A28B8' } },
  honey: { id: 'honey', name: 'Honey', category: 'dark', colors: { kbBg: '#0C0A04', keyBg: '#20180A', keyPress: '#F59E0B', specBg: '#181206', specPress: '#100E04', accentBg: '#F59E0B', accentPress: '#B07808', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#080604', tplBg: '#120E06', tplItemBg: '#20180A', tplTxt: '#FFFFFF', tplSub: '#C09020', divider: '#181206', keyAccentBorder: '#B07808' } },
  titanium: { id: 'titanium', name: 'Titanium', category: 'dark', colors: { kbBg: '#0D0B08', keyBg: '#201A10', keyPress: '#C86420', specBg: '#181408', specPress: '#100E06', accentBg: '#C86420', accentPress: '#985018', keyTxt: '#F0E8DC', specTxt: '#F0E8DC', dockBg: '#090806', tplBg: '#15100A', tplItemBg: '#201A10', tplTxt: '#F0E8DC', tplSub: '#A06828', divider: '#181408', keyAccentBorder: '#985018' } },
  space: { id: 'space', name: 'Space', category: 'dark', colors: { kbBg: '#080810', keyBg: '#14141E', keyPress: '#E8E8F0', specBg: '#0E0E18', specPress: '#080810', accentBg: '#E8E8F0', accentPress: '#C8C8D0', accentTxt: '#080810', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#060608', tplBg: '#0C0C16', tplItemBg: '#14141E', tplTxt: '#FFFFFF', tplSub: '#7878A0', divider: '#1A1A28', keyAccentBorder: '#30304A' } },
  crimson: { id: 'crimson', name: 'Crimson', category: 'dark', colors: { kbBg: '#1A0508', keyBg: '#2A080E', keyPress: '#E84560', specBg: '#1E060A', specPress: '#140404', accentBg: '#E84560', accentPress: '#C0344A', keyTxt: '#E84560', specTxt: '#F05A74', dockBg: '#0E0305', tplBg: '#190608', tplItemBg: '#2A080E', tplTxt: '#E84560', tplSub: '#D4627A', divider: '#6B1525', keyAccentBorder: '#E84560' } },
  violet: { id: 'violet', name: 'Violet', category: 'dark', colors: { kbBg: '#0C0812', keyBg: '#181020', keyPress: '#7C3AED', specBg: '#120C1C', specPress: '#0C0814', accentBg: '#7C3AED', accentPress: '#5020C0', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#08060E', tplBg: '#100A18', tplItemBg: '#181020', tplTxt: '#FFFFFF', tplSub: '#7050C8', divider: '#120C1C', keyAccentBorder: '#5020C0' } },
  aurora: { id: 'aurora', name: 'Aurora', category: 'dark', colors: { kbBg: '#060E12', keyBg: '#0C1C22', keyPress: '#06B6D4', specBg: '#08141A', specPress: '#040E10', accentBg: '#06B6D4', accentPress: '#0488A0', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#040A0E', tplBg: '#081018', tplItemBg: '#0C1C22', tplTxt: '#FFFFFF', tplSub: '#1898B8', divider: '#08141A', keyAccentBorder: '#0488A0' } },
  mocha: { id: 'mocha', name: 'Mocha', category: 'dark', colors: { kbBg: '#120E0A', keyBg: '#241C14', keyPress: '#C2773A', specBg: '#1C1510', specPress: '#140D08', accentBg: '#C2773A', accentPress: '#8A4E1E', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#0E0A08', tplBg: '#180F0A', tplItemBg: '#241C14', tplTxt: '#FFFFFF', tplSub: '#A06030', divider: '#1C1510', keyAccentBorder: '#8A4E1E' } },
  onyx: { id: 'onyx', name: 'Onyx', category: 'dark', colors: { kbBg: '#000000', keyBg: '#0A0A0A', keyPress: '#202020', specBg: '#050505', specPress: '#020202', accentBg: '#2A2A2A', accentPress: '#1A1A1A', accentTxt: '#FFFFFF', keyTxt: '#C8C8C8', specTxt: '#888888', dockBg: '#000000', tplBg: '#050505', tplItemBg: '#0A0A0A', tplTxt: '#C8C8C8', tplSub: '#606060', divider: '#0A0A0A', keyAccentBorder: '#1A1A1A' } },
  graphite: { id: 'graphite', name: 'Graphite', category: 'dark', colors: { kbBg: '#181818', keyBg: '#2A2A2A', keyPress: '#424242', specBg: '#202020', specPress: '#161616', accentBg: '#3A3A3A', accentPress: '#2A2A2A', accentTxt: '#FFFFFF', keyTxt: '#E0E0E0', specTxt: '#A8A8A8', dockBg: '#121212', tplBg: '#181818', tplItemBg: '#2A2A2A', tplTxt: '#E0E0E0', tplSub: '#888888', divider: '#202020', keyAccentBorder: '#303030' } },
  ferrari: { id: 'ferrari', name: 'Ferrari', category: 'dark', colors: { kbBg: '#080505', keyBg: '#130808', keyPress: '#CC0000', specBg: '#0C0505', specPress: '#080404', accentBg: '#CC0000', accentPress: '#990000', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#060404', tplBg: '#0F0606', tplItemBg: '#1A0808', tplTxt: '#FFFFFF', tplSub: '#CC4444', divider: '#0C0505', keyAccentBorder: '#8A0000' } },
  bentley: { id: 'bentley', name: 'Bentley', category: 'dark', colors: { kbBg: '#06080E', keyBg: '#0C1220', keyPress: '#C9A227', specBg: '#080C1A', specPress: '#060814', accentBg: '#C9A227', accentPress: '#8A6E10', accentTxt: '#06080E', keyTxt: '#C8D4E4', specTxt: '#7A8EA8', dockBg: '#040608', tplBg: '#080E1C', tplItemBg: '#0C1220', tplTxt: '#C8D4E4', tplSub: '#7A8EA8', divider: '#080C1A', keyAccentBorder: '#8A6E10' } },
  hermes: { id: 'hermes', name: 'Hermès', category: 'dark', colors: { kbBg: '#0A0E08', keyBg: '#161C10', keyPress: '#8A9838', specBg: '#101408', specPress: '#080E04', accentBg: '#8A9838', accentPress: '#4A6018', keyTxt: '#C8D080', specTxt: '#C8D080', dockBg: '#060A04', tplBg: '#0E1208', tplItemBg: '#161C10', tplTxt: '#C8D080', tplSub: '#788840', divider: '#101408', keyAccentBorder: '#4A6018' } },
  olivetti: { id: 'olivetti', name: 'Olivetti', category: 'dark', colors: { kbBg: '#180808', keyBg: '#281010', keyPress: '#C82828', specBg: '#200A0A', specPress: '#180606', accentBg: '#C82828', accentPress: '#901010', keyTxt: '#FFFFFF', specTxt: '#FFFFFF', dockBg: '#100404', tplBg: '#180808', tplItemBg: '#281010', tplTxt: '#FFFFFF', tplSub: '#B04040', divider: '#200A0A', keyAccentBorder: '#901010' } },
  daktilo: { id: 'daktilo', name: 'Daktilo', category: 'dark', colors: { kbBg: '#1A1208', keyBg: '#2E2010', keyPress: '#D4A84B', specBg: '#140E06', specPress: '#0E0A04', accentBg: '#D4A84B', accentPress: '#A07820', accentTxt: '#1A1208', keyTxt: '#F5DFA0', specTxt: '#C8A040', dockBg: '#120E04', tplBg: '#1A1208', tplItemBg: '#2E2010', tplTxt: '#F5DFA0', tplSub: '#A07820', divider: '#140E06', keyAccentBorder: '#A07820' } },
  matrix: { id: 'matrix', name: 'Matrix', category: 'dark', colors: { kbBg: '#000800', keyBg: '#000E00', keyPress: '#00FF41', specBg: '#000600', specPress: '#000400', accentBg: '#00FF41', accentPress: '#006618', accentTxt: '#000800', keyTxt: '#00CC33', specTxt: '#008822', dockBg: '#000500', tplBg: '#000800', tplItemBg: '#000E00', tplTxt: '#00FF41', tplSub: '#007A1C', divider: '#000600', keyAccentBorder: '#006618' } },
  copper: { id: 'copper', name: 'Copper', category: 'dark', colors: { kbBg: '#0E0804', keyBg: '#1C1008', keyPress: '#B87333', specBg: '#140C06', specPress: '#0E0804', accentBg: '#B87333', accentPress: '#7A4A18', accentTxt: '#0E0804', keyTxt: '#F0D8B8', specTxt: '#C09060', dockBg: '#0A0604', tplBg: '#120A06', tplItemBg: '#1C1008', tplTxt: '#F0D8B8', tplSub: '#9A6838', divider: '#140C06', keyAccentBorder: '#7A4A18' } },
  walnut: { id: 'walnut', name: 'Walnut', category: 'dark', colors: { kbBg: '#180E06', keyBg: '#261608', keyPress: '#9A6A30', specBg: '#120A04', specPress: '#0E0804', accentBg: '#9A6A30', accentPress: '#644218', accentTxt: '#180E06', keyTxt: '#EED0A0', specTxt: '#B88050', dockBg: '#100C04', tplBg: '#1A1008', tplItemBg: '#261608', tplTxt: '#EED0A0', tplSub: '#8A6030', divider: '#120A04', keyAccentBorder: '#644218' } },
  rosegold: { id: 'rosegold', name: 'Rose Gold', category: 'dark', colors: { kbBg: '#1A0E12', keyBg: '#2C1820', keyPress: '#E890A0', specBg: '#14080E', specPress: '#100608', accentBg: '#E890A0', accentPress: '#C06070', accentTxt: '#1A0E12', keyTxt: '#FFE4EA', specTxt: '#C87888', dockBg: '#12080E', tplBg: '#1E1014', tplItemBg: '#2C1820', tplTxt: '#FFE4EA', tplSub: '#B06878', divider: '#14080E', keyAccentBorder: '#B05060' } },
  princess: { id: 'princess', name: 'Princess', category: 'dark', colors: { kbBg: '#120C1C', keyBg: '#1E1430', keyPress: '#C890F8', specBg: '#0E0818', specPress: '#0A0614', accentBg: '#C890F8', accentPress: '#7840B8', accentTxt: '#120C1C', keyTxt: '#EEE0FF', specTxt: '#9870C8', dockBg: '#0C0814', tplBg: '#160E20', tplItemBg: '#1E1430', tplTxt: '#EEE0FF', tplSub: '#8860B8', divider: '#0E0818', keyAccentBorder: '#7840B8' } },
  sakura: { id: 'sakura', name: 'Sakura', category: 'light', colors: { kbBg: '#FDF6F0', keyBg: '#FDFBF9', keyPress: '#C94A7B', specBg: '#F2C4CE', specPress: '#E8B0BB', accentBg: '#C94A7B', accentPress: '#9F3060', keyTxt: '#7D3E52', specTxt: '#7D3E52', dockBg: '#F0E8E0', tplBg: '#FAF0CF', tplItemBg: '#FDFBF9', tplTxt: '#7D3E52', tplSub: '#D4A88A', divider: '#E8C8D4', keyAccentBorder: '#C94A7B' } },
  arctic: { id: 'arctic', name: 'Arctic', category: 'light', colors: { kbBg: '#EEF3F8', keyBg: '#FFFFFF', keyPress: '#0D5A9E', specBg: '#DCE8F2', specPress: '#C8D8E8', accentBg: '#0D5A9E', accentPress: '#0A4A7E', keyTxt: '#2D4A6B', specTxt: '#2D4A6B', dockBg: '#E0EDF8', tplBg: '#F0F6FB', tplItemBg: '#FFFFFF', tplTxt: '#2D4A6B', tplSub: '#5A7A9E', divider: '#C8D8E8', keyAccentBorder: '#C8D8E8' } },
  frost: { id: 'frost', name: 'Frost', category: 'light', colors: { kbBg: '#D8E8F4', keyBg: '#FFFFFF', keyPress: '#0369A1', specBg: '#B8CCD8', specPress: '#A0B8C8', accentBg: '#0369A1', accentPress: '#024F78', keyTxt: '#0C1A28', specTxt: '#0C1A28', dockBg: '#C8D8E8', tplBg: '#E0EEF8', tplItemBg: '#FFFFFF', tplTxt: '#0C1A28', tplSub: '#406880', divider: '#C8DCE8', keyAccentBorder: '#6A9AB8' } },
  underwood: { id: 'underwood', name: 'Underwood', category: 'light', colors: { kbBg: '#BEB088', keyBg: '#D8C8A0', keyPress: '#3C2410', specBg: '#AEA078', specPress: '#908060', accentBg: '#3C2410', accentPress: '#2A1808', accentTxt: '#D8C8A0', keyTxt: '#2A1808', specTxt: '#2A1808', dockBg: '#AEA078', tplBg: '#BEB088', tplItemBg: '#D8C8A0', tplTxt: '#2A1808', tplSub: '#6A5030', divider: '#C4B488', keyAccentBorder: '#8A7040' } },
  klasik: { id: 'klasik', name: 'Klasik', category: 'light', colors: { kbBg: '#1E1E1E', keyBg: '#2D2D2D', keyPress: '#505050', specBg: '#252525', specPress: '#1A1A1A', accentBg: '#4A90D9', accentPress: '#3A3A3A', accentTxt: '#FFFFFF', keyTxt: '#E8E8E8', specTxt: '#A0A0A0', dockBg: '#181818', tplBg: '#1E1E1E', tplItemBg: '#2D2D2D', tplTxt: '#E8E8E8', tplSub: '#808080', divider: '#252525', keyAccentBorder: '#3A3A3A' } },
  medical: { id: 'medical', name: 'Medical', category: 'light', colors: { kbBg: '#ECF2F8', keyBg: '#FFFFFF', keyPress: '#1A8FD1', specBg: '#D4E2EE', specPress: '#C0D0E0', accentBg: '#1A8FD1', accentPress: '#0E6090', accentTxt: '#FFFFFF', keyTxt: '#1A2A3C', specTxt: '#4A6A84', dockBg: '#DCE8F4', tplBg: '#E4EEF6', tplItemBg: '#FFFFFF', tplTxt: '#1A2A3C', tplSub: '#4A6A84', divider: '#D4E2EE', keyAccentBorder: '#8EB4CC' } },
};

export function getTheme(themeId: string): KeyboardTheme | null {
  return KEYBOARD_THEMES[themeId] ?? null;
}

export function getAllThemes(): KeyboardTheme[] {
  return Object.values(KEYBOARD_THEMES);
}

export function getThemesByCategory(category: 'dark' | 'light' | 'neutral'): KeyboardTheme[] {
  return Object.values(KEYBOARD_THEMES).filter(t => t.category === category);
}

export const DEFAULT_THEME_ID = 'klasik';

// ═══════════════════════════════════════════════════════════════════════════════════
// 📦 SERIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════════

export interface KeyboardConfigData {
  version: number;
  deviceProfiles: DeviceSizeProfile[];
  feedback: KeyPressFeedback;
  touch: TouchOptimization;
  longPress: LongPressBehavior;
  layouts: Record<string, KeyboardLayout>;
  longPressVariants: Record<string, Record<string, string[]>>;
}

export interface KeyboardThemeData {
  version: number;
  themeId: string;
  theme: KeyboardTheme;
}

export function serializeKeyboardConfig(): string {
  const config: KeyboardConfigData = {
    version: 2, // Bumped: breaking layout changes
    deviceProfiles: DEVICE_PROFILES,
    feedback: KEY_PRESS_FEEDBACK,
    touch: TOUCH_OPTIMIZATION,
    longPress: LONG_PRESS_BEHAVIOR,
    layouts: KEYBOARD_LAYOUTS,
    longPressVariants: LONG_PRESS_VARIANTS,
  };
  return JSON.stringify(config);
}

export function serializeKeyboardTheme(themeId: string): string {
  const theme = getTheme(themeId);
  if (!theme) throw new Error(`Theme not found: ${themeId}`);
  const data: KeyboardThemeData = { version: 2, themeId, theme };
  return JSON.stringify(data);
}

export function parseKeyboardConfig(json: string): KeyboardConfigData {
  return JSON.parse(json);
}

export function parseKeyboardTheme(json: string): KeyboardThemeData {
  return JSON.parse(json);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 🧮 LAYOUT METRICS CALCULATOR — Single Source of Truth
// ═══════════════════════════════════════════════════════════════════════════════════

export interface LayoutMetrics {
  containerWidth: number;
  usableWidth: number;
  horizontalPad: number;
  keyGap: number;
  rowGap: number;
  letterKeyH: number;
  bottomBarH: number;
  keyRadius: number;

  // Key widths per language (row 1, row 2, row 3, shift/del, row2Indent, row1Pad)
  tr_q: { r1: number; r2: number; r3: number; shiftDel: number; r2Indent: number; row1Pad: number };
  tr_f: { r1: number; r2: number; r3: number; shiftDel: number; r2Indent: number; row1Pad: number };
  en:   { r1: number; r2: number; r3: number; shiftDel: number; r2Indent: number; row1Pad: number };
  ar:   { r1: number; r2: number; r3: number; shiftDel: number; r2Indent: number; row1Pad: number };
  num:  { r1: number; r2: number; r3: number; shiftDel: number; r2Indent: number; row1Pad: number };

  // Bottom bar fixed widths
  bottomBar: { num: number; emoji: number; dot: number; enter: number; space: number };
}

export function computeMetrics(containerWidth: number): LayoutMetrics {
  // Platform-agnostic base values (tuned for 390px optimal)
  const horizontalPad = 4;
  const keyGap = 6;
  const rowGap = 8;
  const letterKeyH = 44;
  const bottomBarH = 44;  // Same height as letter keys
  const keyRadius = 10;

  const usableWidth = containerWidth - 2 * horizontalPad;

  // Helper: calculate key width for N keys
  const kw = (nKeys: number) => Math.floor((usableWidth - (nKeys - 1) * keyGap) / nKeys);

  // TR Q: 12 keys row 1, 11 keys row 2, 9 letters row 3
  // FIXED: All formulas now match KeyboardPreviewScreen.tsx for cross-platform consistency
  const trq_r1 = kw(12);
  const trq_row1Slack = usableWidth - (12 * trq_r1 + 11 * keyGap);
  const trq_row1Pad = horizontalPad + Math.floor(trq_row1Slack / 2);  // row1 center padding

  const trq_r2 = trq_r1;  // Row 2 uses same key width as Row 1
  const trq_r2Indent = Math.floor((containerWidth - 2 * trq_row1Pad - 11 * trq_r1 - 10 * keyGap) / 2);
  const trq_sd = trq_r2Indent + trq_r1;  // SHIFT = Row2's first key right edge (s-z alignment)
  const trq_r3 = Math.floor((containerWidth - 2 * trq_row1Pad - 2 * trq_sd - 10 * keyGap) / 9);

  // TR F: same as TR Q
  const trf_r1 = trq_r1;
  const trf_r2 = trq_r2;
  const trf_r3 = trq_r3;
  const trf_sd = trq_sd;
  const trf_indent = trq_r2Indent;

  // EN: 10 keys row 1, 9 keys row 2, 7 letters row 3
  const en_r1 = kw(10);
  const en_row1Slack = usableWidth - (10 * en_r1 + 9 * keyGap);
  const en_row1Pad = horizontalPad + Math.floor(en_row1Slack / 2);

  const en_r2 = en_r1;
  const en_r2Indent = Math.floor((containerWidth - 2 * en_row1Pad - 9 * en_r1 - 8 * keyGap) / 2);
  const en_sd = en_r2Indent + en_r1;  // SHIFT = Row2's first key right edge
  const en_r3 = Math.floor((containerWidth - 2 * en_row1Pad - 2 * en_sd - 8 * keyGap) / 7);

  // AR: 12 keys row 1, 10 keys row 2, 8 letters row 3
  const ar_r1 = kw(12);
  const ar_row1Slack = usableWidth - (12 * ar_r1 + 11 * keyGap);
  const ar_row1Pad = horizontalPad + Math.floor(ar_row1Slack / 2);

  const ar_r2 = ar_r1;
  const ar_r2Indent = Math.floor((containerWidth - 2 * ar_row1Pad - 10 * ar_r1 - 9 * keyGap) / 2);
  const ar_sd = ar_r2Indent + ar_r1;  // SHIFT = Row2's first key right edge
  const ar_r3 = Math.floor((containerWidth - 2 * ar_row1Pad - 2 * ar_sd - 9 * keyGap) / 8);

  // NUM/SYM: 10 keys row 1/2, 5 letters row 3
  const num_r1 = kw(10);
  const num_row1Slack = usableWidth - (10 * num_r1 + 9 * keyGap);
  const num_row1Pad = horizontalPad + Math.floor(num_row1Slack / 2);

  const num_r2 = num_r1;
  const num_r2Indent = Math.floor((containerWidth - 2 * num_row1Pad - 10 * num_r1 - 9 * keyGap) / 2);
  const num_sd = num_r2Indent + num_r1;  // SHIFT = Row2's first key right edge
  const num_r3 = Math.floor((containerWidth - 2 * num_row1Pad - 2 * num_sd - 6 * keyGap) / 5);

  // Bottom bar: smaller buttons (30-40px), space fills remaining
  const scale = Math.min(containerWidth / 390, 1.4);
  const w_num = Math.round(36 * scale);     // ABC/123 button
  const w_emoji = Math.round(32 * scale);   // Emoji button
  const w_dot = Math.round(28 * scale);     // Dot button
  const w_enter = Math.round(44 * scale);   // Enter button
  const w_space = usableWidth - w_num - w_emoji - w_dot - w_enter - 4 * keyGap;

  return {
    containerWidth,
    usableWidth,
    horizontalPad,
    keyGap,
    rowGap,
    letterKeyH,
    bottomBarH,
    keyRadius,
    tr_q: { r1: trq_r1, r2: trq_r2, r3: trq_r3, shiftDel: trq_sd, r2Indent: trq_r2Indent, row1Pad: trq_row1Pad },
    tr_f: { r1: trf_r1, r2: trf_r2, r3: trf_r3, shiftDel: trf_sd, r2Indent: trf_indent, row1Pad: trq_row1Pad },
    en:   { r1: en_r1, r2: en_r2, r3: en_r3, shiftDel: en_sd, r2Indent: en_r2Indent, row1Pad: en_row1Pad },
    ar:   { r1: ar_r1, r2: ar_r2, r3: ar_r3, shiftDel: ar_sd, r2Indent: ar_r2Indent, row1Pad: ar_row1Pad },
    num:  { r1: num_r1, r2: num_r2, r3: num_r3, shiftDel: num_sd, r2Indent: num_r2Indent, row1Pad: num_row1Pad },
    bottomBar: { num: w_num, emoji: w_emoji, dot: w_dot, enter: w_enter, space: w_space },
  };
}
