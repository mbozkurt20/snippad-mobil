// ── Single source of truth for keyboard layout, weights & sizes ───────────────
// Both the preview (KeyboardPreviewScreen) and native extensions (Android/iOS)
// derive all layout config from here via the keyboard_data JSON.

// ── Rows ─────────────────────────────────────────────────────────────────────
// Updated to match keyboardLayout.ts responsive design
// ğ and ü moved to long-press on g and u (matches Apple TR keyboard)

export const TR_Q_ROW1 = ['q','w','e','r','t','y','u','ı','o','p','ğ','ü'];  // 12 keys (ı = dotless i)
export const TR_Q_ROW2 = ['a','s','d','f','g','h','j','k','l','ş','i'];  // 11 keys (j not i)
export const TR_Q_ROW3 = ['z','x','c','v','b','n','m','ö','ç'];  // 9 keys (+ shift/delete)

export const TR_F_ROW1 = ['f','g','ğ','ı','o','d','r','n','h','p'];  // 10 keys
export const TR_F_ROW2 = ['u','i','e','a','ü','t','k','m','l','y','ş'];  // 11 keys
export const TR_F_ROW3 = ['j','ö','v','c','ç','z','s','b'];  // 8 keys (+ shift/delete)

export const EN_ROW1 = ['q','w','e','r','t','y','u','i','o','p'];  // 10 keys
export const EN_ROW2 = ['a','s','d','f','g','h','j','k','l'];  // 9 keys
export const EN_ROW3 = ['z','x','c','v','b','n','m'];  // 7 keys (+ shift/delete)

// ── Arabic (Standard phonetic layout) ─────────────────────────────────────────
export const AR_ROW1 = ['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د'];
export const AR_ROW2 = ['ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط'];
export const AR_ROW3 = ['ئ','ء','ؤ','ر','ى','ة','و','ز','ظ'];

export const AR_LONG_PRESS: Record<string, string[]> = {
  'ا': ['أ','إ','آ','ٱ'],
  'و': ['ؤ'],
  'ي': ['ئ','ى'],
  'ه': ['ة'],
  'ل': ['لا','لأ','لإ','لآ'],
};

export const BOTTOM_ROW  = ['NUM','EMOJI','SPACE','.','ENTER'];
export const NUM_ROW1 = ['[',']','{','}','#','%','^','*','+','='];
export const NUM_ROW2 = ['-','\\','|','~','<','>','€','$','£','.'];
export const NUM_ROW3 = ['=','"',"'",':', '!','?'];
export const NUM_BOTTOM  = ['ABC','EMOJI','SPACE','.','ENTER'];
export const EMOJI_BOTTOM = ['ABC','DEL','SPACE','ENTER'];

// ── Long press variants ───────────────────────────────────────────────────────

export const TR_LONG_PRESS: Record<string, string[]> = {
  g: ['ğ'],
  u: ['ü','û','ù','ú','ū'],
  s: ['ş'],
  ı: ['i','î','ì','í','ï'],
  i: ['ì','í','î','ï','ī','į','ĩ','ı'],
  o: ['ö','ô','ò','ó','õ','ø'],
  c: ['ç'],
  a: ['â','à','á','ä','å','ã','æ'],
  e: ['ê','è','é','ë','ě'],
  n: ['ñ'],
};

export const EN_LONG_PRESS: Record<string, string[]> = {
  a: ['à','á','â','ä','å','ã','æ'],
  e: ['è','é','ê','ë','ě'],
  i: ['ì','í','î','ï','ī','į','ĩ','ı'],
  o: ['ò','ó','ô','ö','õ','ø'],
  u: ['ù','ú','û','ü','ū'],
  c: ['ç'],
  n: ['ñ'],
  s: ['ß'],
};

// ── Key weights (flex ratios) ─────────────────────────────────────────────────
// These values are the source of truth for both preview and extensions.

export const KEY_WEIGHTS: Record<string, number> = {
  SPACE: 5.8,
  SHIFT: 2.0,
  DEL:   2.0,
  ENTER: 1.7,
  NUM:   1.3,
  ABC:   1.3,
  EMOJI: 1.0,
  MIC:   1.0,
  '.':   0.9,
};

export function keyWeight(k: string): number {
  return KEY_WEIGHTS[k] ?? 1.0;
}

// ── Row & dock heights (dp / logical pixels) ─────────────────────────────────

export const ROW_HEIGHTS = {
  letter:   52,   // letter rows — matches Gboard 52dp tap target
  bottom:   58,   // bottom row — matches Gboard 58dp
  dock:     50,   // category dock bar
  template: 56,   // template list rows
};

// ── Uppercase map for special chars (standard toUpperCase gives wrong result) ──
// Used by extensions to avoid locale-dependent bugs (e.g. ı → İ in Turkish)

export const TR_UPPERCASE_MAP: Record<string, string> = {
  'ı': 'İ', 'ğ': 'Ğ', 'ş': 'Ş', 'ö': 'Ö', 'ç': 'Ç', 'ü': 'Ü', 'i': 'İ',
};

// ── Turkish vowel set (for vowel highlight feature) ───────────────────────────

export const TR_VOWELS = new Set(['a','e','ı','i','o','ö','u','ü']);
export const EN_VOWELS = new Set(['a','e','i','o','u']);

// ── Helpers ──────────────────────────────────────────────────────────────────

export type ResolvedRows = {
  row1: string[];
  row2: string[];
  row3: string[];
  row4: string[];
  longPress: Record<string, string[]>;
};

export function resolveLayout(layout: string, language: string): ResolvedRows {
  if (language === 'en') {
    return { row1: EN_ROW1, row2: EN_ROW2, row3: EN_ROW3, row4: BOTTOM_ROW, longPress: EN_LONG_PRESS };
  }
  if (language === 'ar') {
    return { row1: AR_ROW1, row2: AR_ROW2, row3: AR_ROW3, row4: BOTTOM_ROW, longPress: AR_LONG_PRESS };
  }
  if (layout === 'f') {
    return { row1: TR_F_ROW1, row2: TR_F_ROW2, row3: TR_F_ROW3, row4: BOTTOM_ROW, longPress: TR_LONG_PRESS };
  }
  return { row1: TR_Q_ROW1, row2: TR_Q_ROW2, row3: TR_Q_ROW3, row4: BOTTOM_ROW, longPress: TR_LONG_PRESS };
}
